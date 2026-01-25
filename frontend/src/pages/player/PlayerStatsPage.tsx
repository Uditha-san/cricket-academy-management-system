
import { ArrowLeft, TrendingUp, Target, Trophy, Calendar } from 'lucide-react';

interface PlayerStatsPageProps {
  onNavigate: (page: string) => void;
}

import { useAuth } from '../../contexts/AuthContext';
import { useStats } from '../../contexts/StatsContext';

export default function PlayerStatsPage({ onNavigate }: PlayerStatsPageProps) {
  const { user } = useAuth();
  const { getStats } = useStats();

  // Use user.id if available, otherwise fallback or handle error. 
  // For this generic page, we assume 'user' is the logged-in player.
  const performanceData = getStats(user?.id || 'guest');


  const recentMatches = [
    { date: '2025-01-20', opponent: 'Team Alpha', runs: 45, wickets: 2, result: 'Won' },
    { date: '2025-01-15', opponent: 'Team Beta', runs: 23, wickets: 1, result: 'Lost' },
    { date: '2025-01-10', opponent: 'Team Gamma', runs: 67, wickets: 3, result: 'Won' },
    { date: '2025-01-05', opponent: 'Team Delta', runs: 12, wickets: 0, result: 'Lost' },
    { date: '2024-12-30', opponent: 'Team Echo', runs: 89, wickets: 2, result: 'Won' }
  ];

  const coachFeedback = [
    {
      date: '2025-01-18',
      coach: 'Coach Smith',
      area: 'Batting Technique',
      feedback: 'Great improvement in footwork. Focus on follow-through for better timing. Keep practicing the drive shots.',
      rating: 4
    },
    {
      date: '2025-01-12',
      coach: 'Coach Johnson',
      area: 'Bowling Action',
      feedback: 'Consistent line and length. Work on variations and speed control. Excellent progress this week!',
      rating: 5
    },
    {
      date: '2025-01-08',
      coach: 'Coach Smith',
      area: 'Fielding',
      feedback: 'Sharp reflexes in the slips. Practice more ground fielding to improve overall performance.',
      rating: 4
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Player Statistics</h1>
        <p className="text-lg text-gray-600">Track your cricket performance and progress</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{performanceData.general.matchesPlayed}</p>
              <p className="text-sm text-gray-600">Matches</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{performanceData.batting.totalRuns}</p>
              <p className="text-sm text-gray-600">Total Runs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{performanceData.bowling.totalWickets}</p>
              <p className="text-sm text-gray-600">Wickets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">{performanceData.general.wins}</p>
              <p className="text-sm text-gray-600">Wins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Batting Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Runs</span>
              <span className="font-semibold">{performanceData.batting.totalRuns}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average</span>
              <span className="font-semibold">{performanceData.batting.average}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strike Rate</span>
              <span className="font-semibold">{performanceData.batting.strikeRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Highest Score</span>
              <span className="font-semibold">{performanceData.batting.highestScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fifties</span>
              <span className="font-semibold">{performanceData.batting.fifties}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bowling Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Wickets</span>
              <span className="font-semibold">{performanceData.bowling.totalWickets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average</span>
              <span className="font-semibold">{performanceData.bowling.average}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Economy Rate</span>
              <span className="font-semibold">{performanceData.bowling.economyRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Best Figures</span>
              <span className="font-semibold">{performanceData.bowling.bestFigures}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Maidens</span>
              <span className="font-semibold">{performanceData.bowling.maidens}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Matches</h2>
          <div className="space-y-4">
            {recentMatches.map((match, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{match.opponent}</p>
                  <p className="text-sm text-gray-600">{match.date}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{match.runs} runs • {match.wickets} wickets</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${match.result === 'Won' ? 'bg-green-100 text-green-800' :
                      match.result === 'Lost' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {match.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Coach Feedback</h2>
          <div className="space-y-4">
            {coachFeedback.map((feedback, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{feedback.area}</p>
                    <p className="text-sm text-gray-600">{feedback.coach} • {feedback.date}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700">"{feedback.feedback}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}