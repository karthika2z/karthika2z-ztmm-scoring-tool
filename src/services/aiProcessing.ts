/**
 * AI Processing Service for Interview Responses
 *
 * This service handles:
 * 1. Audio transcription using OpenAI Whisper API
 * 2. Transcript analysis using GPT-4 to extract maturity levels
 *
 * Note: Requires OpenAI API key to be configured
 * For production, this should be handled by a backend service
 */

import type { InterviewQuestion, AIProcessingResponse } from '../types/interview';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_BASE = 'https://api.openai.com/v1';

/**
 * Transcribe audio to text using OpenAI Whisper API
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable.');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');

  try {
    const response = await fetch(`${OPENAI_API_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Transcription failed: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    throw new Error(`Failed to transcribe audio: ${(error as Error).message}`);
  }
}

/**
 * Analyze transcript to extract maturity level using GPT-4
 */
export async function analyzeTranscript(
  transcript: string,
  question: InterviewQuestion
): Promise<AIProcessingResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable.');
  }

  const systemPrompt = `You are an expert in Zero Trust maturity assessment. Your job is to analyze interview responses and determine the maturity level based on the ZTMM (Zero Trust Maturity Model).

The maturity levels are:
- Traditional: Legacy, perimeter-based security with minimal zero trust principles
- Initial: Beginning zero trust journey with basic implementations
- Advanced: Comprehensive zero trust controls with good coverage
- Optimal: Mature, automated zero trust architecture with continuous verification

Analyze the transcript and provide:
1. The maturity level (traditional, initial, advanced, or optimal)
2. Confidence score (0-100)
3. Reasoning for the assessment
4. Key evidence from the transcript

Respond in JSON format.`;

  const userPrompt = `Question: ${question.question}

Context: ${question.context}

Maturity Indicators:
- Traditional: ${question.maturityIndicators.traditional.join(', ')}
- Initial: ${question.maturityIndicators.initial.join(', ')}
- Advanced: ${question.maturityIndicators.advanced.join(', ')}
- Optimal: ${question.maturityIndicators.optimal.join(', ')}

Interview Response:
"${transcript}"

Analyze this response and determine the maturity level. Return JSON with:
{
  "maturityLevel": "traditional|initial|advanced|optimal",
  "confidence": <number 0-100>,
  "reasoning": "<explanation>",
  "extractedEvidence": ["<evidence 1>", "<evidence 2>", ...]
}`;

  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Analysis failed: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return {
      maturityLevel: result.maturityLevel,
      confidence: result.confidence,
      reasoning: result.reasoning,
      extractedEvidence: result.extractedEvidence || []
    };
  } catch (error) {
    throw new Error(`Failed to analyze transcript: ${(error as Error).message}`);
  }
}

/**
 * Process audio response: transcribe and analyze
 */
export async function processAudioResponse(
  audioBlob: Blob,
  question: InterviewQuestion,
  onProgress?: (stage: string) => void
): Promise<{ transcript: string; analysis: AIProcessingResponse }> {
  // Step 1: Transcribe
  if (onProgress) onProgress('Transcribing audio...');
  const transcript = await transcribeAudio(audioBlob);

  // Step 2: Analyze
  if (onProgress) onProgress('Analyzing response...');
  const analysis = await analyzeTranscript(transcript, question);

  return { transcript, analysis };
}

/**
 * Check if API is configured
 */
export function isAIServiceConfigured(): boolean {
  return !!OPENAI_API_KEY;
}

/**
 * Get configuration instructions
 */
export function getConfigurationInstructions(): string {
  return `To enable AI-powered interview processing, you need to configure an OpenAI API key:

1. Get an API key from https://platform.openai.com/api-keys
2. Create a .env file in the project root
3. Add: VITE_OPENAI_API_KEY=your_api_key_here
4. Restart the development server

Note: For production use, this should be handled by a secure backend service.`;
}
