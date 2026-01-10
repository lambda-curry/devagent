#!/usr/bin/env python3
"""Bridge DevAgent plans into Ralph autonomous execution using Beads."""

from __future__ import annotations

import argparse
import importlib.util
import json
import subprocess
from pathlib import Path
from typing import Iterable


TOOLS_DIR = Path(__file__).resolve().parent
PLUGIN_ROOT = TOOLS_DIR.parents[1]


def _load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    if not spec or not spec.loader:
        raise RuntimeError(f"Unable to load module from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def build_config(
    template_path: Path,
    beads_payload_path: Path,
    quality_gates_path: Path,
    output_path: Path,
) -> dict[str, object]:
    template = json.loads(template_path.read_text(encoding="utf-8"))
    template["beads_payload"] = str(beads_payload_path)
    template["quality_gates"] = str(quality_gates_path)
    output_path.write_text(json.dumps(template, indent=2), encoding="utf-8")
    return template


def run_autonomous(config_path: Path) -> None:
    ralph_path = TOOLS_DIR / "ralph.sh"
    subprocess.run([str(ralph_path), str(config_path)], check=False)


def execute(plan_path: Path, output_dir: Path, project_root: Path, execute: bool) -> dict[str, object]:
    output_dir.mkdir(parents=True, exist_ok=True)

    convert_module = _load_module(TOOLS_DIR / "convert-plan.py", "convert_plan")
    configure_module = _load_module(TOOLS_DIR / "configure-quality-gates.py", "configure_quality_gates")

    beads_payload_path = output_dir / "beads-payload.json"
    quality_gates_path = output_dir / "quality-gates.json"
    config_output_path = output_dir / "ralph-config.json"

    convert_module.convert_plan(plan_path, beads_payload_path)
    configure_module.configure_quality_gates(project_root, quality_gates_path)

    build_config(TOOLS_DIR / "config.json", beads_payload_path, quality_gates_path, config_output_path)

    if execute:
        run_autonomous(config_output_path)

    return {
        "beads_payload": str(beads_payload_path),
        "quality_gates": str(quality_gates_path),
        "config": str(config_output_path),
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plan", type=Path, required=True, help="Path to plan markdown file")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=PLUGIN_ROOT / "output",
        help="Directory for generated artifacts",
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path.cwd(),
        help="Project root used for quality gate detection",
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Invoke Ralph after preparing artifacts",
    )
    return parser


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    execute(args.plan, args.output_dir, args.project_root, args.execute)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
