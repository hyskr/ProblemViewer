import { useState, useEffect } from 'react';
import problemsData from '../data/results.json';

export function useProblems() {
  const [problems, setProblems] = useState([]);
  const [groupProblems, setGroupProblems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      let groupProblems = {};
      for (let i = 0; i < problemsData.length; i++) {
        let problemData = { ...problemsData[i], index: i };
        if (!groupProblems[problemData.name]) {
          groupProblems[problemData.name] = [];
        }
        problemsData[i] = problemData;
        groupProblems[problemData.name].push(problemData);
      }
      setGroupProblems(groupProblems);
      setProblems(problemsData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Error loading problems');
      setLoading(false);
    }
  }, []);

  return { problems, groupProblems, loading, error };
}