import { Calendar, Package, Users, DollarSign, BarChart3 } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const stats = [
    { 
      title: 'Total Bookings', 
      value: '156', 
      change: '+12%', 
      icon: Calendar, 
      color: 'text-blue-600 bg-blue-100' 
    },
    { 
      title: 'Equipment Sales', 
      value: '89', 
      change: '+8%', 
      icon: Package, 
      color: 'text-green-600 bg-green-100' 
    },
    { 
      title: 'Active Players', 
      value: '234', 
      change: '+15%', 
      icon: Users, 
      color: 'text-purple-600 bg-purple-100' 
    },
    { 
      title: 'Revenue', 
  value: 'Rs.45,280', 
      change: '+23%', 
      icon: DollarSign, 
      color: 'text-orange-600 bg-orange-100' 
    }
  ];

  const recentBookings = [
    { id: 'B001', player: 'Rahul Sharma', court: 'Court 1', time: '10:00 AM', date: '2025-01-22', status: 'Confirmed' },
    { id: 'B002', player: 'Priya Patel', court: 'Court 2', time: '2:00 PM', date: '2025-01-22', status: 'Pending' },
    { id: 'B003', player: 'Michael Johnson', court: 'Court 3', time: '4:00 PM', date: '2025-01-22', status: 'Confirmed' },
    { id: 'B004', player: 'Sarah Williams', court: 'Court 1', time: '6:00 PM', date: '2025-01-22', status: 'Cancelled' }
  ];

  const monthlyData = [
    { month: 'Jan', bookings: 120, revenue: 38000 },
    { month: 'Feb', bookings: 135, revenue: 42000 },
    { month: 'Mar', bookings: 156, revenue: 45280 }
  ];

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
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.player}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.court}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.date} • {booking.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
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