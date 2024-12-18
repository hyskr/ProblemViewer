import React from 'react';

export function Header() {
  return (
    <header className="bg-white shadow hidden md:block">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">
          数学问题集
        </h1>
      </div>
    </header>
  );
}