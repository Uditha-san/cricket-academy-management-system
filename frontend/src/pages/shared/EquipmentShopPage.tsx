import { useState } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingCart, Check } from 'lucide-react';

interface EquipmentShopPageProps {
  onNavigate: (page: string) => void;
}

export default function EquipmentShopPage({ onNavigate }: EquipmentShopPageProps) {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const products = [
    {
      id: "bat-ton-premium",
      name: "TON Premium Cricket Bat",
      // Place the attached image file at public/assets/bat-ton-premium.jpg (or update the path below)
      image: "/assets/bat.webp",
      price: 45000,
      category: "Bats",
      description: "Handcrafted TON premium English willow bat with a large sweet spot — designed for power and balance. Ideal for club and professional players.",
    },
    {
      id: "bat-ss-ton-reserve",
      name: "SS Ton Reserve Edition",
      image: "/assets/bat.webp",
      price: 55000,
      category: "Bats",
      description: "Super Premium Grade 1 English Willow cricket bat",
    },
    {
      id: "bat-kookaburra-kahuna",
      name: "Kookaburra Kahuna",
      image: "/assets/bat.webp",
      price: 48000,
      category: "Bats",
      description: "Iconic bat with a mid-blade sweet spot",
    },
    {
      id: "bat-gm-diamond",
      name: "GM Diamond 808",
      image: "/assets/bat.webp",
      price: 42000,
      category: "Bats",
      description: "Traditional blade design for dynamic stroke play",
    },
    {
      id: "pads-professional",
      name: "Professional Batting Pads",
      // using local image placed in public/assets
      image: "/assets/pads.jpg",
      price: 10000,
      category: "Protective Gear",
      description: "Lightweight and comfortable batting pads",
    },
    {
      id: "pads-thigh-set",
      name: "Thigh Pad Set",
      image: "/assets/pads.jpg",
      price: 3500,
      category: "Protective Gear",
      description: "Comprehensive lower body protection",
    },
    {
      id: "guard-chest",
      name: "Chest Guard",
      image: "/assets/pads.jpg",
      price: 2500,
      category: "Protective Gear",
      description: "Ergonomic chest guard for impact protection",
    },
    {
      id: "guard-arm",
      name: "Arm Guard",
      image: "/assets/pads.jpg",
      price: 1800,
      category: "Protective Gear",
      description: "Lightweight arm guard",
    },
    {
      id: "gloves-keeper",
      name: "Wicket Keeping Gloves",
      image:
        "/assets/gloves.webp",
      price: 8000,
      category: "Gloves",
      description: "High-quality wicket keeping gloves",
    },
    {
      id: "gloves-batting-pro",
      name: "Pro Batting Gloves",
      image:
        "/assets/gloves.webp",
      price: 4500,
      category: "Gloves",
      description: "Pro level protection with excellent flexibility",
    },
    {
      id: "gloves-inner",
      name: "Inner Gloves",
      image:
        "/assets/gloves.webp",
      price: 800,
      category: "Gloves",
      description: "Cotton inner gloves for sweat absorption",
    },
    {
      id: "helmet-pro",
      name: "Professional Cricket Helmet",
      image:
        "/assets/helmet.jpg",
      price: 7000,
      category: "Protective Gear",
      description: "Safety certified cricket helmet",
    },
    {
      id: "ball-leather",
      name: "Leather Cricket Ball (Pack of 6)",
      image:
        "/assets/ball.webp",
      price: 4800,
      category: "Balls",
      description: "Premium leather cricket balls",
    },
    {
      id: "ball-white",
      name: "White Cricket Ball (Pack of 6)",
      image:
        "/assets/ball.webp",
      price: 5400,
      category: "Balls",
      description: "Regulation white balls for day/night cricket",
    },
    {
      id: "ball-synthetic",
      name: "Training Ball (Synthetic)",
      image:
        "/assets/ball.webp",
      price: 400,
      category: "Balls",
      description: "Durable synthetic ball for practice",
    },
    {
      id: "shoes-spikes",
      name: "Cricket Spike Shoes",
      image:
        "/assets/shoes.jpg",
      price: 6000,
      category: "Footwear",
      description: "Professional cricket spike shoes",
    },
    {
      id: "shoes-rubber",
      name: "Rubber Sole Cricket Shoes",
      image:
        "/assets/shoes.jpg",
      price: 4500,
      category: "Footwear",
      description: "Multi-surface rubber sole shoes",
    },
  ];

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, count) => total + count, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [productId, count]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * count : 0);
    }, 0);
  };

  const handleCheckout = () => {
    setShowCheckout(false);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setCart({});
      onNavigate('dashboard');
    }, 2000);
  };

  if (showConfirmation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase! Your order will be processed and ready for pickup soon.
          </p>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => setShowCheckout(false)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Shop
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              {Object.entries(cart).map(([productId, count]) => {
                const product = products.find(p => p.id === productId);
                if (!product) return null;

                return (
                  <div key={productId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg mr-4"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, Helvetica, sans-serif" font-size="12">Image N/A</text></svg>';
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {count}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">Rs.{product.price * count}</p>
                  </div>
                );
              })}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total: Rs.{getTotalPrice()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Complete Payment - Rs.{getTotalPrice()}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipment Shop</h1>
            <p className="text-lg text-gray-600">Professional cricket equipment and accessories</p>
          </div>
          {getTotalItems() > 0 && (
            <button
              onClick={() => setShowCheckout(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart ({getTotalItems()})
            </button>
          )}
        </div>
      </div>

      <div className="space-y-12">
        {Object.entries(products.reduce((acc, product) => {
          if (!acc[product.category]) {
            acc[product.category] = [];
          }
          acc[product.category].push(product);
          return acc;
        }, {} as Record<string, typeof products>)).map(([category, categoryProducts]) => (
          <div key={category}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, Helvetica, sans-serif" font-size="20">Image not available</text></svg>';
                    }}
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">Rs.{product.price}</span>
                      <div className="flex items-center space-x-2">
                        {cart[product.id] ? (
                          <>
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{cart[product.id]}</span>
                            <button
                              onClick={() => addToCart(product.id)}
                              className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => addToCart(product.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}