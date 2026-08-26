# Foundation architecture

The first build gate uses four independent top-level origins: Mission Board, Northstar Broadband, BoxFox Removals and Evergreen Energy.

Each origin owns its page and registers its own read-only WebMCP tool using the current `document.modelContext.registerTool()` API. No provider calls another provider. The browser agent is the future cross-site orchestration layer.
