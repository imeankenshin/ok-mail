type Result<T, E> = Readonly<[T, null] | [null, E]>;

type MaybePromise<T> = T | Promise<T>;

/**
 * Try catch a callback function.
 * @param fn Callback function
 * @returns Result of the callback function
 */
export async function tryCatch<T, E = Error>(
  fn: () => Promise<T>
): Promise<Result<T, E>>;
export function tryCatch<T, E = Error>(fn: () => T): Result<T, E>;
export function tryCatch<T, E = Error>(
  fn: () => T | Promise<T>
): MaybePromise<Result<T, E>> {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then((value) => [value, null] as const)
        .catch((error) => [null, error as E] as const);
    }
    return [result, null];
  } catch (error) {
    return [null, error as E];
  }
}

/**
 * `tryCatcch`, but for those who don't care about the return value.
 * @param fn Callback function
 * @returns Error if failed, null if succeeded
 */
export async function tryCatchCallback<E = Error>(
  fn: () => Promise<void>
): Promise<E | null>;
export function tryCatchCallback<E = Error>(fn: () => void): E | null;
export function tryCatchCallback<E = Error>(
  fn: () => MaybePromise<void>
): MaybePromise<E | null> {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(() => null).catch((error) => error as E);
    }
    return null;
  } catch (error) {
    return error as E;
  }
}
