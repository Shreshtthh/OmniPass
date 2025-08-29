// src/hooks/use-ai-coach.ts
import { useState, useEffect } from 'react';

interface CoachQuestion {
  id: string;
  question: string;
  category: string;
}

interface CoachResponse {
  question: string;
  answer: string;
  actionItems: string[];
  relatedQuestions: string[];
}

export const useAICoach = (address?: string) => {
  const [questions, setQuestions] = useState<CoachQuestion[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState<boolean> (false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available questions when address changes
  useEffect(() => {
    if (!address) return;

    fetch(`/api/coach/questions/${address}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.questions);
          setSuggestedQuestions(data.suggestedQuestions);
        }
      })
      .catch(err => console.error('Failed to fetch questions:', err));
  }, [address]);

  const askQuestion = async (questionId?: string, customQuestion?: string): Promise<void> => {
    if (!questionId && !customQuestion) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/coach/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, customQuestion, address }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentResponse(data.data);
      } else {
        setError(data.error || 'Failed to get coach response');
      }
    } catch (err) {
      setError('Network error - please try again');
      console.error('Coach error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    suggestedQuestions,
    currentResponse,
    loading,
    error,
    askQuestion
  };
};
