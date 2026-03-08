import { Calendar, Package, Users, DollarSign, BarChart3, ShoppingCart, Bell, Check, X, MapPin, Phone, ChevronRight, Clock } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { adminApi } from '../../api/admin';
import { useData } from '../../contexts/DataContext';
import api from '../../api/axios';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

interface OrderItem { id: string; productName: string; quantity: number; unitPrice: number; }
interface Order {
  id: string;
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'cancelled';
  items: OrderItem[];
  createdAt: string;
  user?: { name: string; email: string; role: string };
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [totalPlayers, setTotalPlayers] = useState<number | string>('…');
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { bookings } = useData();

  useEffect(() => {
    adminApi.getPlayers().then(players => setTotalPlayers(players.length)).catch(console.error);
    api.get('/orders').then(r => setOrders(r.data)).catch(console.error);
  }, []);

  const totalRevenue = useMemo(() =>
    bookings.filter(b => b.status !== 'Cancelled').reduce((s, b) => s + b.amount, 0),
    [bookings]);

  const equipmentRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.totalAmount), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const allOrdersCount = orders.filter(o => o.status !== 'cancelled').length;

  /* Quick-action: update order status from the dashboard */
  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    setUpdatingId(id);
    try {
      const res = await api.patch(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: res.data.status } : o));
    } catch (err) {
      console.error('Failed to update order', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = [
    {
      title: 'Total Bookings',
      value: bookings.length.toString(),
      sub: '+10% this month',
      icon: Calendar,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Equipment Orders',
      value: allOrdersCount.toString(),
      sub: pendingOrders.length > 0 ? `${pendingOrders.length} awaiting action` : 'All up to date',
      icon: ShoppingCart,
      color: 'text-green-600 bg-green-100',
      onClick: () => onNavigate('equipment'),
      badge: pendingOrders.length,
    },
    {
      title: 'Active Players',
      value: totalPlayers,
      sub: '+15% this month',
      icon: Users,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Total Revenue',
      value: `Rs.${(totalRevenue + equipmentRevenue).toLocaleString()}`,
      sub: 'Bookings + Equipment',
      icon: DollarSign,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings]);

  const monthlyData = useMemo(() => {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const cm = new Date().getMonth();
    return Array.from({ length: 3 }, (_, i) => {
      let m = cm - (2 - i);
      let y = new Date().getFullYear();
      if (m < 0) { m += 12; y--; }
      const mb = bookings.filter(b => { const d = new Date(b.bookingDate); return d.getMonth() === m && d.getFullYear() === y; });
      return { month: names[m], bookings: mb.length, revenue: mb.filter(b => b.status !== 'Cancelled').reduce((s, b) => s + b.amount, 0) };
    });
  }, [bookings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your cricket academy operations</p>
        </div>
        {pendingOrders.length > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2.5 rounded-xl text-sm font-medium animate-pulse">
            <Bell className="w-4 h-4 shrink-0" />
            {pendingOrders.length} new equipment order{pendingOrders.length !== 1 ? 's' : ''} need attention
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i}
              onClick={(stat as any).onClick}
              className={`relative bg-white rounded-2xl p-6 shadow-md transition-all duration-200 ${(stat as any).onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5' : ''}`}>
              {(stat as any).badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                  {(stat as any).badge}
                </span>
              )}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-xs font-medium text-green-600 mt-0.5">{stat.sub}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── New Equipment Orders ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">New Equipment Orders</h2>
              <p className="text-xs text-gray-500">
                {pendingOrders.length === 0
                  ? 'All orders have been processed'
                  : `${pendingOrders.length} order${pendingOrders.length !== 1 ? 's' : ''} waiting for confirmation`}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('equipment')}
            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 font-medium"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Check className="w-10 h-10 mx-auto mb-2 text-green-400" />
            <p className="font-medium text-gray-600">No pending orders</p>
            <p className="text-sm">New orders will appear here as they come in.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pendingOrders.map(order => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: order info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* NEW badge */}
                    <div className="shrink-0 mt-0.5">
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> NEW
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{order.deliveryName}</p>
                        {order.user && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.user.role === 'guest'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-100 text-blue-700'
                            }`}>
                            {order.user.role === 'guest' ? 'Guest' : 'Member'}
                          </span>
                        )}
                      </div>

                      {/* Delivery address */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <MapPin className="w-3 h-3 shrink-0 text-green-500" />
                        <span className="truncate">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                        <Phone className="w-3 h-3 shrink-0 text-green-500" />
                        {order.deliveryPhone}
                      </div>

                      {/* Items list */}
                      <div className="flex flex-wrap gap-2">
                        {order.items.map(item => (
                          <span key={item.id}
                            className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-lg">
                            {item.productName} ×{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: amount + actions */}
                  <div className="shrink-0 text-right flex flex-col items-end gap-2">
                    <p className="text-lg font-bold text-gray-900">
                      Rs.{Number(order.totalAmount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => updateStatus(order.id, 'confirmed')}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Confirm
                      </button>
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        className="flex items-center gap-1 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Monthly Performance</h2>
          <div className="space-y-5">
            {monthlyData.map((data, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1.5">
                  <span>{data.month}</span>
                  <span className="text-gray-500">{data.bookings} bookings · Rs.{data.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((data.bookings / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Manage Bookings', page: 'bookings', icon: Calendar, bg: 'bg-blue-50   text-blue-700   hover:bg-blue-100' },
              { label: 'Equipment Orders', page: 'equipment', icon: ShoppingCart, bg: 'bg-green-50  text-green-700  hover:bg-green-100', badge: pendingOrders.length },
              { label: 'Manage Players', page: 'players', icon: Users, bg: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
              { label: 'View Reports', page: 'reports', icon: BarChart3, bg: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
            ].map(({ label, page, icon: Icon, bg, badge }) => (
              <button key={page} onClick={() => onNavigate(page)}
                className={`relative w-full flex items-center justify-between p-3.5 rounded-xl transition-colors ${bg}`}>
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {badge && badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Booking ID', 'Player', 'Court', 'Date & Time', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No recent bookings available.</td>
                </tr>
              ) : recentBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">…{booking.id.slice(-6)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{booking.courtName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.date} · {booking.timeSlot}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
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