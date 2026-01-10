"""Plugin registry management for DevAgent."""

from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path
from typing import Any

from .plugin_interface import PluginManifest, PluginManifestError, load_plugin_manifest


class PluginRegistryError(RuntimeError):
    """Raised when registry operations fail."""


class PluginManager:
    """Manages plugin discovery and installation registry."""

    def __init__(self, registry_path: Path) -> None:
        self.registry_path = registry_path

    def _ensure_registry(self) -> None:
        if self.registry_path.exists():
            return
        self.registry_path.write_text(
            json.dumps({"installed": []}, indent=2),
            encoding="utf-8",
        )

    def _load_registry(self) -> dict[str, Any]:
        self._ensure_registry()
        return json.loads(self.registry_path.read_text(encoding="utf-8"))

    def _save_registry(self, registry: dict[str, Any]) -> None:
        self.registry_path.write_text(
            json.dumps(registry, indent=2, sort_keys=True),
            encoding="utf-8",
        )

    def list_installed(self) -> list[dict[str, Any]]:
        registry = self._load_registry()
        return list(registry.get("installed", []))

    def register(self, plugin: PluginManifest) -> None:
        registry = self._load_registry()
        installed = registry.setdefault("installed", [])
        installed = [item for item in installed if item.get("name") != plugin.name]
        installed.append(
            {
                "name": plugin.name,
                "version": plugin.version,
                "path": str(plugin.root_path),
            }
        )
        registry["installed"] = sorted(installed, key=lambda item: item["name"])
        self._save_registry(registry)

    def unregister(self, name: str) -> None:
        registry = self._load_registry()
        installed = registry.get("installed", [])
        registry["installed"] = [item for item in installed if item.get("name") != name]
        self._save_registry(registry)

    def discover(self, plugins_root: Path) -> list[PluginManifest]:
        if not plugins_root.exists():
            return []
        manifests: list[PluginManifest] = []
        for plugin_dir in sorted(plugins_root.iterdir()):
            if not plugin_dir.is_dir():
                continue
            manifest_path = plugin_dir / "plugin.json"
            if not manifest_path.exists():
                continue
            try:
                manifests.append(load_plugin_manifest(manifest_path))
            except PluginManifestError as exc:
                raise PluginRegistryError(str(exc)) from exc
        return manifests

    def sync_registry(self, plugins_root: Path) -> list[PluginManifest]:
        manifests = self.discover(plugins_root)
        registry = {"installed": []}
        for manifest in manifests:
            registry["installed"].append(
                {
                    "name": manifest.name,
                    "version": manifest.version,
                    "path": str(manifest.root_path),
                }
            )
        registry["installed"] = sorted(registry["installed"], key=lambda item: item["name"])
        self._save_registry(registry)
        return manifests

    def load_installed(self, name: str) -> PluginManifest:
        registry = self._load_registry()
        for item in registry.get("installed", []):
            if item.get("name") == name:
                manifest_path = Path(item["path"]) / "plugin.json"
                return load_plugin_manifest(manifest_path)
        raise PluginRegistryError(f"Plugin not registered: {name}")


def serialize_manifest(manifest: PluginManifest) -> dict[str, Any]:
    data = asdict(manifest)
    data["root_path"] = str(manifest.root_path)
    data["manifest_path"] = str(manifest.manifest_path)
    return data
