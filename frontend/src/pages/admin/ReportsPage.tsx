import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Download, Calendar, DollarSign, Users, Package, TrendingUp, BarChart3, Loader2, FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { adminApi } from '../../api/admin';
import api from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsPageProps {
  onNavigate: (page: string) => void;
}

interface OrderItem { id: string; productName: string; quantity: number; unitPrice: number; }
interface Order {
  id: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

export default function ReportsPage({ onNavigate }: ReportsPageProps) {
  const { bookings } = useData();
  const [players, setPlayers] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [playersRes, ordersRes] = await Promise.all([
          adminApi.getPlayers(),
          api.get('/orders')
        ]);
        setPlayers(Array.isArray(playersRes) ? playersRes : []);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Calculate Real Stats
  const stats = useMemo(() => {
    const validBookings = bookings.filter(b => b.status !== 'Cancelled');
    const validOrders = orders.filter(o => o.status !== 'cancelled');

    const bookingRev = validBookings.reduce((sum, b) => sum + Number(b.amount), 0);
    const orderRev = validOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalRev = bookingRev + orderRev;

    // Monthly data grouping
    const monthMap: Record<string, { month: string; bookings: number; revenue: number; orders: number }> = {};

    // Process last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthMap[key] = { month: key, bookings: 0, revenue: 0, orders: 0 };
    }

    validBookings.forEach(b => {
      const date = b.date ? new Date(b.date) : new Date();
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthMap[key]) {
        monthMap[key].bookings++;
        monthMap[key].revenue += Number(b.amount || 0);
      }
    });

    validOrders.forEach(o => {
      const date = o.createdAt ? new Date(o.createdAt) : new Date();
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthMap[key]) {
        monthMap[key].orders++;
        monthMap[key].revenue += Number(o.totalAmount || 0);
      }
    });

    const monthlyTrends = Object.values(monthMap);

    return {
      totalRevenue: totalRev,
      totalBookings: validBookings.length,
      totalPlayers: players.length,
      equipmentOrders: validOrders.length,
      avgOrderValue: totalRev / (validBookings.length + validOrders.length || 1),
      trends: monthlyTrends,
      recentTransactions: [
        ...validBookings.map(b => ({ id: b.id, date: b.date, user: b.userName, type: 'Booking', amount: b.amount, status: b.status })),
        ...validOrders.map(o => ({
          id: o.id,
          date: o.createdAt ? o.createdAt.split('T')[0] : 'N/A',
          user: (o as any).deliveryName || 'Customer',
          type: 'Equipment',
          amount: o.totalAmount,
          status: o.status
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
    };
  }, [bookings, players, orders]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74); // Green
    doc.text('Cricket Academy Pro 360', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.text('Business Summary Report', 105, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Generated on: ${dateStr}`, 105, 38, { align: 'center' });

    // Key Stats Section
    doc.setFontSize(14);
    doc.text('Performance Summary', 14, 50);
    doc.setLineWidth(0.5);
    doc.line(14, 52, 196, 52);

    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `Rs.${stats.totalRevenue.toLocaleString()}`],
        ['Total Facility Bookings', stats.totalBookings.toString()],
        ['Total Equipment Orders', stats.equipmentOrders.toString()],
        ['Registered Players', stats.totalPlayers.toString()],
        ['Average Transaction Value', `Rs.${stats.avgOrderValue.toFixed(2)}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] }
    });

    // Recent Transactions
    doc.text('Recent Transactions', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Customer', 'Type', 'Amount', 'Status']],
      body: stats.recentTransactions.map(t => [
        t.date,
        t.user,
        t.type,
        `Rs.${Number(t.amount).toLocaleString()}`,
        t.status
      ]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Confidential - Cricket Academy Management System', 105, 285, { align: 'center' });

    doc.save(`Academy_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Analyzing real-time data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
            <p className="text-gray-500">Live performance insights from your academy operations</p>
          </div>
          <button
            onClick={generatePDF}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Revenue', value: `Rs.${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600 bg-green-50', sub: 'Bookings + Shop' },
          { label: 'Facility Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-blue-600 bg-blue-50', sub: 'Confirmed sessions' },
          { label: 'Active Players', value: stats.totalPlayers, icon: Users, color: 'text-purple-600 bg-purple-50', sub: 'Registered members' },
          { label: 'Shop Sales', value: stats.equipmentOrders, icon: Package, color: 'text-orange-600 bg-orange-50', sub: 'Successful orders' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-50">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-sm font-semibold text-gray-500">{kpi.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trends and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" /> Revenue Trend (Last 6 Months)
          </h2>
          <div className="space-y-6">
            {stats.trends.map((data, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>{data.month}</span>
                  <span className="text-green-600">Rs.{data.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((data.revenue / (stats.totalRevenue / 3 || 1)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{data.bookings} bookings · {data.orders} orders</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Recent Activity
          </h2>
          <div className="space-y-4">
            {stats.recentTransactions.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{t.user || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${t.type === 'Booking' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                    {t.type} • {t.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">Rs.{Number(t.amount).toLocaleString()}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${t.status.toLowerCase() === 'confirmed' || t.status.toLowerCase() === 'completed' || t.status.toLowerCase() === 'shipped'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Export Cards */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Detailed Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Financial Audit', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 shadow-green-100', desc: 'Revenue breakdown by facility and equipment sales.' },
          { title: 'Player Analytics', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 shadow-blue-100', desc: 'Member growth, attendance and participation trends.' },
          { title: 'Inventory Status', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50 shadow-purple-100', desc: 'Current stock levels and high-demand products.' },
        ].map((card, i) => (
          <button key={i} onClick={generatePDF} className="group p-6 bg-white rounded-2xl shadow-md border border-gray-50 text-left hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{card.desc}</p>
            <div className="flex items-center text-xs font-bold text-green-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <FileText className="w-3.5 h-3.5" /> Download Snapshot
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}