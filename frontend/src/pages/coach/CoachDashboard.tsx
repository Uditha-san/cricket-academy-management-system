import { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, MessageSquare, Edit, Wrench } from 'lucide-react';
import { useStats, PlayerStats } from '../../contexts/StatsContext';
import api from '../../api/axios';
import PlayerStatsModal from '../../components/stats/PlayerStatsModal';

export default function CoachDashboard() {
  const { getStats, updateStats } = useStats();
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [area, setArea] = useState('Batting');
  const [rating, setRating] = useState(5);
  const [isSending, setIsSending] = useState(false);

  const [sentFeedbacks, setSentFeedbacks] = useState<any[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [assignedBookings, setAssignedBookings] = useState<any[]>([]);
  const [assignedRentals, setAssignedRentals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'messages'>('overview');

  // Stats Modal State
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsPlayerId, setStatsPlayerId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/coach/players'),
      api.get('/coach/feedback-history'),
      api.get('/coach/messages'),
      api.get('/coach/bookings'),
      api.get('/coach/rentals')
    ]).then(([playersRes, fbRes, msgRes, bkRes, rnRes]) => {
      setPlayers(playersRes.data);
      setSentFeedbacks(fbRes.data);
      setReceivedMessages(msgRes.data);
      setAssignedBookings(bkRes.data);
      setAssignedRentals(rnRes.data);
    }).catch(console.error);
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setAssignedBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (error) {
      console.error("Failed to change booking status:", error);
      alert("Error trying to change status.");
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlayer && feedback.trim()) {
      setIsSending(true);
      try {
        await api.post(`/coach/players/${selectedPlayer}/feedback`, {
          area,
          feedback,
          rating
        });
        alert(`Feedback sent to ${players.find(p => p.id === selectedPlayer)?.name}`);
        setFeedback('');
        setRating(5);
        setArea('Batting');
        // Refresh feedback history
        api.get('/coach/feedback-history').then(res => setSentFeedbacks(res.data));
      } catch (err) {
        console.error("Failed to send feedback", err);
        alert("Failed to send feedback");
      } finally {
        setIsSending(false);
      }
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
              <p className="text-sm font-medium text-gray-600">Assigned Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{assignedBookings.filter((b: any) => b.status !== 'cancelled' && b.status !== 'Cancelled').length}</p>
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
            <h2 className="text-xl font-semibold text-gray-900">Coach Workspace</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'overview' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Players
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'history' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Sent Feedback
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'messages' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'} relative`}
              >
                Messages
                {receivedMessages.length > 0 && <span className="absolute top-0 right-0 -mt-1 -mr-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {activeTab === 'overview' && players.map((player) => {
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

            {activeTab === 'history' && (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {sentFeedbacks.length > 0 ? (
                  sentFeedbacks.map((fb, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">To: {fb.player.name}</p>
                          <p className="text-xs text-gray-500">{new Date(fb.createdAt).toLocaleString()}</p>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">{fb.area}</span>
                      </div>
                      <p className="text-sm text-gray-700 italic border-l-2 border-purple-200 pl-2">"{fb.feedback}"</p>
                      <div className="mt-2 text-xs text-gray-500 text-right">
                        Rating: {fb.rating}/5 • Status: {fb.isRead ? <span className="text-green-600">Read</span> : <span className="text-gray-400">Unread</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No feedback sent yet.</p>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {receivedMessages.length > 0 ? (
                  receivedMessages.map((msg, idx) => (
                    <div key={idx} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">From: {msg.playerName}</p>
                          <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-800">"{msg.content}"</p>
                      <button
                        onClick={() => {
                          setSelectedPlayer(msg.playerId);
                          setActiveTab('overview');
                        }}
                        className="mt-3 text-xs bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                      >
                        Write Feedback to Player
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No messages received.</p>
                )}
              </div>
            )}
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
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value="Batting">Batting</option>
                        <option value="Bowling">Bowling</option>
                        <option value="Fielding">Fielding</option>
                        <option value="Fitness">Fitness</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating (Out of 5)</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value={1}>1 - Needs Work</option>
                        <option value={2}>2 - Below Average</option>
                        <option value={3}>3 - Average</option>
                        <option value={4}>4 - Good</option>
                        <option value={5}>5 - Excellent</option>
                      </select>
                    </div>
                  </div>

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
                    disabled={!feedback.trim() || isSending}
                    className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {isSending ? 'Sending...' : 'Send Feedback'}
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
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {assignedBookings.length > 0 ? assignedBookings.map((session) => (
                <div key={session.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold mb-3 md:mb-0 md:mr-4 ${session.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                    session.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                    {session.status.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{session.playerName}</h3>
                    <p className="text-sm text-gray-500">{session.date} • {session.startTime} ({session.duration}h)</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span className={`font-semibold ${session.status === 'Confirmed' ? 'text-green-600' :
                        session.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {session.status}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{session.courtName}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    {session.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(session.id, 'Confirmed')}
                        className="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {(session.status === 'Pending' || session.status === 'Confirmed') && (
                      <button
                        onClick={() => handleUpdateStatus(session.id, 'Cancelled')}
                        className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 py-4 text-center">No assigned bookings yet.</p>
              )}
            </div>
          </div>

          {/* Assigned Machine Rentals */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-purple-500" /> Assigned Machine Rentals
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {assignedRentals.length > 0 ? assignedRentals.map(r => (
                <div key={r.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold mr-4 ${r.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{r.playerName}</h3>
                    <p className="text-sm text-gray-500">{r.machineName} • {r.date} at {r.startTime} ({r.duration}h)</p>
                    <span className={`text-xs font-semibold ${r.status === 'confirmed' ? 'text-green-600' :
                        r.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                      {r.status?.charAt(0).toUpperCase() + r.status?.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    {r.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'confirmed')}
                        className="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {(r.status === 'pending' || r.status === 'confirmed') && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'cancelled')}
                        className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 py-4 text-center">No assigned machine rentals yet.</p>
              )}
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