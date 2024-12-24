import { FC } from 'react';

interface Option {
  key: string;
  value: string;
}

interface QuestionStatsProps {
  options: Option[];
  stats: {
    optionCounts: Record<string, number>;
    totalResponses: number;
  };
  typeid: number;
}

export const QuestionStats: FC<QuestionStatsProps> = ({ options, stats, typeid }) => {
  const getPercentage = (count: number) => {
    return stats.totalResponses
      ? Math.round((count / stats.totalResponses) * 100)
      : 0;
  };

  const maxCount = Math.max(...Object.values(stats.optionCounts));

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
      <h4 className="text-sm font-medium text-gray-500 mb-3">统计数据</h4>
      <div className="space-y-3">
        {options.map((option) => {
          const count = stats.optionCounts[option.key] || 0;
          const percentage = getPercentage(count);
          const isHighest = count === maxCount && count > 0;
          
          return (
            <div key={option.key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {option.key}. {option.value}
                </span>
                <span className="text-gray-500 font-medium">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHighest ? 'bg-blue-500' : 'bg-blue-300'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t text-sm text-gray-500 flex justify-between items-center">
        <span>总回答人数:</span>
        <span className="font-medium">
          {(stats.totalResponses || 0) / (typeid === 1 ? 2 : 1)}
        </span>
      </div>
    </div>
  );
};