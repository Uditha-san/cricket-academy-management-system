import React, { useState } from 'react';
import { ArrowLeft, Plus, CreditCard as Edit2, Trash2, Package } from 'lucide-react';

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

export default function ManageEquipmentPage({ onNavigate }: ManageEquipmentPageProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: '1',
      name: 'Premium Cricket Bat',
      category: 'Bats',
      price: 2500,
      stock: 12,
      // use local asset (same as player shop)
      image: '/assets/bat.webp',
      description: 'Professional grade willow cricket bat'
    },
    {
      id: '2',
      name: 'Professional Batting Pads',
      category: 'Protective Gear',
  price: 10000,
      stock: 8,
      image: '/assets/pads.jpg',
      description: 'Lightweight and comfortable batting pads'
    },
    {
      id: '3',
      name: 'Wicket Keeping Gloves',
      category: 'Gloves',
      price: 8000,
      stock: 15,
      image: '/assets/gloves.webp',
      description: 'High-quality wicket keeping gloves'
    },
    {
      id: '4',
      name: 'Professional Cricket Helmet',
      category: 'Protective Gear',
      price: 7000,
      stock: 6,
      image: '/assets/helmet.jpg',
      description: 'Safety certified cricket helmet'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    image: '',
    description: ''
  });

  const categories = ['Bats', 'Protective Gear', 'Gloves', 'Balls', 'Footwear', 'Accessories'];

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: categories[0],
      price: 0,
      stock: 0,
      image: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item: Equipment) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setEquipment(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      // Update existing item
      setEquipment(prev => prev.map(item => 
        item.id === editingItem.id ? { ...formData as Equipment } : item
      ));
    } else {
      // Add new item
      const newItem: Equipment = {
        ...formData as Equipment,
        id: Date.now().toString()
      };
      setEquipment(prev => [...prev, newItem]);
    }
    
    setShowModal(false);
    setFormData({});
  };

  const handleStockUpdate = (id: string, newStock: number) => {
    setEquipment(prev => prev.map(item =>
      item.id === id ? { ...item, stock: Math.max(0, newStock) } : item
    ));
  };

  const getStockStatusClass = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 5) return 'Low Stock';
    return 'In Stock';
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Equipment</h1>
            <p className="text-lg text-gray-600">Add, edit, and manage cricket equipment inventory</p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {equipment.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {item.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-green-600">Rs.{item.price}</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusClass(item.stock)}`}>
                  {getStockStatusText(item.stock)}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Stock Quantity</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStockUpdate(item.id, item.stock - 1)}
                      className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300"
                      disabled={item.stock === 0}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{item.stock}</span>
                    <button
                      onClick={() => handleStockUpdate(item.id, item.stock + 1)}
                      className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingItem ? 'Edit Equipment' : 'Add New Equipment'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {editingItem ? 'Update' : 'Add'} Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{equipment.length}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {equipment.reduce((sum, item) => sum + item.stock, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {equipment.filter(item => item.stock < 5 && item.stock > 0).length}
              </p>
              <p className="text-sm text-gray-600">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {equipment.filter(item => item.stock === 0).length}
              </p>
              <p className="text-sm text-gray-600">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}