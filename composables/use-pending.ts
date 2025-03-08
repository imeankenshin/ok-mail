export function useAsync() {
  const isPending = ref(false);
  const start = (callback: () => Promise<void>) => {
    isPending.value = true;
    callback().finally(() => {
      isPending.value = false;
    });
  };
  return [start, isPending] as const;
}
