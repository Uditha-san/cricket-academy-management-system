import { useState } from 'react';
import { Users, Calendar, TrendingUp, MessageSquare, Search, Filter, Edit } from 'lucide-react';
import { useStats, PlayerStats } from '../../contexts/StatsContext';
import { useData } from '../../contexts/DataContext';
import PlayerStatsModal from '../../components/stats/PlayerStatsModal';

export default function CoachDashboard() {
  const { getStats, updateStats } = useStats();
  const { users } = useData();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  // Stats Modal State
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsPlayerId, setStatsPlayerId] = useState<string | null>(null);

  // Filter for players only
  const players = users.filter(u => u.role === 'player');

  const upcomingSessions = [
    {
      id: 1,
      title: 'Batting Practice',
      time: '09:00 AM - 11:00 AM',
      date: 'Today',
      attendees: 12,
      location: 'Main Ground'
    },
    {
      id: 2,
      title: 'Fitness Assessment',
      time: '04:00 PM - 06:00 PM',
      date: 'Today',
      attendees: 15,
      location: 'Gym'
    },
    {
      id: 3,
      title: 'Fielding Drills',
      time: '07:00 AM - 09:00 AM',
      date: 'Tomorrow',
      attendees: 18,
      location: 'Practice Nets'
    }
  ];

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlayer && feedback.trim()) {
      alert(`Feedback sent to ${players.find(p => p.id === selectedPlayer)?.name}`);
      setFeedback('');
    }
  };

  const handleStatsOpen = (playerId: string) => {
    setStatsPlayerId(playerId);
    setShowStatsModal(true);
  };

  const handleStatsSave = (newStats: PlayerStats) => {
    if (statsPlayerId) {
      updateStats(statsPlayerId, newStats);
      setShowStatsModal(false);
      setStatsPlayerId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coach Dashboard</h1>
        <p className="text-lg text-gray-600">Manage training sessions and player performance</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Players</p>
              <p className="text-2xl font-bold text-gray-900">{players.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Performance Review</p>
              <p className="text-2xl font-bold text-gray-900">Pending</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Players List */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Player Overview</h2>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {players.map((player) => {
              const stats = getStats(player.id);
              return (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedPlayer === player.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold mr-3">
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{player.name}</h3>
                        <p className="text-sm text-gray-500">{player.role}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${player.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {player.status}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{stats.batting.totalRuns}</p>
                      <p className="text-xs text-gray-600">Runs</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{stats.bowling.totalWickets}</p>
                      <p className="text-xs text-gray-600">Wickets</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{stats.general.matchesPlayed}</p>
                      <p className="text-xs text-gray-600">Matches</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          {/* Player Actions & Feedback */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Player Actions</h2>
            {selectedPlayer ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl mr-3">
                      {players.find(p => p.id === selectedPlayer)?.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {players.find(p => p.id === selectedPlayer)?.name}
                      </h3>
                      <p className="text-sm text-gray-500">Selected Player</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStatsOpen(selectedPlayer)}
                  className="w-full mb-6 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Player Statistics
                </button>

                <form onSubmit={handleSendFeedback}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send Feedback / Performance Note
                  </label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                    placeholder="Write your feedback here..."
                  />
                  <button
                    type="submit"
                    disabled={!feedback.trim()}
                    className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Feedback
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a player to view actions and send feedback</p>
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Sessions</h2>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold mb-3 md:mb-0 md:mr-4">
                    {session.date === 'Today' ? 'TD' : 'TM'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{session.title}</h3>
                    <p className="text-sm text-gray-500">{session.time}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      {session.attendees} Attending
                      <span className="mx-2">•</span>
                      <span>{session.location}</span>
                    </div>
                  </div>
                  <button className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded">
                    Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Modal */}
      {showStatsModal && statsPlayerId && (
        <PlayerStatsModal
          isOpen={showStatsModal}
          onClose={() => {
            setShowStatsModal(false);
            setStatsPlayerId(null);
          }}
          playerId={statsPlayerId}
          playerName={players.find(p => p.id === statsPlayerId)?.name || 'Unknown Player'}
          currentStats={getStats(statsPlayerId)}
          onSave={handleStatsSave}
        />
      )}
    </div>
  );
}