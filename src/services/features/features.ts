export function useFeature(env: Record<string, any>, key: string) {
  return env?.features?.value
    ? env?.features?.value?.includes(key) ?? false
    : false;
}
