import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAuthToken, formatTime } from '../utils/auth';
import './Leaderboard.css';

function Leaderboard() {
  const { testId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [testId]);

  const fetchLeaderboard = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/leaderboard/${testId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setLeaderboard(data.data.leaderboard);
        setUserRank(data.data.userRank);
        setTotalParticipants(data.data.totalParticipants);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard-page">
      <div className="container">
        <div className="page-header">
          <h1>🏆 Leaderboard</h1>
          <p>See how you rank against other aspirants</p>
        </div>

        {userRank && (
          <div className="user-rank-card">
            <div className="rank-info">
              <div className="rank-number">#{userRank.rank}</div>
              <div className="rank-details">
                <h3>Your Rank</h3>
                <p>{userRank.percentile}%ile • {userRank.score} marks</p>
              </div>
            </div>
            <div className="participants-info">
              <span className="participants-count">{totalParticipants}</span>
              <span className="participants-label">Total Participants</span>
            </div>
          </div>
        )}

        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Accuracy</th>
                <th>Time</th>
                <th>Percentile</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => {
                const isCurrentUser = userRank && entry.rank === userRank.rank;
                return (
                  <tr key={entry.rank} className={isCurrentUser ? 'current-user' : ''}>
                    <td>
                      <div className="rank-cell">
                        {entry.rank <= 3 && (
                          <span className="medal">
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span>#{entry.rank}</span>
                      </div>
                    </td>
                    <td className="name-cell">{entry.name}</td>
                    <td className="score-cell">{entry.score}/{entry.totalMarks}</td>
                    <td>{entry.percentage}%</td>
                    <td>{entry.accuracy}%</td>
                    <td>{formatTime(entry.timeSpent)}</td>
                    <td>{entry.percentile}%ile</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {leaderboard.length === 0 && (
            <div className="empty-state">
              <p>No participants yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
