export function useAsync() {
  const isPending = ref(false);
  const start = async (callback: () => Promise<void>) => {
    isPending.value = true;
    try {
      await callback();
    } finally {
      isPending.value = false;
    }
  };
  return [start, isPending] as const;
}
