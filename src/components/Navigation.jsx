import React from 'react';

export function Navigation({ currentIndex, totalProblems, onNavigate }) {
  return (
    <div className="left-0 right-0 flex justify-center space-x-4">
      <button
        onClick={() => onNavigate(currentIndex - 1)}
        disabled={currentIndex === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
      >
        上一题
      </button>
      <span className="px-4 py-2 bg-gray-100 rounded-md">
        {currentIndex + 1} / {totalProblems}
      </span>
      <button
        onClick={() => onNavigate(currentIndex + 1)}
        disabled={currentIndex === totalProblems - 1}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
      >
        下一题
      </button>
    </div>
  );
}