type Result<T, E> = [T, null] | [null, E];

export async function tryCatch<T, E = Error>(fn: () => Promise<T>): Promise<Result<T, E>>;
export function tryCatch<T, E = Error>(fn: () => T): Result<T, E>;
export function tryCatch<T, E = Error>(fn: () => T | Promise<T>): Result<T, E> | Promise<Result<T, E>> {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(value => [value, null]);
    }
    return [result, null];
  } catch (error) {
    return [null, error as E];
  }
}
