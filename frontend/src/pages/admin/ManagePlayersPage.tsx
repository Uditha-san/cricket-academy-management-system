import { useState, useEffect } from 'react';
import { ArrowLeft, Search, CreditCard as Edit2, Trash2, Users, Mail, Phone, TrendingUp } from 'lucide-react';
import { adminApi } from '../../api/admin';
import PlayerEditModal from './PlayerEditModal';
import PlayerPerformanceModal from './PlayerPerformanceModal';

interface ManagePlayersPageProps {
  onNavigate: (page: string) => void;
}

export default function ManagePlayersPage({ onNavigate }: ManagePlayersPageProps) {
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);

  // Performance Modal State
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [performancePlayerId, setPerformancePlayerId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getPlayers();
      setPlayers(data);
    } catch (err: any) {
      console.error("Failed to fetch players", err);
      setError('Failed to load players');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (player: any) => {
    setEditingPlayer(player);
    setShowEditModal(true);
  };

  const handlePerformanceOpen = (playerId: string) => {
    setPerformancePlayerId(playerId);
    setShowPerformanceModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      try {
        await adminApi.deletePlayer(id);
        setPlayers(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error("Delete failed", err);
        alert('Failed to delete player');
      }
    }
  };

  const togglePlayerStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await adminApi.updatePlayer(id, { status: newStatus });
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err) {
      console.error("Status toggle failed", err);
      alert('Failed to update status');
    }
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.phone && player.phone.includes(searchTerm))
  );

  if (isLoading) return <div className="flex justify-center items-center py-20">Loading players...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

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
                <p className="text-sm text-gray-600">Member since {new Date(player.joinDate).toLocaleDateString()}</p>
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
                {player.phone || 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{player.playerProfile?.totalBookings || 0}</p>
                <p className="text-xs text-gray-600">Total Bookings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">Rs.{player.playerProfile?.totalSpent || 0}</p>
                <p className="text-xs text-gray-600">Total Spent</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">Cricket Style</div>
              <div className="flex space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {player.playerProfile?.battingStyle || 'N/A'}
                </span>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  {player.playerProfile?.bowlingStyle || 'N/A'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => handlePerformanceOpen(player.id)}
                className="col-span-2 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Update Performance Stats
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
                onClick={() => togglePlayerStatus(player.id, player.status)}
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

      {showEditModal && editingPlayer && (
        <PlayerEditModal
          player={editingPlayer}
          onClose={() => {
            setShowEditModal(false);
            setEditingPlayer(null);
          }}
          onUpdate={() => {
            setShowEditModal(false);
            setEditingPlayer(null);
            fetchPlayers();
          }}
        />
      )}

      {showPerformanceModal && performancePlayerId && (
        <PlayerPerformanceModal
          playerId={performancePlayerId}
          playerName={players.find(p => p.id === performancePlayerId)?.name || 'Unknown Player'}
          currentPerformance={players.find(p => p.id === performancePlayerId)?.performance || {}}
          onClose={() => {
            setShowPerformanceModal(false);
            setPerformancePlayerId(null);
          }}
          onUpdate={() => {
            setShowPerformanceModal(false);
            setPerformancePlayerId(null);
            fetchPlayers();
          }}
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
                {players.reduce((sum, player) => sum + (Number(player.playerProfile?.totalBookings) || 0), 0)}
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
                Rs.{players.reduce((sum, player) => sum + (Number(player.playerProfile?.totalSpent) || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}