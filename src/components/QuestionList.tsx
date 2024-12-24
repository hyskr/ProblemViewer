import { FC } from 'react';
import { ChevronRight } from 'lucide-react';

interface QuestionListProps {
  questions: Array<{ id: string; order: number }>;
  onQuestionClick: (id: string) => void;
}

export const QuestionList: FC<QuestionListProps> = ({ questions, onQuestionClick }) => {
  return (
    <div className="mt-6 overflow-y-auto max-h-[calc(100vh-350px)] custom-scrollbar">
      <h3 className="text-sm font-medium text-gray-500 mb-3">题目导航</h3>
      <div className="space-y-1">
        {questions.map((question) => (
          <button
            key={question.id}
            onClick={() => {
              onQuestionClick(question.id);
              const element = document.getElementById(`question-${question.id}`);
              if (element) {
                const rect = element.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                if (rect.top < 100 || rect.bottom > windowHeight - 100) {
                  element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                  });
                }
              }
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <span>第 {question.order + 1} 题</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
};