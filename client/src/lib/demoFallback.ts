export interface DemoFallbackOptions {
  isDemoMode?: boolean;
  timeoutMs?: number;
  label?: string;
  onFallback?: (reason: string) => void;
}

export interface DemoFallbackResult<T> {
  data: T;
  source: 'live' | 'demo-fallback';
  reason?: string;
}

const DEFAULT_TIMEOUT_MS = 8000;

function resolveMock<T>(mockData: T | (() => T)): T {
  return typeof mockData === 'function' ? (mockData as () => T)() : mockData;
}

/**
 * Wraps any async API or LLM call so live demos never crash on timeouts (>8s),
 * rate limits, or offline backends.
 */
export async function withDemoFallback<T>(
  liveFn: (signal: AbortSignal) => Promise<T>,
  mockData: T | (() => T),
  options: DemoFallbackOptions = {}
): Promise<DemoFallbackResult<T>> {
  const {
    isDemoMode = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    onFallback,
  } = options;

  if (isDemoMode) {
    const reason = 'Demo Mode active';
    onFallback?.(reason);
    return {
      data: resolveMock(mockData),
      source: 'demo-fallback',
      reason,
    };
  }

  const controller = new AbortController();
  let timerId: ReturnType<typeof setTimeout> | undefined;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(() => {
        controller.abort();
        reject(new Error(`Request timed out after ${timeoutMs / 1000}s`));
      }, timeoutMs);
    });

    const data = await Promise.race([liveFn(controller.signal), timeoutPromise]);
    return { data, source: 'live' };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Live endpoint unavailable';
    const isRateLimit = message.includes('429') || message.toLowerCase().includes('rate');
    const reason = isRateLimit
      ? 'Rate limit hit — serving cached demo response'
      : message;

    onFallback?.(reason);
    return {
      data: resolveMock(mockData),
      source: 'demo-fallback',
      reason,
    };
  } finally {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
  }
}
