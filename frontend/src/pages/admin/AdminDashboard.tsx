import { Calendar, Package, Users, DollarSign, BarChart3 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { adminApi } from '../../api/admin';
import { useData } from '../../contexts/DataContext';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [totalPlayers, setTotalPlayers] = useState<number | string>('Loading...');
  const { bookings } = useData();

  useEffect(() => {
    adminApi.getPlayers().then(players => {
      setTotalPlayers(players.length);
    }).catch(console.error);
  }, []);
  const totalRevenue = useMemo(() => {
    return bookings
      .filter(b => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + b.amount, 0);
  }, [bookings]);

  const stats = [
    {
      title: 'Total Bookings',
      value: bookings.length.toString(),
      change: '+10%', // Currently static as we don't have previous month tracking
      icon: Calendar,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Equipment Sales',
      value: '0', // Will be built when rentals are implemented
      change: '0%',
      icon: Package,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Active Players',
      value: totalPlayers,
      change: '+15%',
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Revenue',
      value: `Rs.${totalRevenue.toLocaleString()}`,
      change: '+20%',
      icon: DollarSign,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const recentBookings = useMemo(() => {
    // Sort logic already defaults to DESC from backend, but ensuring latest 5 elements
    return bookings.slice(0, 5);
  }, [bookings]);

  const monthlyData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const data = [];

    // Generates last 3 months
    for (let i = 2; i >= 0; i--) {
      let m = currentMonth - i;
      let y = new Date().getFullYear();
      if (m < 0) {
        m += 12;
        y--;
      }

      const monthBookings = bookings.filter(b => {
        const d = new Date(b.bookingDate);
        return d.getMonth() === m && d.getFullYear() === y;
      });

      const monthRev = monthBookings
        .filter(b => b.status !== 'Cancelled')
        .reduce((sum, b) => sum + b.amount, 0);

      data.push({
        month: monthNames[m],
        bookings: monthBookings.length,
        revenue: monthRev
      });
    }
    return data;
  }, [bookings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">Manage your cricket stadium operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-sm font-medium text-green-600">{stat.change} from last month</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Performance Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Performance</h2>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>{data.month}</span>
                    <span>{data.bookings} bookings</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(data.bookings / 200) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-lg font-semibold text-gray-900">Rs.{data.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('bookings')}
              className="w-full flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-3" />
              Manage Bookings
            </button>
            <button
              onClick={() => onNavigate('equipment')}
              className="w-full flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Package className="w-5 h-5 mr-3" />
              Manage Equipment
            </button>
            <button
              onClick={() => onNavigate('players')}
              className="w-full flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Users className="w-5 h-5 mr-3" />
              Manage Players
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="w-full flex items-center p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Court
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No recent bookings available.
                  </td>
                </tr>
              ) : recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ...{booking.id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.courtName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.date} • {booking.timeSlot}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}