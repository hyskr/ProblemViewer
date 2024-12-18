import React, { useRef, useEffect, useState } from 'react';
import classNames from 'classnames';

export function Sidebar({ groupProblems, problems, currentIndex, onSelect }) {
  const [activeElement, setActiveElement] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    if (activeElement && navRef.current) {
      const navElement = navRef.current;
      const activeRect = activeElement.getBoundingClientRect();
      const navRect = navElement.getBoundingClientRect();

      const isInView = (
        activeRect.top >= navRect.top &&
        activeRect.bottom <= navRect.bottom
      );

      if (!isInView) {
        const scrollTop = activeRect.top + navElement.scrollTop - navRect.top - (navRect.height - activeRect.height) / 2;
        navElement.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }
  }, [activeElement]);


  return (
    <div className="bg-white shadow-md w-64 h-screen flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">题目索引</h2>
      </div>
      <div ref={navRef} className="flex-grow overflow-y-auto p-4">
        {Object.entries(groupProblems).map(([sectionName, sectionProblems]) => (
          <div key={sectionName} className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{sectionName}</h3>
            <div className="grid grid-cols-3 gap-2">
              {sectionProblems.map((problem, index) => {
                const problemIndex = problems.findIndex(p => p === problem);
                const isActive = currentIndex === problemIndex;
                return (
                  <button
                    key={index}
                    ref={node => {
                      if (node && isActive) {
                        setActiveElement(node);
                      }
                    }}
                    onClick={() => onSelect(problemIndex)}
                    className={classNames(
                      "w-full px-2 py-1 rounded text-xs font-medium transition-colors duration-200",
                      isActive
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    )}
                  >
                    {problem.problem_index}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
