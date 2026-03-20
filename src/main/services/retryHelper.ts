export interface RetryOptions {
  maxRetries?: number  // default 3
  baseDelay?: number   // default 1000ms
  maxDelay?: number    // default 10000ms
  signal?: AbortSignal // respect user cancellation
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, signal } = options
  let lastError: Error
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) throw new Error('Aborted')
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt === maxRetries) break
      // Don't retry on non-transient errors (400-level HTTP errors)
      if (error instanceof Error && error.message.includes('400')) break
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw lastError!
}
