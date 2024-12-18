import React from 'react';
import { ProblemOptions } from './ProblemOptions';

export function ProblemCard({ problem }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {problem.name} - 问题 {problem.problem_index}
        </h3>
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          {problem.problem_type}
        </span>
      </div>

      <div className="mb-4">
        <div
          className="text-gray-700 mb-4"
          dangerouslySetInnerHTML={{ __html: problem.problem_body }}
        />

        <ProblemOptions
          options={problem.problem_options}
          correctAnswers={problem.answer}
        />
      </div>

      <div className="mt-4 p-4 bg-green-50 rounded-md md:block hidden">
        <p className="text-green-700 font-medium">正确答案:<span dangerouslySetInnerHTML={{ __html: problem.answers }} /></p>
      </div>
    </div>
  );
}