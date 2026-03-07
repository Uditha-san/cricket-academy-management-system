import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Check, X, Calendar, Wrench } from 'lucide-react';
import { useData, Booking } from '../../contexts/DataContext';
import api from '../../api/axios';

interface ManageBookingsPageProps {
  onNavigate: (page: string) => void;
}

export default function ManageBookingsPage({ onNavigate }: ManageBookingsPageProps) {
  const { bookings, updateBookingStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'bookings' | 'rentals'>('bookings');

  // Rental state
  const [rentals, setRentals] = useState<any[]>([]);
  const [isLoadingRentals, setIsLoadingRentals] = useState(true);

  useEffect(() => {
    api.get('/rentals')
      .then(res => setRentals(res.data))
      .catch(console.error)
      .finally(() => setIsLoadingRentals(false));
  }, []);

  const updateRentalStatus = async (id: string, status: string) => {
    try {
      await api.put(`/rentals/${id}/status`, { status });
      setRentals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) {
      alert('Failed to update rental status');
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    updateBookingStatus(bookingId, newStatus);
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed') return 'bg-green-100 text-green-800';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredRentals = rentals.filter(r => {
    const matchesSearch =
      (r.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.facility?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || (r.status || '').toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Bookings & Rentals</h1>
        <p className="text-lg text-gray-600">Approve and manage all court bookings and machine rentals</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'bookings' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Calendar className="w-4 h-4" /> Court Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-5 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'rentals' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Wrench className="w-4 h-4" /> Machine Rentals ({rentals.length})
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-5 shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={activeTab === 'bookings' ? "Search by player name, booking ID..." : "Search by player or machine..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* COURT BOOKINGS TABLE */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Court Bookings ({filteredBookings.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No bookings found.</td></tr>
                ) : filteredBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">...{booking.id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{booking.userName}</p>
                      <p className="text-sm text-gray-500">{booking.userEmail}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{booking.courtName}</p>
                      <p className="text-sm text-gray-500">{booking.date} • {booking.timeSlot}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rs.{booking.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {booking.status === 'Pending' && (
                          <>
                            <button onClick={() => handleStatusChange(booking.id, 'Confirmed')} className="text-green-600 hover:text-green-900 p-1 rounded" title="Confirm">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleStatusChange(booking.id, 'Cancelled')} className="text-red-600 hover:text-red-900 p-1 rounded" title="Cancel">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {booking.status === 'Confirmed' && (
                          <button onClick={() => handleStatusChange(booking.id, 'Cancelled')} className="text-red-600 hover:text-red-900 p-1 rounded" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MACHINE RENTALS TABLE */}
      {activeTab === 'rentals' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Machine Rentals ({filteredRentals.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoadingRentals ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading rentals...</td></tr>
                ) : filteredRentals.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No machine rentals found.</td></tr>
                ) : filteredRentals.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">...{r.id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{r.user?.name}</p>
                      <p className="text-sm text-gray-500">{r.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{r.facility?.name}</p>
                      <p className="text-sm text-gray-500">{new Date(r.rentalDate).toISOString().split('T')[0]} • {r.startTime} ({r.duration}h)</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {r.coach?.name || <span className="text-gray-400">No coach</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rs.{parseFloat(r.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(r.status)}`}>
                        {r.status?.charAt(0).toUpperCase() + r.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {r.status === 'pending' && (
                          <>
                            <button onClick={() => updateRentalStatus(r.id, 'confirmed')} className="text-green-600 hover:text-green-900 p-1 rounded" title="Confirm">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => updateRentalStatus(r.id, 'cancelled')} className="text-red-600 hover:text-red-900 p-1 rounded" title="Cancel">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {r.status === 'confirmed' && (
                          <button onClick={() => updateRentalStatus(r.id, 'cancelled')} className="text-red-600 hover:text-red-900 p-1 rounded" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500">Total Court Bookings</h3>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500">Total Rentals</h3>
          <p className="text-2xl font-bold text-gray-900">{rentals.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500">Pending Approvals</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {bookings.filter(b => b.status === 'Pending').length + rentals.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            Rs.{(
              bookings.filter(b => b.status !== 'Cancelled').reduce((s, b) => s + b.amount, 0) +
              rentals.filter(r => r.status !== 'cancelled').reduce((s: number, r: any) => s + parseFloat(r.amount), 0)
            ).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}