import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingCart, Check, ShoppingBag, Search, X, MapPin, Phone, User, CreditCard, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../api/axios';

interface EquipmentShopPageProps {
  onNavigate: (page: string) => void;
}

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  description: string;
  stock: number;
}

const CATEGORY_META: Record<string, { emoji: string; color: string; bg: string; desc: string }> = {
  'Bats': { emoji: '🏏', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200 hover:border-amber-400', desc: 'English willow & Kashmir willow cricket bats' },
  'Protective Gear': { emoji: '🛡️', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200 hover:border-blue-400', desc: 'Pads, helmets, arm guards & chest guards' },
  'Gloves': { emoji: '🥊', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200 hover:border-purple-400', desc: 'Batting gloves, keeping gloves & inner gloves' },
  'Balls': { emoji: '⚾', color: 'text-red-700', bg: 'bg-red-50 border-red-200 hover:border-red-400', desc: 'Leather, white & synthetic training balls' },
  'Footwear': { emoji: '👟', color: 'text-green-700', bg: 'bg-green-50 border-green-200 hover:border-green-400', desc: 'Spike shoes & rubber sole cricket shoes' },
  'Accessories': { emoji: '🎒', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200 hover:border-gray-400', desc: 'Kit bags, grips, anti scuff sheets & more' },
};

const FALLBACK_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial" font-size="20">No Image</text></svg>';

/* ── Step indicator badge ─────────────────────────────────────── */
function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'text-green-700' : done ? 'text-green-500' : 'text-gray-400'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${done ? 'bg-green-500 border-green-500 text-white' :
        active ? 'bg-white border-green-600 text-green-700' :
          'bg-white border-gray-300 text-gray-400'}`}>
        {done ? <Check className="w-3.5 h-3.5" /> : n}
      </div>
      <span className={`text-sm font-medium hidden sm:inline ${active ? 'text-green-700' : done ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

/* ── Mini order summary sidebar (reused in both checkout steps) ── */
function OrderSidebar({ products, cart, totalItems, totalPrice }: { products: Product[]; cart: Record<string, number>; totalItems: number; totalPrice: number }) {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg h-fit">
      <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
      <div className="space-y-3 mb-4">
        {Object.entries(cart).map(([id, qty]) => {
          const p = products.find(x => x.id === id);
          if (!p) return null;
          return (
            <div key={id} className="flex items-center gap-3">
              <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover"
                onError={e => { e.currentTarget.src = FALLBACK_IMG; }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-500">×{qty}</p>
              </div>
              <p className="text-xs font-bold text-gray-800 shrink-0">Rs.{(p.price * qty).toLocaleString()}</p>
            </div>
          );
        })}
      </div>
      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
          <span>Rs.{totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500"><span>Delivery</span><span className="text-green-600 font-medium">Free</span></div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
          <span>Total</span>
          <span className="text-green-600">Rs.{totalPrice.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentShopPage({ onNavigate }: EquipmentShopPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});

  // Checkout steps: 'shop' → 'delivery' → 'payment' → 'done'
  const [step, setStep] = useState<'shop' | 'delivery' | 'payment' | 'done'>('shop');
  const [delivery, setDelivery] = useState({ name: '', phone: '', address: '' });
  const [deliveryError, setDeliveryError] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [orderError, setOrderError] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  const categories = Object.keys(CATEGORY_META);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/equipment');
        setProducts(res.data);
      } catch (err) {
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory ? p.category === selectedCategory : true;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const currentQty = cart[id] || 0;
    if (currentQty >= product.stock) {
      alert(`Sorry, only ${product.stock} items available in stock.`);
      return;
    }
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => setCart(prev => {
    const n = { ...prev };
    if (n[id] > 1) n[id]--; else delete n[id];
    return n;
  });

  const totalItems = Object.values(cart).reduce((s, c) => s + c, 0);
  const totalPrice = Object.entries(cart).reduce((s, [id, qty]) => {
    const p = products.find(x => x.id === id);
    return s + (p ? p.price * qty : 0);
  }, 0);

  /* Validate delivery and move to payment */
  const handleDeliveryNext = () => {
    if (!delivery.name.trim() || !delivery.phone.trim() || !delivery.address.trim()) {
      setDeliveryError('Please fill in all delivery fields.');
      return;
    }
    if (!/^[0-9+\s\-]{7,15}$/.test(delivery.phone.trim())) {
      setDeliveryError('Please enter a valid phone number (digits only).');
      return;
    }
    setDeliveryError('');
    setStep('payment');
  };

  /* Place order → call backend API */
  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    setOrderError('');
    try {
      const items = Object.entries(cart).map(([id, qty]) => {
        const p = products.find(x => x.id === id)!;
        return { productId: p.id, productName: p.name, productImage: p.image, quantity: qty, unitPrice: p.price };
      });
      const res = await api.post('/orders', {
        deliveryName: delivery.name,
        deliveryPhone: delivery.phone,
        deliveryAddress: delivery.address,
        items,
      });
      setPlacedOrderId(res.data.id ?? '');
      setStep('done');
      setCart({});
      setTimeout(() => { onNavigate('dashboard'); }, 5000);
    } catch (err: any) {
      setOrderError(err?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  /* ── Order confirmed ─────────────────────────────────────────── */
  if (step === 'done') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl p-10 shadow-xl">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Placed! 🎉</h2>
          <p className="text-gray-600 mb-4">Thank you, <strong>{delivery.name}</strong>! Your order will be delivered to:</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-4 text-sm space-y-2">
            <div className="flex items-center gap-2 text-gray-700"><MapPin className="w-4 h-4 text-green-600 shrink-0" />{delivery.address}</div>
            <div className="flex items-center gap-2 text-gray-700"><Phone className="w-4 h-4 text-green-600 shrink-0" />{delivery.phone}</div>
          </div>
          {placedOrderId && (
            <p className="text-xs text-gray-400 mb-4">Order ID: <span className="font-mono text-gray-600">{placedOrderId}</span></p>
          )}
          <div className="h-1.5 bg-green-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-green-500 rounded-full animate-pulse w-full" />
          </div>
          <p className="text-sm text-gray-400">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  /* ── Step 1: Delivery Details ────────────────────────────────── */
  if (step === 'delivery') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => setStep('shop')} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Shop
        </button>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <StepBadge n={1} label="Delivery" active={true} done={false} />
          <div className="w-12 h-0.5 bg-gray-200" />
          <StepBadge n={2} label="Payment" active={false} done={false} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Delivery Details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-7 shadow-lg">
            <p className="text-gray-500 text-sm mb-6">We'll deliver your order to the address below. Please ensure the details are correct.</p>

            {deliveryError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                ⚠️ {deliveryError}
              </div>
            )}

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" value={delivery.name}
                    onChange={e => setDelivery(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Kasun Perera"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel" value={delivery.phone}
                    onChange={e => setDelivery(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+94 77 123 4567"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea
                    value={delivery.address}
                    onChange={e => setDelivery(p => ({ ...p, address: e.target.value }))}
                    placeholder="No. 14, horana Road, Kaluthara…"
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleDeliveryNext}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              Continue to Payment <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar */}
          <OrderSidebar products={products} cart={cart} totalItems={totalItems} totalPrice={totalPrice} />
        </div>
      </div>
    );
  }

  /* ── Step 2: Payment ─────────────────────────────────────────── */
  if (step === 'payment') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => setStep('delivery')} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Delivery
        </button>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <StepBadge n={1} label="Delivery" active={false} done={true} />
          <div className="w-12 h-0.5 bg-green-400" />
          <StepBadge n={2} label="Payment" active={true} done={false} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-5">
            {/* Delivery summary */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800 text-sm">Delivering to</span>
                </div>
                <button onClick={() => setStep('delivery')} className="text-green-700 text-xs underline hover:text-green-900">Change</button>
              </div>
              <p className="text-gray-900 font-medium">{delivery.name}</p>
              <p className="text-gray-600 text-sm">{delivery.phone}</p>
              <p className="text-gray-600 text-sm mt-0.5">{delivery.address}</p>
            </div>

            {/* Card details */}
            <div className="bg-white rounded-2xl p-7 shadow-lg">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Card Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cardholder Name</label>
                  <input type="text" placeholder="Name as on card"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Card Number</label>
                  <input type="text" placeholder="1234  5678  9012  3456" maxLength={19}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent tracking-widest font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                    <input type="text" placeholder="MM / YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVV</label>
                    <input type="text" placeholder="•••" maxLength={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent tracking-widest font-mono" />
                  </div>
                </div>
              </div>

              {orderError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {orderError}
                </div>
              )}
              <button onClick={handlePlaceOrder} disabled={isPlacing}
                className="mt-6 w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-colors flex items-center justify-center gap-2">
                {isPlacing
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                  : <><Check className="w-5 h-5" /> Pay Rs.{totalPrice.toLocaleString()}</>}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">🔒 Secure & encrypted payment</p>
            </div>
          </div>

          {/* Sidebar */}
          <OrderSidebar products={products} cart={cart} totalItems={totalItems} totalPrice={totalPrice} />
        </div>
      </div>
    );
  }

  /* ── Shop (category browse + product grid) ───────────────────── */
  const showingCategoryLanding = !selectedCategory && !search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { if (selectedCategory) { setSelectedCategory(null); setSearch(''); } else onNavigate('dashboard'); }}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {selectedCategory ? 'All Categories' : 'Dashboard'}
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipment Shop</h1>
            <p className="text-gray-500 text-sm mt-0.5">Professional cricket gear &amp; accessories</p>
          </div>
        </div>
        {totalItems > 0 && (
          <button onClick={() => setStep('delivery')}
            className="relative bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg">
            <ShoppingCart className="w-5 h-5" />
            Cart
            <span className="bg-white text-green-700 font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-500">Loading products...</p>
        </div>
      ) : (
        <>
          {/* ── Category Grid (landing) ───────────────────────────── */}
          {showingCategoryLanding && (
            <>
              <div className="mb-10">
                <p className="text-2xl font-semibold text-gray-800 mb-1">Browse by Category</p>
                <p className="text-gray-500">Choose a category to explore products</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {categories.map(cat => {
                  const meta = CATEGORY_META[cat] || CATEGORY_META['Accessories'];
                  const count = products.filter(p => p.category === cat).length;
                  return (
                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                      className={`group relative flex flex-col items-start p-7 rounded-2xl border-2 transition-all duration-200 text-left shadow-sm hover:shadow-xl hover:-translate-y-1 ${meta.bg}`}>
                      <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">{meta.emoji}</span>
                      <h3 className={`text-2xl font-bold mb-1 ${meta.color}`}>{cat}</h3>
                      <p className="text-gray-500 text-sm mb-3 leading-tight">{meta.desc}</p>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/70 ${meta.color}`}>
                        {count} product{count !== 1 ? 's' : ''}
                      </span>
                      <div className={`absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity ${meta.color}`}>
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="border-t pt-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold text-gray-900">All Products</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search products…"
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent w-56" />
                  </div>
                </div>
                <ProductGrid products={filteredProducts} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
              </div>
            </>
          )}

          {/* ── Category filtered view ─────────────────────────────── */}
          {!showingCategoryLanding && (
            <>
              {/* Category pill tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button onClick={() => { setSelectedCategory(null); setSearch(''); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${!selectedCategory ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'}`}>
                  All
                </button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors flex items-center gap-1 ${selectedCategory === cat ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'}`}>
                    <span>{CATEGORY_META[cat]?.emoji}</span> {cat}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={`Search in ${selectedCategory || 'all'}…`}
                  className="pl-9 pr-9 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent w-full" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category hero */}
              {selectedCategory && CATEGORY_META[selectedCategory] && (
                <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 mb-6 ${CATEGORY_META[selectedCategory].bg}`}>
                  <span className="text-5xl">{CATEGORY_META[selectedCategory].emoji}</span>
                  <div>
                    <h2 className={`text-2xl font-bold ${CATEGORY_META[selectedCategory].color}`}>{selectedCategory}</h2>
                    <p className="text-gray-500 text-sm">{CATEGORY_META[selectedCategory].desc}</p>
                    <p className="text-gray-400 text-xs mt-1">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}

              <ProductGrid products={filteredProducts} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ── Product Grid ─────────────────────────────────────────────── */
function ProductGrid({ products, cart, onAdd, onRemove }: {
  products: Product[];
  cart: Record<string, number>;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm">Try a different category or search term</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden group border border-gray-100 flex flex-col">
          <div className="relative overflow-hidden h-48">
            <img src={product.image} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => { e.currentTarget.src = FALLBACK_IMG; }} />
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm text-gray-600 text-[10px] font-semibold px-2 py-1 rounded-full">
                {CATEGORY_META[product.category]?.emoji} {product.category}
              </span>
            </div>
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-sm tracking-widest uppercase py-1 px-3 border-2 border-white rounded">Out of Stock</span>
              </div>
            )}
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">{product.name}</h3>
            <p className="text-gray-500 text-xs mb-4 line-clamp-2">{product.description}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xl font-bold text-green-600">Rs.{Number(product.price).toLocaleString()}</span>
              {product.stock > 0 ? (
                cart[product.id] ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => onRemove(product.id)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-gray-900">{cart[product.id]}</span>
                    <button onClick={() => onAdd(product.id)}
                      className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => onAdd(product.id)}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                )
              ) : (
                <span className="text-red-500 text-xs font-semibold">Sold Out</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}