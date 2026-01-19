import { useState } from 'react';
import { ArrowLeft, Download, Calendar, DollarSign, Users, Package, TrendingUp, BarChart3 } from 'lucide-react';

interface ReportsPageProps {
  onNavigate: (page: string) => void;
}

export default function ReportsPage({ onNavigate }: ReportsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const monthlyData = [
    { month: 'Oct 2024', bookings: 120, revenue: 89000, players: 45, equipment: 2100 },
    { month: 'Nov 2024', bookings: 145, revenue: 105000, players: 52, equipment: 2850 },
    { month: 'Dec 2024', bookings: 132, revenue: 98500, players: 48, equipment: 2300 },
    { month: 'Jan 2025', bookings: 156, revenue: 118000, players: 58, equipment: 3200 }
  ];

  const topPerformers = [
    { type: 'Courts', name: 'Court 1', bookings: 89, revenue: 78000 },
    { type: 'Courts', name: 'Court 2', bookings: 67, revenue: 58500 },
    { type: 'Equipment', name: 'Premium Cricket Bat', sales: 45, revenue: 112500 },
  { type: 'Equipment', name: 'Professional Batting Pads', sales: 32, revenue: 320000 }
  ];

  const recentTransactions = [
    { id: 'T001', date: '2025-01-21', player: 'Rahul Sharma', type: 'Court Booking', amount: 944, status: 'Completed' },
    { id: 'T002', date: '2025-01-21', player: 'Priya Patel', type: 'Equipment Purchase', amount: 2500, status: 'Completed' },
    { id: 'T003', date: '2025-01-20', player: 'Michael Johnson', type: 'Machine Rental', amount: 354, status: 'Completed' },
    { id: 'T004', date: '2025-01-20', player: 'Sarah Williams', type: 'Court Booking', amount: 708, status: 'Refunded' },
    { id: 'T005', date: '2025-01-19', player: 'David Chen', type: 'Equipment Purchase', amount: 1200, status: 'Completed' }
  ];

  const summaryStats = {
    totalRevenue: monthlyData.reduce((sum, month) => sum + month.revenue, 0),
    totalBookings: monthlyData.reduce((sum, month) => sum + month.bookings, 0),
    totalPlayers: 234,
    averageBookingValue: 756,
    growthRate: 23.5
  };

  const handleExportReport = (type: string) => {
    // Here you would implement actual export functionality
    alert(`Exporting ${type} report...`);
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-lg text-gray-600">Comprehensive business insights and performance data</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button
              onClick={() => handleExportReport('comprehensive')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">Rs.{summaryStats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xs text-green-600 font-medium">+{summaryStats.growthRate}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalBookings}</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-xs text-blue-600 font-medium">+15%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalPlayers}</p>
              <p className="text-sm text-gray-600">Active Players</p>
              <p className="text-xs text-purple-600 font-medium">+8%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">Rs.{summaryStats.averageBookingValue}</p>
              <p className="text-sm text-gray-600">Avg Booking Value</p>
              <p className="text-xs text-orange-600 font-medium">+12%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">95%</p>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-xs text-red-600 font-medium">+3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
            <button
              onClick={() => handleExportReport('revenue')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Export
            </button>
          </div>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>{data.month}</span>
                    <span>Rs.{data.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" 
                      style={{ width: `${(data.revenue / 120000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Performance */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Booking Performance</h2>
            <button
              onClick={() => handleExportReport('bookings')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Export
            </button>
          </div>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>{data.month}</span>
                    <span>{data.bookings} bookings</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" 
                      style={{ width: `${(data.bookings / 200) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Top Performers</h2>
            <button
              onClick={() => handleExportReport('performers')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Export
            </button>
          </div>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{performer.name}</p>
                  <p className="text-sm text-gray-600">{performer.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Rs.{performer.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    {performer.type === 'Courts' ? `${performer.bookings} bookings` : `${performer.sales} sales`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            <button
              onClick={() => handleExportReport('transactions')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Export
            </button>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{transaction.player}</p>
                  <p className="text-sm text-gray-600">{transaction.type} • {transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Rs.{transaction.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleExportReport('financial')}
            className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <DollarSign className="w-6 h-6 text-green-600 mr-2" />
            <span className="font-medium">Financial Report</span>
          </button>
          <button
            onClick={() => handleExportReport('customer')}
            className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            <span className="font-medium">Customer Report</span>
          </button>
          <button
            onClick={() => handleExportReport('inventory')}
            className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <Package className="w-6 h-6 text-purple-600 mr-2" />
            <span className="font-medium">Inventory Report</span>
          </button>
          <button
            onClick={() => handleExportReport('operational')}
            className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-orange-600 mr-2" />
            <span className="font-medium">Operations Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}