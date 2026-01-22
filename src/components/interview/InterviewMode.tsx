import { useState, useEffect } from 'react';
import { useAssessment } from '../../contexts/AssessmentContext';
import { AudioRecorderControls } from './AudioRecorderControls';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { cn } from '../../utils/cn';
import { getAllInterviewQuestions } from '../../data/interviewQuestions';
import { processAudioResponse, isAIServiceConfigured, getConfigurationInstructions } from '../../services/aiProcessing';
import { generateAssessmentFromInterview, downloadAssessmentJSON } from '../../utils/interviewToAssessment';
import type { InterviewSession, InterviewResponse } from '../../types/interview';
import type { CloudProvider } from '../../types';

export function InterviewMode() {
  const { dispatch } = useAssessment();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);

  // Setup form
  const [customerName, setCustomerName] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<CloudProvider[]>([]);

  const questions = getAllInterviewQuestions();
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    // Check if AI service is configured
    if (!isAIServiceConfigured()) {
      setError('AI service not configured. See instructions below.');
    }
  }, []);

  const handleStartInterview = () => {
    if (!customerName.trim() || selectedProviders.length === 0) {
      setError('Please provide customer name and select at least one cloud provider');
      return;
    }

    const newSession: InterviewSession = {
      sessionId: `interview-${Date.now()}`,
      customerName,
      cloudProviders: selectedProviders,
      startedAt: new Date().toISOString(),
      responses: {},
      currentQuestionIndex: 0,
      status: 'in-progress'
    };

    setSession(newSession);
    setSetupComplete(true);
    setError(null);
    // Skip setup question
    setCurrentQuestionIndex(1);
  };

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    if (!session || !currentQuestion) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Process audio
      const { transcript, analysis } = await processAudioResponse(
        blob,
        currentQuestion,
        setProcessingStage
      );

      // Save response
      const response: InterviewResponse = {
        questionId: currentQuestion.id,
        audioBlob: blob,
        audioUrl: URL.createObjectURL(blob),
        transcript,
        detectedMaturityLevel: analysis.maturityLevel,
        confidence: analysis.confidence,
        timestamp: new Date().toISOString(),
        duration
      };

      const updatedSession = {
        ...session,
        responses: {
          ...session.responses,
          [currentQuestion.id]: response
        }
      };

      setSession(updatedSession);
      setIsProcessing(false);
      setProcessingStage('');

      // Auto-advance to next question
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 1000);
      }
    } catch (err) {
      setError(`Processing failed: ${(err as Error).message}`);
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 1) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleCompleteInterview = () => {
    if (!session) return;

    // Navigate to generate JSON view
    setSession({
      ...session,
      completedAt: new Date().toISOString(),
      status: 'completed'
    });
  };

  const handleProviderToggle = (provider: CloudProvider) => {
    setSelectedProviders(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  const currentResponse = session?.responses[currentQuestion?.id];
  const progress = session ? (Object.keys(session.responses).length / (questions.length - 1)) * 100 : 0;

  // Setup screen
  if (!setupComplete) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
              🎤 AI-Powered Interview Mode
            </h1>
            <p className="text-gray-600">
              Answer questions verbally and let AI automatically generate your assessment.
            </p>
          </div>

          {!isAIServiceConfigured() && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Configuration Required</h3>
              <pre className="text-xs text-yellow-800 whitespace-pre-wrap">
                {getConfigurationInstructions()}
              </pre>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cloud Providers <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['AWS', 'Azure', 'GCP', 'OCI', 'Other'] as CloudProvider[]).map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => handleProviderToggle(provider)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all duration-200',
                      selectedProviders.includes(provider)
                        ? 'border-aviatrix-orange bg-orange-50 scale-[1.02]'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-6 h-6 rounded border-2 flex items-center justify-center',
                        selectedProviders.includes(provider)
                          ? 'border-aviatrix-orange bg-aviatrix-orange'
                          : 'border-gray-300'
                      )}>
                        {selectedProviders.includes(provider) && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{provider}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
            >
              ← Back
            </Button>
            <Button
              variant="primary"
              onClick={handleStartInterview}
              disabled={!customerName.trim() || selectedProviders.length === 0 || !isAIServiceConfigured()}
            >
              Start Interview →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Interview in progress
  if (session && session.status === 'in-progress') {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex} of {questions.length - 1}
            </span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-aviatrix-orange h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Question */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <div className="text-sm text-aviatrix-orange font-medium mb-2">
              {currentQuestion.pillarId.toUpperCase()}
              {currentQuestion.dimensionId && ` / ${currentQuestion.dimensionId}`}
            </div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>
            <p className="text-gray-600">
              {currentQuestion.context}
            </p>
          </div>

          {/* Previous Response Display */}
          {currentResponse && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">✓ Response Recorded</span>
                <span className="text-sm text-green-700">
                  Detected: {currentResponse.detectedMaturityLevel} ({currentResponse.confidence}% confidence)
                </span>
              </div>
              <p className="text-sm text-gray-700 italic">"{currentResponse.transcript}"</p>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <LoadingSpinner label={processingStage} />
            </div>
          )}

          {/* Audio Recorder */}
          {!isProcessing && (
            <AudioRecorderControls
              onRecordingComplete={handleRecordingComplete}
              disabled={isProcessing}
            />
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentQuestionIndex <= 1 || isProcessing}
          >
            ← Previous
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isProcessing || currentQuestionIndex >= questions.length - 1}
            >
              Skip →
            </Button>
            {currentResponse && currentQuestionIndex < questions.length - 1 && (
              <Button
                variant="secondary"
                onClick={handleNext}
                disabled={isProcessing}
              >
                Next Question →
              </Button>
            )}
            {currentQuestionIndex >= questions.length - 1 && (
              <Button
                variant="primary"
                onClick={handleCompleteInterview}
                disabled={isProcessing}
              >
                Complete Interview →
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Interview completed - show results
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            Interview Complete!
          </h1>
          <p className="text-gray-600">
            {Object.keys(session?.responses || {}).length} questions answered
          </p>
        </div>

        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Next Steps</h3>
          <p className="text-blue-800 text-sm mb-4">
            Your responses have been recorded. Click below to generate the assessment JSON
            that will automatically populate the assessment tool.
          </p>
          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              onClick={() => {
                if (!session) return;
                const assessment = generateAssessmentFromInterview(session);
                dispatch({ type: 'LOAD_ASSESSMENT', payload: assessment });
                dispatch({ type: 'NAVIGATE', payload: { currentPillar: 'summary' } });
              }}
            >
              Load into Assessment Tool →
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (!session) return;
                const assessment = generateAssessmentFromInterview(session);
                downloadAssessmentJSON(assessment);
              }}
            >
              📥 Download JSON
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
