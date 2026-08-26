export async function registerReadOnlyTool(tool) {
  const status = document.querySelector('[data-webmcp-status]');
  const log = document.querySelector('[data-agent-log]');

  if (!('modelContext' in document)) {
    if (status) {
      status.textContent = 'WebMCP unavailable in this browser';
      status.dataset.state = 'unsupported';
    }
    window.__ONE_WEBMCP__ = { supported: false, registered: [] };
    return false;
  }

  try {
    await document.modelContext.registerTool({
      ...tool,
      annotations: { readOnlyHint: true, ...(tool.annotations || {}) },
      execute: async (input, options) => {
        if (options?.signal?.aborted) throw new DOMException('Tool execution was cancelled', 'AbortError');
        const result = await tool.execute(input ?? {}, options ?? {});
        if (log) {
          const when = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          log.innerHTML = `<strong>${escapeHtml(tool.title || tool.name)}</strong> ran at ${escapeHtml(when)}<br><span>${escapeHtml(summarise(result))}</span>`;
          log.dataset.state = 'active';
        }
        window.dispatchEvent(new CustomEvent('one:webmcp-executed', { detail: { tool: tool.name, input: input ?? {}, result } }));
        return result;
      }
    });
    if (status) {
      status.textContent = `Site Tool ready · ${tool.name}`;
      status.dataset.state = 'ready';
    }
    window.__ONE_WEBMCP__ = { supported: true, registered: [tool.name] };
    return true;
  } catch (error) {
    console.error('[ONE WebMCP] registration failed', error);
    if (status) {
      status.textContent = `WebMCP registration failed · ${error?.name || 'Error'}`;
      status.dataset.state = 'error';
    }
    window.__ONE_WEBMCP__ = { supported: true, registered: [], error: String(error) };
    return false;
  }
}

function summarise(value) {
  if (typeof value === 'string') return value;
  try { const text = JSON.stringify(value); return text.length > 180 ? `${text.slice(0, 177)}…` : text; }
  catch { return String(value); }
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
