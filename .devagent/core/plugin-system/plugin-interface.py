"""Compatibility wrapper for plugin interface definitions."""

from .plugin_interface import (  # noqa: F401
    PluginManifest,
    PluginManifestError,
    load_plugin_manifest,
)

__all__ = [
    "PluginManifest",
    "PluginManifestError",
    "load_plugin_manifest",
]
