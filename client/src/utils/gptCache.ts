
const cache: Record<string, string> = {};

export function makeCacheKey(questionId: string, userAnswer: string) {
  return `${questionId}__${userAnswer}`;
}

export function getCachedExplanation(key: string): string | undefined {
  return cache[key];
}

export function setCachedExplanation(key: string, explanation: string) {
  cache[key] = explanation;
}
