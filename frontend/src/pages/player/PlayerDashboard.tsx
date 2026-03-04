import { Calendar, Wrench, ShoppingBag, TrendingUp, Trophy, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useStats } from '../../contexts/StatsContext';


interface PlayerDashboardProps {
  onNavigate: (page: string) => void;
}

export default function PlayerDashboard({ onNavigate }: PlayerDashboardProps) {
  const { user } = useAuth();
  const { bookings, feedbacks } = useData();
  const { getStats } = useStats();
  const myBookings = bookings.filter(b => b.userId === user?.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingBookings = myBookings.filter(b => new Date(b.date) >= new Date()).slice(0, 2);

  const stats = user ? getStats(user.id) : null;
  const latestFeedback = feedbacks.find(f => f.playerId === user?.id);

  const totalSessions = myBookings.length;
  // Calculate a mock avg score if matches played > 0, else 0. 
  // In a real app, this would come from a more detailed match history.
  const avgScore = stats && stats.general.matchesPlayed > 0
    ? Math.round(stats.batting.totalRuns / stats.general.matchesPlayed)
    : 0;

  const playerStats = {
    totalSessions: totalSessions,
    averageScore: avgScore,
    highestScore: stats ? stats.batting.highestScore : 0,
    totalWickets: stats ? stats.bowling.totalWickets : 0
  };

  const quickActions = [
    {
      id: 'booking',
      title: 'Book Court',
      description: 'Reserve your practice time',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      id: 'rental',
      title: 'Rent Machine',
      description: 'Bowling & batting practice',
      icon: Wrench,
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
        <div className="bg-white rounded-xl p-4 shadow-lg">
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
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
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
    </div>
  );
}