import React, { useEffect, useState } from 'react';

interface LeaderboardEntry {
  model: string;
  accuracy: number;
  speed: number;
  complexity: number;
  analyses: number;
}

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((json) => {
        setData(json.leaderboard);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Model Performance Leaderboard</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Rank</th>
            <th className="border px-2 py-1">Model</th>
            <th className="border px-2 py-1">Accuracy</th>
            <th className="border px-2 py-1">Speed</th>
            <th className="border px-2 py-1">Complexity</th>
            <th className="border px-2 py-1">Analyses</th>
          </tr>
        </thead>
        <tbody>
          {data
            .sort((a, b) => b.accuracy - a.accuracy)
            .map((entry, idx) => (
              <tr key={entry.model}>
                <td className="border px-2 py-1 text-center">{idx + 1}</td>
                <td className="border px-2 py-1">{entry.model}</td>
                <td className="border px-2 py-1 text-center">{(entry.accuracy * 100).toFixed(1)}%</td>
                <td className="border px-2 py-1 text-center">{entry.speed.toFixed(2)}s</td>
                <td className="border px-2 py-1 text-center">{entry.complexity.toFixed(2)}</td>
                <td className="border px-2 py-1 text-center">{entry.analyses}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard; 