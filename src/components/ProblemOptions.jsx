import React from 'react';
import classNames from 'classnames';

export function ProblemOptions({ options, correctAnswers }) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div
          key={option.key}
          className={classNames(
            "p-3 rounded-md",
            correctAnswers.includes(option.key)
              ? "bg-green-50 border border-green-200"
              : "bg-gray-50 border border-gray-200"
          )}
        >
          <span className="font-medium mr-2">{option.key}.</span><span dangerouslySetInnerHTML={{ __html: option.value }} />
        </div>
      ))}
    </div>
  );
}