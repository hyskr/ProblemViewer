import { FC } from 'react';
import { X } from 'lucide-react';

interface SubjectiveAnswersProps {
  answers: { answer: string; user_id: string }[];
  onClose: () => void;
}

export const SubjectiveAnswers: FC<SubjectiveAnswersProps> = ({ answers, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">所有回答</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {answers.length === 0 ? (
            <p className="text-gray-500 text-center">暂无回答</p>
          ) : (
            <div className="space-y-4">
              {answers.map((answer, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="text-sm text-gray-500 mb-2">
                    学号: {answer.user_id}
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {answer.answer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}