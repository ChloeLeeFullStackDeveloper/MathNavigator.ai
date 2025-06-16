import React from 'react';
import { BarChart3 } from 'lucide-react';

interface Props {
  totalSubmissions: number;
  averageScore: number;
  mostMissed: string[];
}

const AdminStats: React.FC<Props> = ({ totalSubmissions, averageScore, mostMissed }) => {
  return (
    <div className="mt-10 bg-white border rounded-xl shadow p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-blue-600" size={24} />
        <h2 className="text-xl font-semibold text-blue-600">Admin Statistics</h2>
      </div>
      
      <div className="space-y-3 text-center">
        <div>
          <span className="text-gray-600 font-medium">Total Submissions: </span>
          <span className="text-lg font-bold text-gray-800">{totalSubmissions}</span>
        </div>
        
        <div>
          <span className="text-gray-600 font-medium">Average Score: </span>
          <span className="text-lg font-bold text-gray-800">{averageScore}%</span>
        </div>
        
        {mostMissed.length > 0 && (
          <div className="mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-red-600 text-lg">✗</span>
                <span className="font-semibold text-red-800">Most Frequently Missed Questions:</span>
              </div>
              <ul className="space-y-1">
                {mostMissed.slice(0, 6).map((questionId) => (
                  <li key={questionId} className="text-red-700">
                    • {questionId}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {mostMissed.length === 0 && totalSubmissions > 0 && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-800 font-medium">
              🎉 No frequently missed questions yet!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStats;