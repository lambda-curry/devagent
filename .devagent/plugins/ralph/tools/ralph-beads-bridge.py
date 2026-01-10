#!/usr/bin/env python3
"""Utilities for Ralph to interact with Beads via the bd CLI."""

from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any


class BeadsCommandError(RuntimeError):
    """Raised when a Beads command fails."""


@dataclass(frozen=True)
class BeadsTask:
    id: str
    title: str
    status: str
    metadata: dict[str, Any]


def _run_bd(args: list[str], cwd: Path | None = None) -> str:
    command = ["bd", *args]
    try:
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            cwd=cwd,
        )
    except FileNotFoundError as exc:
        raise BeadsCommandError("bd CLI not found in PATH") from exc
    except subprocess.CalledProcessError as exc:
        raise BeadsCommandError(exc.stderr or exc.stdout) from exc
    return result.stdout


def ready_tasks(project: str | None = None) -> list[BeadsTask]:
    args = ["ready", "--json"]
    if project:
        args.extend(["--project", project])
    output = _run_bd(args)
    payload = json.loads(output)
    tasks = []
    for item in payload.get("tasks", payload):
        tasks.append(
            BeadsTask(
                id=item.get("id", ""),
                title=item.get("title", ""),
                status=item.get("status", ""),
                metadata=item,
            )
        )
    return tasks


def update_status(task_id: str, status: str) -> None:
    _run_bd(["update", task_id, "--status", status])


def add_comment(task_id: str, comment: str) -> None:
    _run_bd(["comment", task_id, "--body", comment])
