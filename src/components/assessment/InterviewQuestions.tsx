import type { Question } from '../../types';

interface InterviewQuestionsProps {
  questions: Question[];
  listeningGuidance?: Record<string, string>;
}

export function InterviewQuestions({ questions, listeningGuidance }: InterviewQuestionsProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Ask the customer these questions to assess their maturity:
      </p>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="pl-4 border-l-2 border-blue-300">
            <p className="font-medium text-gray-900 mb-1">
              {idx + 1}. {q.question}
            </p>
            <p className="text-sm text-gray-500 italic">
              Purpose: {q.purpose}
            </p>
          </div>
        ))}
      </div>

      {listeningGuidance && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            What to listen for:
          </h4>
          <ul className="space-y-2 text-sm">
            {Object.entries(listeningGuidance).map(([level, guidance]) => (
              <li key={level} className="text-gray-700">
                <span className="font-medium capitalize">{level}:</span> {guidance}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
