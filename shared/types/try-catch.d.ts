export type Success<T> = {
  error: null;
  data: T;
};
export type Failure<E> = {
  error: E;
  data: null;
};

export type Result<T, E> = Success<T> | Failure<E>;
