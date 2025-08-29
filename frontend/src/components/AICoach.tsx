// src/components/AICoach.tsx
import { useState } from 'react';
import { useAICoach } from '@/hooks/use-ai-coach';
import { Bot, Loader2, Send, CheckCircle } from 'lucide-react';
import type { AnalysisData, CoachResponse } from '@/types/coach';


interface AICoachProps {
  analysisData: AnalysisData | null;
  userAddress?: string;
}

export const AICoach = ({ analysisData, userAddress }: AICoachProps) => {
  const { questions, suggestedQuestions, currentResponse, loading, error, askQuestion } = useAICoach(userAddress);
  const [customQuestion, setCustomQuestion] = useState('');

  const handleQuestionClick = (questionId: string) => {
    askQuestion(questionId);
  };

  const handleCustomQuestion = () => {
    if (customQuestion.trim()) {
      askQuestion(undefined, customQuestion);
      setCustomQuestion('');
    }
  };

  return (
    <div className="glass rounded-3xl p-8 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI DeFi Coach</h2>
          <p className="text-muted-foreground">Get personalized advice based on your analysis</p>
        </div>
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Suggested for You:</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => askQuestion(undefined, question)}
                className="px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm transition-colors"
                disabled={loading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Predefined Questions */}
      {questions.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3">
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => handleQuestionClick(q.id)}
              className="p-4 text-left rounded-xl glass-card hover:bg-card/90 transition-colors"
              disabled={loading}
            >
              <span className="text-sm font-medium">{q.question}</span>
              <div className="text-xs text-muted-foreground mt-1">{q.category}</div>
            </button>
          ))}
        </div>
      )}

      {/* Custom Question Input */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Ask your own DeFi question..."
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
          className="flex-1 px-4 py-3 rounded-xl bg-card/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
          disabled={loading}
        />
        <button
          onClick={handleCustomQuestion}
          disabled={loading || !customQuestion.trim()}
          className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Response Display */}
      {currentResponse && (
        <div className="space-y-4 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/20">
          <h3 className="font-semibold text-primary">{currentResponse.question}</h3>
          <p className="text-muted-foreground leading-relaxed">{currentResponse.answer}</p>
          
          {currentResponse.actionItems.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Action Items:</h4>
              <ul className="space-y-1">
                {currentResponse.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {currentResponse.relatedQuestions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Related Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {currentResponse.relatedQuestions.map((relatedQ, index) => (
                  <button
                    key={index}
                    onClick={() => askQuestion(undefined, relatedQ)}
                    className="px-3 py-1 bg-accent/10 hover:bg-accent/20 rounded-lg text-xs transition-colors"
                  >
                    {relatedQ}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
