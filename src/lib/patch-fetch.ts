type PatchOpts = { timeoutMs?: number };

export function patchFetch(opts: PatchOpts = {}) {
  const { timeoutMs = 8000 } = opts;
  if ((globalThis as any).__fetch_patched__) return;
  const original = globalThis.fetch;

  async function timedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === "string" ? input : (input as any)?.url ?? String(input);
    const t0 = Date.now();

    // Abort after timeoutMs
    const ac = new AbortController();
    const userSignal = init?.signal;
    const timer = setTimeout(() => ac.abort(new Error(`Timeout ${timeoutMs}ms: ${url}`)), timeoutMs);
    const signal = userSignal ?? ac.signal;
    const nextInit = { ...init, signal };

    try {
      const res = await original(input as any, nextInit);
      const ms = Date.now() - t0;
      console.log(`[fetch] ${res.status} ${url} • ${ms}ms`);
      return res;
    } catch (err: any) {
      const ms = Date.now() - t0;
      console.warn(`[fetch] FAIL ${url} • ${ms}ms • ${err?.message ?? err}`);
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  (globalThis as any).__fetch_patched__ = true;
  (globalThis as any).fetch = timedFetch as any;
}
