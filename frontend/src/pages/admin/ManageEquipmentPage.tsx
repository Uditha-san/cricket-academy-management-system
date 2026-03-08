import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, CreditCard as Edit2, Trash2, Package, ShoppingCart, Check, X, Clock, Bell } from 'lucide-react';
import api from '../../api/axios';

interface ManageEquipmentPageProps {
  onNavigate: (page: string) => void;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
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

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function ManageEquipmentPage({ onNavigate }: ManageEquipmentPageProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');

  /* ── Inventory state ─────────────────────────────────────────── */
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [invLoading, setInvLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState<Partial<Equipment>>({ name: '', category: '', price: 0, stock: 0, image: '', description: '' });
  const categories = ['Bats', 'Protective Gear', 'Gloves', 'Balls', 'Footwear', 'Accessories'];

  /* ── Orders state ────────────────────────────────────────────── */
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Fetch inventory
  const fetchInventory = async () => {
    setInvLoading(true);
    try {
      const res = await api.get('/equipment');
      setEquipment(res.data);
    } catch (err) {
      console.error('Fetch inventory error:', err);
    } finally {
      setInvLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    // Load pending count for notification badge
    api.get('/orders/pending-count')
      .then(r => setPendingCount(r.data.count))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      setOrdersLoading(true);
      api.get('/orders')
        .then(r => setOrders(r.data))
        .catch(console.error)
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab]);

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const res = await api.patch(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: res.data.status } : o));
      if (status !== 'pending') setPendingCount(c => Math.max(0, c - 1));
      // Refresh inventory because stock might have changed (actually stock changes on order creation, but good to have)
      fetchInventory();
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  /* ── Inventory handlers ──────────────────────────────────────── */
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', category: categories[0], price: 0, stock: 0, image: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (item: Equipment) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this item?')) {
      try {
        await api.delete(`/equipment/${id}`);
        setEquipment(prev => prev.filter(i => i.id !== id));
      } catch (err) {
        alert('Failed to delete item.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await api.put(`/equipment/${editingItem.id}`, formData);
        setEquipment(prev => prev.map(i => i.id === editingItem.id ? res.data : i));
      } else {
        const res = await api.post('/equipment', formData);
        setEquipment(prev => [...prev, res.data]);
      }
      setShowModal(false);
    } catch (err) {
      alert('Failed to save equipment.');
    }
  };

  const handleStockUpdate = async (id: string, n: number) => {
    const item = equipment.find(i => i.id === id);
    if (!item) return;
    try {
      const res = await api.put(`/equipment/${id}`, { ...item, stock: Math.max(0, n) });
      setEquipment(prev => prev.map(i => i.id === id ? res.data : i));
    } catch (err) {
      console.error('Stock update failed', err);
    }
  };

  const stockClass = (s: number) => s === 0 ? 'bg-red-100 text-red-800' : s < 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
  const stockLabel = (s: number) => s === 0 ? 'Out of Stock' : s < 5 ? 'Low Stock' : 'In Stock';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Equipment</h1>
            <p className="text-lg text-gray-600">Inventory management and order fulfillment</p>
          </div>
          {activeTab === 'inventory' && (
            <button onClick={handleAdd} className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center">
              <Plus className="w-5 h-5 mr-2" /> Add Equipment
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
          <Package className="w-4 h-4" /> Inventory
        </button>
        <button onClick={() => setActiveTab('orders')}
          className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
          <ShoppingCart className="w-4 h-4" /> Orders
          {pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Inventory Tab ─────────────────────────────────────────── */}
      {activeTab === 'inventory' && (
        <>
          {invLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {equipment.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover" onError={e => { e.currentTarget.src = '/assets/bat.webp'; }} />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                      <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-1 rounded shrink-0 ml-2">{item.category}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold text-green-600">Rs.{Number(item.price).toLocaleString()}</span>
                        <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${stockClass(item.stock)}`}>{stockLabel(item.stock)}</span>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Stock Quantity</span>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleStockUpdate(item.id, item.stock - 1)} disabled={item.stock === 0}
                              className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50">-</button>
                            <span className="w-12 text-center font-semibold">{item.stock}</span>
                            <button onClick={() => handleStockUpdate(item.id, item.stock + 1)}
                              className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700">+</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(item)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center text-sm">
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center text-sm">
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inventory summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Items', value: equipment.length, icon: Package, color: 'text-blue-500' },
              { label: 'Total Stock', value: equipment.reduce((s, i) => s + i.stock, 0), icon: Package, color: 'text-green-500' },
              { label: 'Low Stock', value: equipment.filter(i => i.stock < 5 && i.stock > 0).length, icon: Bell, color: 'text-yellow-500' },
              { label: 'Out of Stock', value: equipment.filter(i => i.stock === 0).length, icon: Package, color: 'text-red-500' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-6 shadow-lg flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-600">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Orders Tab ────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div>
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  {/* Order row */}
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{order.deliveryName}</p>
                        <p className="text-sm text-gray-500">{order.deliveryPhone} • {order.deliveryAddress}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} •
                          {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {order.user && <span className="ml-1 text-blue-500">• {order.user.role === 'guest' ? 'Guest' : 'Member'}: {order.user.name}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-base font-bold text-green-600">Rs.{Number(order.totalAmount).toLocaleString()}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLE[order.status]}`}>{order.status}</span>

                      {/* Action buttons */}
                      {order.status === 'pending' && (
                        <>
                          <button onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                            <Check className="w-3.5 h-3.5" /> Confirm
                          </button>
                          <button onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <button onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                          <Package className="w-3.5 h-3.5" /> Mark Shipped
                        </button>
                      )}

                      <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="text-gray-400 hover:text-gray-600 text-xs underline">
                        {expandedOrder === order.id ? 'Less' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {expandedOrder === order.id && (
                    <div className="border-t bg-gray-50 px-5 py-4 space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm text-gray-700">
                          <span>{item.productName} × {item.quantity}</span>
                          <span className="font-medium">Rs.{(item.quantity * Number(item.unitPrice)).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                        <span>Total</span>
                        <span className="text-green-600">Rs.{Number(order.totalAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Orders summary */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-500' },
              { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-yellow-500' },
              { label: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, icon: Check, color: 'text-blue-500' },
              { label: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, icon: Package, color: 'text-green-500' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-5 shadow-lg flex items-center gap-3">
                <s.icon className={`w-7 h-7 ${s.color}`} />
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-600">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingItem ? 'Edit Equipment' : 'Add New Equipment'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select value={formData.category || ''} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
                  <input type="number" value={formData.price || ''} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" min="0" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input type="number" value={formData.stock || ''} onChange={e => setFormData(p => ({ ...p, stock: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" min="0" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input type="text" value={formData.image || ''} onChange={e => setFormData(p => ({ ...p, image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  {editingItem ? 'Update' : 'Add'} Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}