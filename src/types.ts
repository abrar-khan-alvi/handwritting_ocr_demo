export interface DifficultWord {
  word: string;
  suggestion: string;
  context: string;
}

export interface OCRResult {
  transcribedText: string;
  formattedText: string;
  confidenceRating: 'HIGH' | 'MEDIUM' | 'LOW';
  detectedLanguage: string;
  difficultWords?: DifficultWord[];
}

export interface OCRResponse {
  success: boolean;
  result?: OCRResult;
  error?: string;
}
