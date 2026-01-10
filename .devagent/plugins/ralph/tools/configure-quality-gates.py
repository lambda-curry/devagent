#!/usr/bin/env python3
"""Select and write a quality-gate configuration for Ralph."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable


TEMPLATE_DIR = Path(__file__).resolve().parents[1] / "quality-gates"


def detect_template(project_root: Path) -> Path:
    if (project_root / "pyproject.toml").exists() or (project_root / "requirements.txt").exists():
        return TEMPLATE_DIR / "python.json"
    if (project_root / "tsconfig.json").exists():
        return TEMPLATE_DIR / "typescript.json"
    if (project_root / "package.json").exists():
        return TEMPLATE_DIR / "javascript.json"
    return TEMPLATE_DIR / "browser-testing.json"


def configure_quality_gates(project_root: Path, output_path: Path) -> dict[str, object]:
    template_path = detect_template(project_root)
    template = json.loads(template_path.read_text(encoding="utf-8"))
    payload = {
        "template": template["name"],
        "commands": template.get("commands", {}),
        "browser_requirements": template.get("browser_requirements", []),
        "source_template": str(template_path),
    }
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return payload


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path.cwd(),
        help="Root of the project to inspect",
    )
    parser.add_argument(
        "--output",
        type=Path,
        required=True,
        help="Path to write the configured quality gates",
    )
    return parser


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    configure_quality_gates(args.project_root, args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
