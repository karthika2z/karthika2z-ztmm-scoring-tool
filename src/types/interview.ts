// Interview mode types for audio-based assessment

export interface InterviewQuestion {
  id: string;
  pillarId: string;
  dimensionId?: string;
  question: string;
  context: string;
  maturityIndicators: {
    traditional: string[];
    initial: string[];
    advanced: string[];
    optimal: string[];
  };
}

export interface InterviewResponse {
  questionId: string;
  audioBlob?: Blob;
  audioUrl?: string;
  transcript?: string;
  detectedMaturityLevel?: string;
  confidence?: number;
  timestamp: string;
  duration: number;
}

export interface InterviewSession {
  sessionId: string;
  customerName: string;
  cloudProviders: string[];
  startedAt: string;
  completedAt?: string;
  responses: Record<string, InterviewResponse>;
  currentQuestionIndex: number;
  status: 'in-progress' | 'completed' | 'processing';
}

export interface AIProcessingRequest {
  transcript: string;
  question: InterviewQuestion;
  context?: string;
}

export interface AIProcessingResponse {
  maturityLevel: 'traditional' | 'initial' | 'advanced' | 'optimal';
  confidence: number;
  reasoning: string;
  extractedEvidence: string[];
}
