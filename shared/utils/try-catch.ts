import type { Result } from "#shared/types/try-catch";

/**
 * Try catch a callback function.
 * @param throwable The value that may throw error while processing
 * @returns Result of the callback function
 */
export async function tryCatch<T, E = Error>(
  throwable: Promise<T>
): Promise<Result<T, E>> {
  try {
    const result = await throwable;
    return { error: null, data: result };
  } catch (error) {
    return { error: error as E, data: null };
  }
}
