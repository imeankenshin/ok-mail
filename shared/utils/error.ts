type Result<T, E> = Readonly<[T, null] | [null, E]>;

export async function tryCatch<T, E = Error>(fn: () => Promise<T>): Promise<Result<T, E>>;
export function tryCatch<T, E = Error>(fn: () => T): Result<T, E>;
export function tryCatch<T, E = Error>(fn: () => T | Promise<T>): Result<T, E> | Promise<Result<T, E>> {
  try {
    const result = fn();
    if (result instanceof Promise) {
      const returnValue = result.then(value => [value, null] as const).catch(error => [null, error as E] as const);
      return returnValue;
    }
    return [result, null];
  } catch (error) {
    return [null, error as E];
  }
}
