import React, { useState, useEffect } from 'react';
import { saveResultToFirestore, fetchAdminStatsFromFirestore } from '../utils/firestoreHelpers';
import { getCachedExplanation, setCachedExplanation, makeCacheKey } from '../utils/gptCache';
import AdminStats from './AdminStats';
import questionsData from '../data/questions.json';

type Question = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

const DiagnosticTest: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [globalStats, setGlobalStats] = useState({
    totalSubmissions: 0,
    averageScore: 0,
    mostMissed: [] as string[],
  });

  // Remove localStats and use a single stats state
  const [displayStats, setDisplayStats] = useState({
    totalSubmissions: 0,
    averageScore: 0,
    mostMissed: [] as string[],
  });

  useEffect(() => {
    setQuestions(questionsData);
    fetchAdminStatsFromFirestore().then((stats) => {
      setGlobalStats(stats);
      setDisplayStats(stats); // Initialize display stats with global stats
    });
  }, []);

  const handleChange = (qId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const fetchExplanation = async (q: Question, selected: string) => {
    const key = makeCacheKey(q.id, selected);
    const cached = getCachedExplanation(key);
    if (cached) return cached;

    try {
      const res = await fetch('http://localhost:3000/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          userAnswer: selected,
          correctAnswer: q.answer,
        }),
      });

      const data = await res.json();
      setCachedExplanation(key, data.explanation);
      return data.explanation;
    } catch (err) {
      console.error('OpenAI fetch error:', err);
      return '⚠️ GPT explanation could not be loaded. Please try again later.';
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions first.');
      return;
    }

    setLoading(true);
    let correct = 0;
    const newExplanations: Record<string, string> = {};

    try {
      await Promise.all(
        questions.map(async (q) => {
          const selected = answers[q.id];
          if (selected === q.answer) correct++;
          const explanation = await fetchExplanation(q, selected || '');
          newExplanations[q.id] = explanation;
        })
      );

      const finalScore = Math.round((correct / questions.length) * 100);
      setScore(finalScore);
      setExplanations(newExplanations);
      setSubmitted(true);

      // Get incorrect question IDs - simplified logic
      const incorrectIds = questions
        .filter(q => answers[q.id] && answers[q.id] !== q.answer)
        .map(q => q.id);

      await saveResultToFirestore(finalScore, answers, newExplanations);

      // Update display stats to show current session results
      setDisplayStats({
        totalSubmissions: globalStats.totalSubmissions + 1,
        averageScore: finalScore, // Show current score
        mostMissed: incorrectIds,
      });
    } catch (err) {
      console.error('Error during submission:', err);
      alert('There was an error submitting your test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setExplanations({});
    setDisplayStats(globalStats); // Reset to global stats
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          🧠 Math Diagnostic Test
        </h1>

        {/* Show score if submitted */}
        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <h2 className="text-2xl font-semibold text-green-800">
              🎉 Test Complete! Your Score: {score}%
            </h2>
            <p className="text-green-600 mt-1">
              You got {Math.round((score / 100) * questions.length)} out of {questions.length} questions correct
            </p>
            <button
              onClick={resetTest}
              className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Take Test Again
            </button>
          </div>
        )}

        {questions.length > 0 ? (
          questions.map((q) => (
            <div
              key={q.id}
              className="mb-6 p-5 border rounded-md shadow-sm bg-white"
            >
              <p className="font-semibold text-lg text-gray-900 mb-3">
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options && q.options.length > 0 ? (
                  q.options.map((opt, index) => {
                    const isSelected = answers[q.id] === opt;
                    const isCorrect = submitted && opt === q.answer;
                    const isWrong = submitted && isSelected && opt !== q.answer;

                    return (
                      <label
                        key={`${q.id}-${index}`}
                        className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition text-left ${
                          submitted
                            ? isCorrect
                              ? 'bg-green-100 border-green-500 text-green-800'
                              : isWrong
                              ? 'bg-red-100 border-red-500 text-red-800'
                              : 'bg-gray-50 border-gray-300 text-gray-600'
                            : isSelected
                            ? 'bg-blue-100 border-blue-500 text-blue-800'
                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={isSelected}
                          onChange={() => handleChange(q.id, opt)}
                          disabled={submitted}
                          className="w-4 h-4"
                        />
                        <span className="text-base font-medium">{opt}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-red-500">No options available for this question</p>
                )}
              </div>

              {submitted && (
                <div className="mt-4 bg-yellow-50 border border-yellow-300 p-4 rounded text-sm text-gray-800">
                  <strong className="text-yellow-800">🧠 GPT Explanation:</strong>
                  <br />
                  <span className="text-gray-700 mt-1 block">
                    {explanations[q.id] || '⚠️ Loading explanation...'}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500 text-lg">❌ No questions loaded from questions.json</p>
          </div>
        )}

        {/* Conditional AdminStats display */}
        {submitted ? (
          <div>
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">
              📊 Your Results vs. Global Statistics
            </h3>
            <AdminStats
              totalSubmissions={displayStats.totalSubmissions}
              averageScore={displayStats.averageScore}
              mostMissed={displayStats.mostMissed}
            />
          </div>
        ) : (
          <div className="mt-8 text-center p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              📚 Ready to test your math skills?
            </h3>
            <p className="text-blue-600">
              Complete the diagnostic test to see your results and compare with other students!
            </p>
          </div>
        )}

        {!submitted && (
          <button
            className="w-full mt-6 bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ Analyzing with GPT...' : 'Submit Test'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DiagnosticTest;