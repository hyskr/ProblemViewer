import React, { useState } from 'react';
import { ProblemCard } from './components/ProblemCard';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { useProblems } from './hooks/useProblems';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const { problems, groupProblems, loading, error } = useProblems();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  const handleNavigate = (newIndex) => {
    if (newIndex >= 0 && newIndex < problems.length) {
      setCurrentProblemIndex(newIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-700">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row-reverse h-screen">
      <Sidebar
        groupProblems={groupProblems}
        problems={problems}
        currentIndex={currentProblemIndex}
        onSelect={setCurrentProblemIndex}
      />

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col min-h-screen pb-10">
          <Header />
          <main className="flex-grow">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <ErrorBoundary>
                  {problems.length > 0 && (
                    <ProblemCard problem={problems[currentProblemIndex]} />
                  )}
                </ErrorBoundary>
              </div>
            </div>
          </main>

          <Navigation
            currentIndex={currentProblemIndex}
            totalProblems={problems.length}
            onNavigate={handleNavigate}
          />
        </div>
      </div>

    </div >
  );
}

export default App;