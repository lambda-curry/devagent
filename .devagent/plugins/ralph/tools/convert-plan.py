#!/usr/bin/env python3
"""Convert a DevAgent plan markdown file into a Beads-compatible JSON payload."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable


TASK_HEADER_RE = re.compile(r"^#### Task (?P<number>\d+): (?P<title>.+)$", re.MULTILINE)
SECTION_HEADER_RE = re.compile(r"^### Implementation Tasks$", re.MULTILINE)


@dataclass(frozen=True)
class PlanTask:
    number: int
    title: str
    objective: str
    acceptance_criteria: list[str]
    dependencies: list[int]
    subtasks: list[str]


def _extract_section(text: str) -> str:
    match = SECTION_HEADER_RE.search(text)
    if not match:
        raise ValueError("Implementation Tasks section not found")
    start = match.end()
    next_section = re.search(r"^### ", text[start:], re.MULTILINE)
    end = start + next_section.start() if next_section else len(text)
    return text[start:end].strip()


def _extract_block(section: str, label: str) -> str:
    pattern = rf"- \*\*{re.escape(label)}:\*\*(?P<body>.*?)(?=^- \*\*|^#### Task|\Z)"
    match = re.search(pattern, section, re.DOTALL | re.MULTILINE)
    return match.group("body").strip() if match else ""


def _extract_list(block: str) -> list[str]:
    items = []
    for line in block.splitlines():
        cleaned = line.strip()
        if cleaned.startswith("-"):
            items.append(cleaned.lstrip("- ").strip())
    return items


def _extract_subtasks(section: str) -> list[str]:
    match = re.search(r"Subtasks\s*\(optional\):(?P<body>.*?)(?=^- \*\*|^#### Task|\Z)", section, re.DOTALL | re.MULTILINE)
    if not match:
        return []
    subtasks = []
    for line in match.group("body").splitlines():
        cleaned = line.strip()
        if re.match(r"^\d+\.\s+", cleaned):
            subtasks.append(re.sub(r"^\d+\.\s+", "", cleaned))
    return subtasks


def _parse_dependencies(block: str) -> list[int]:
    if not block or block.strip().lower() == "none":
        return []
    return [int(match) for match in re.findall(r"Task\s+(\d+)", block)]


def parse_tasks(text: str) -> list[PlanTask]:
    section = _extract_section(text)
    tasks: list[PlanTask] = []
    matches = list(TASK_HEADER_RE.finditer(section))
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(section)
        task_body = section[start:end].strip()
        objective = _extract_block(task_body, "Objective")
        acceptance_block = _extract_block(task_body, "Acceptance Criteria")
        dependencies_block = _extract_block(task_body, "Dependencies")
        acceptance_criteria = _extract_list(acceptance_block)
        dependencies = _parse_dependencies(dependencies_block)
        subtasks = _extract_subtasks(task_body)
        tasks.append(
            PlanTask(
                number=int(match.group("number")),
                title=match.group("title").strip(),
                objective=objective,
                acceptance_criteria=acceptance_criteria,
                dependencies=dependencies,
                subtasks=subtasks,
            )
        )
    if not tasks:
        raise ValueError("No tasks found in Implementation Tasks section")
    return tasks


def _generate_base_id(text: str) -> str:
    digest = hashlib.md5(text.encode("utf-8")).hexdigest()[:4]
    return f"bd-{digest}"


def _build_tasks(plan_title: str, tasks: list[PlanTask]) -> dict[str, list[dict[str, object]]]:
    base_id = _generate_base_id(plan_title)
    task_id_map = {task.number: f"{base_id}.{task.number}" for task in tasks}
    beads_tasks: list[dict[str, object]] = []
    for task in tasks:
        task_id = task_id_map[task.number]
        beads_tasks.append(
            {
                "id": task_id,
                "title": task.title,
                "description": task.objective,
                "acceptance_criteria": task.acceptance_criteria,
                "priority": "normal",
                "status": "ready",
                "parent_id": base_id,
                "depends_on": [task_id_map[number] for number in task.dependencies],
            }
        )
        for index, subtask in enumerate(task.subtasks, start=1):
            beads_tasks.append(
                {
                    "id": f"{task_id}.{index}",
                    "title": subtask,
                    "description": "",
                    "acceptance_criteria": [],
                    "priority": "normal",
                    "status": "ready",
                    "parent_id": task_id,
                    "depends_on": [],
                }
            )
    epic = {
        "id": base_id,
        "title": plan_title,
        "description": "",
        "status": "ready",
    }
    return {"epic": [epic], "tasks": beads_tasks}


def convert_plan(plan_path: Path, output_path: Path) -> dict[str, object]:
    text = plan_path.read_text(encoding="utf-8")
    plan_title_match = re.search(r"^#\s+(?P<title>.+)$", text, re.MULTILINE)
    plan_title = plan_title_match.group("title").strip() if plan_title_match else plan_path.stem
    tasks = parse_tasks(text)
    data = _build_tasks(plan_title, tasks)
    payload = {
        "metadata": {
            "source_plan": str(plan_path),
            "generated_at": datetime.utcnow().isoformat() + "Z",
        },
        "ralph_integration": {
            "ready_command": "bd ready",
            "status_updates": {
                "in_progress": "in_progress",
                "closed": "closed",
            },
            "progress_comments": True,
        },
        "epics": data["epic"],
        "tasks": data["tasks"],
    }
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return payload


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plan", type=Path, required=True, help="Path to plan markdown file")
    parser.add_argument(
        "--output",
        type=Path,
        required=True,
        help="Path to write Beads-compatible JSON payload",
    )
    return parser


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    convert_plan(args.plan, args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
