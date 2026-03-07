import { Calendar, ShoppingBag, TrendingUp, Trophy, Target, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface PlayerDashboardProps {
  onNavigate: (page: string) => void;
}

export default function PlayerDashboard({ onNavigate }: PlayerDashboardProps) {
  const { user } = useAuth();
  const { bookings, feedbacks, refreshBookings } = useData();
  const [performance, setPerformance] = useState<any>(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    if (user && user.id !== 'guest') {
      api.get('/users/profile').then(res => {
        setPerformance(res.data.performance);
      }).catch(console.error);

      refreshBookings().catch(console.error);
    }
  }, [user]);

  const myBookings = bookings.filter(b => b.userId === user?.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingBookings = myBookings.filter(b => b.date >= todayStr).slice(0, 5); // Let's show up to 5

  const latestFeedback = feedbacks.find(f => f.playerId === user?.id);

  const totalSessions = myBookings.length;
  const avgScore = performance && performance.matchesPlayed > 0
    ? Math.round(performance.totalRuns / performance.matchesPlayed)
    : 0;

  const playerStats = {
    totalSessions: totalSessions,
    averageScore: performance?.battingAverage || avgScore,
    highestScore: performance ? performance.highestScore : 0,
    totalWickets: performance ? performance.totalWickets : 0
  };

  const quickActions = [
    {
      id: 'booking',
      title: 'Make a Booking',
      description: 'Reserve court or machines',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      id: 'profile',
      title: 'My Profile',
      description: 'Update your details',
      icon: UserIcon,
      color: 'bg-blue-500'
    },
    {
      id: 'shop',
      title: 'Shop Equipment',
      description: 'Get the gear you need',
      icon: ShoppingBag,
      color: 'bg-orange-500'
    },
    {
      id: 'stats',
      title: 'View Stats',
      description: 'Track your progress',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-lg text-gray-600">Ready for another great session?</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setShowBookingsModal(true)}
          className="bg-white rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow ring-2 ring-transparent hover:ring-yellow-500"
        >
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{playerStats.totalSessions}</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{playerStats.averageScore}</p>
              <p className="text-sm text-gray-600">Avg Runs/Match</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => onNavigate('stats')}
          className="bg-white rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow ring-2 ring-transparent hover:ring-blue-500"
        >
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">{playerStats.highestScore}</p>
              <p className="text-sm text-gray-600">Highest Score</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{playerStats.totalWickets}</p>
              <p className="text-sm text-gray-600">Total Wickets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-center">{action.title}</h3>
              <p className="text-xs text-gray-600 text-center">{action.description}</p>
            </button>
          );
        })}
      </div>

      {/* Upcoming Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Bookings</h2>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedBooking(booking)}
                  className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{booking.courtName}</p>
                    <p className="text-sm text-gray-600">{booking.date} • {booking.timeSlot}</p>
                    <p className="text-xs text-gray-500">{booking.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming bookings</p>
            </div>
          )}
        </div>

        {/* Latest Coach Feedback (Preview) */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Coach's Latest Feedback</h2>
          {latestFeedback ? (
            <>
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{latestFeedback.category}</h3>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">{latestFeedback.date}</span>
                </div>
                <p className="text-green-100 text-sm">
                  "{latestFeedback.comment}"
                </p>
              </div>
              <button
                onClick={() => onNavigate('stats')}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                View All Feedback
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-green-100">
              <p>No feedback available yet.</p>
              <p className="text-sm opacity-75 mt-2">Book a session with a coach to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Booking Details</h2>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <p><strong>Facility:</strong> {selectedBooking.courtName}</p>
              <p><strong>Date:</strong> {selectedBooking.date}</p>
              <p><strong>Time:</strong> {selectedBooking.timeSlot}</p>
              <p><strong>Amount:</strong> Rs.{selectedBooking.amount}</p>
              <p><strong>Status:</strong> <span className={`font-medium ${selectedBooking.status === 'Confirmed' ? 'text-green-600' : selectedBooking.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'}`}>{selectedBooking.status}</span></p>
              <p className="text-xs text-gray-400 mt-4">Booking ID: {selectedBooking.id}</p>
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* All Bookings Modal */}
      {showBookingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full relative max-h-[80vh] flex flex-col">
            <button
              onClick={() => setShowBookingsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">My Bookings History</h2>
            <div className="overflow-y-auto space-y-3 flex-1 pr-2">
              {myBookings.length > 0 ? (
                myBookings.map((booking, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setShowBookingsModal(false);
                      setSelectedBooking(booking);
                    }}
                    className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{booking.courtName}</p>
                      <p className="text-sm text-gray-600">{booking.date} at {booking.timeSlot}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${booking.status === 'Confirmed' ? 'text-green-600' : booking.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {booking.status}
                      </p>
                      <p className="text-sm">Rs.{booking.amount}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No bookings found in history.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}