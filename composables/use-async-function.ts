export function useAsyncFunction() {
  const isPending = ref(false);
  const isReady = computed(() => !isPending.value);
  const start = async (callback: () => Promise<void>) => {
    isPending.value = true;
    try {
      await callback();
    } finally {
      isPending.value = false;
    }
  };
  return { start, isPending, isReady };
}
