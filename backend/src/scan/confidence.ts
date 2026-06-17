export interface ConfidenceInput {
  geminiConfidence: number;
  mappingConfidence: number;
  nutritionIsVerified: boolean;
  sourceRef: string | null;
}

export function calculateConfidence(input: ConfidenceInput): number {
  const g = input.geminiConfidence * 0.40;
  const m = (input.mappingConfidence ?? 0) * 0.35;
  const n = (input.nutritionIsVerified ? 1.0 : 0.2) * 0.25;
  return Math.round((g + m + n) * 100) / 100;
}
