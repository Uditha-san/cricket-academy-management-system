import { useState } from 'react';
import { ArrowLeft, Search, CreditCard as Edit2, Trash2, Users, Mail, Phone, TrendingUp } from 'lucide-react';
import { useStats, PlayerStats } from '../../contexts/StatsContext';
import { useData, User } from '../../contexts/DataContext';
import PlayerStatsModal from '../../components/stats/PlayerStatsModal';

interface ManagePlayersPageProps {
  onNavigate: (page: string) => void;
}

export default function ManagePlayersPage({ onNavigate }: ManagePlayersPageProps) {
  const { users, updateUser, deleteUser } = useData();
  const { getStats, updateStats } = useStats();

  // Filter for players only
  const players = users.filter(u => u.role === 'player');

  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<User | null>(null);

  // Stats Modal State
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsPlayerId, setStatsPlayerId] = useState<string | null>(null);

  const handleEdit = (player: User) => {
    setEditingPlayer(player);
    setShowEditModal(true);
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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      deleteUser(id);
    }
  };

  const handleUpdatePlayer = (updatedPlayer: User) => {
    updateUser(updatedPlayer);
    setShowEditModal(false);
    setEditingPlayer(null);
  };

  const togglePlayerStatus = (id: string) => {
    const player = players.find(p => p.id === id);
    if (player) {
      updateUser({
        ...player,
        status: player.status === 'Active' ? 'Inactive' : 'Active'
      });
    }
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.phone.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Players</h1>
        <p className="text-lg text-gray-600">View and manage registered players</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {filteredPlayers.map((player) => (
          <div key={player.id} className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{player.name}</h3>
                <p className="text-sm text-gray-600">Member since {player.joinDate}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${player.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {player.status}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {player.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {player.phone}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{player.totalBookings}</p>
                <p className="text-xs text-gray-600">Total Bookings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">Rs.{player.totalSpent}</p>
                <p className="text-xs text-gray-600">Total Spent</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">Cricket Style</div>
              <div className="flex space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {player.battingStyle || 'N/A'}
                </span>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  {player.bowlingStyle || 'N/A'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => handleStatsOpen(player.id)}
                className="col-span-2 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Update Stats
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(player)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => togglePlayerStatus(player.id)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium focus:ring-2 focus:ring-offset-2 transition-colors ${player.status === 'Active'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
                    : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  }`}
              >
                {player.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(player.id)}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Player</h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingPlayer) {
                handleUpdatePlayer(editingPlayer);
              }
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editingPlayer.name}
                    onChange={(e) => setEditingPlayer(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingPlayer.email}
                    onChange={(e) => setEditingPlayer(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editingPlayer.phone}
                    onChange={(e) => setEditingPlayer(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editingPlayer.status}
                    onChange={(e) => setEditingPlayer(prev => prev ? { ...prev, status: e.target.value as 'Active' | 'Inactive' } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batting Style</label>
                  <select
                    value={editingPlayer.battingStyle || 'Right-handed'}
                    onChange={(e) => setEditingPlayer(prev => prev ? { ...prev, battingStyle: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Right-handed">Right-handed</option>
                    <option value="Left-handed">Left-handed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bowling Style</label>
                  <select
                    value={editingPlayer.bowlingStyle || 'Right-arm Medium'}
                    onChange={(e) => setEditingPlayer(prev => prev ? { ...prev, bowlingStyle: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Right-arm Medium">Right-arm Medium</option>
                    <option value="Right-arm Fast">Right-arm Fast</option>
                    <option value="Left-arm Medium">Left-arm Medium</option>
                    <option value="Left-arm Fast">Left-arm Fast</option>
                    <option value="Right-arm Spin">Right-arm Spin</option>
                    <option value="Left-arm Spin">Left-arm Spin</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Update Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{players.length}</p>
              <p className="text-sm text-gray-600">Total Players</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {players.filter(p => p.status === 'Active').length}
              </p>
              <p className="text-sm text-gray-600">Active Players</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {players.reduce((sum, player) => sum + player.totalBookings, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                Rs.{players.reduce((sum, player) => sum + player.totalSpent, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}