"""Plugin interface definitions for DevAgent plugins."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


class PluginManifestError(ValueError):
    """Raised when a plugin manifest is missing required fields or is invalid."""


@dataclass(frozen=True)
class PluginManifest:
    """Normalized plugin manifest used by the plugin manager."""

    name: str
    version: str
    description: str
    root_path: Path
    manifest_path: Path
    workflows: list[str] = field(default_factory=list)
    commands: list[str] = field(default_factory=list)
    tools: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


REQUIRED_FIELDS = ("name", "version")


def _normalize_list(value: Any, label: str) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value]
    raise PluginManifestError(f"{label} must be a list")


def load_plugin_manifest(manifest_path: Path) -> PluginManifest:
    """Load and validate a plugin manifest from disk."""
    if not manifest_path.exists():
        raise PluginManifestError(f"Manifest not found: {manifest_path}")

    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    for field in REQUIRED_FIELDS:
        if not data.get(field):
            raise PluginManifestError(f"Missing required field '{field}' in {manifest_path}")

    root_path = manifest_path.parent
    workflows = _normalize_list(data.get("workflows"), "workflows")
    commands = _normalize_list(data.get("commands"), "commands")
    tools = _normalize_list(data.get("tools"), "tools")

    metadata = {
        key: value
        for key, value in data.items()
        if key not in {"workflows", "commands", "tools"}
    }

    return PluginManifest(
        name=str(data["name"]),
        version=str(data["version"]),
        description=str(data.get("description", "")),
        root_path=root_path,
        manifest_path=manifest_path,
        workflows=workflows,
        commands=commands,
        tools=tools,
        metadata=metadata,
    )
