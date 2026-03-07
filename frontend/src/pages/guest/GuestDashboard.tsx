import { Calendar, Wrench, ShoppingBag, Clock, MapPin, Star } from 'lucide-react';

interface GuestDashboardProps {
  onNavigate: (page: string) => void;
}

export default function GuestDashboard({ onNavigate }: GuestDashboardProps) {
  const quickActions = [
    {
      id: 'booking',
      title: 'Facilities Booking',
      description: 'Reserve courts & machines',
      icon: Calendar,
      color: 'bg-green-500',
      action: () => onNavigate('booking')
    },
    {
      id: 'shop',
      title: 'Shop Equipment',
      description: 'Cricket gear & accessories',
      icon: ShoppingBag,
      color: 'bg-orange-500',
      action: () => onNavigate('shop')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Cricket Stadium</h1>
        <p className="text-lg text-gray-600">Book courts, rent equipment, and enjoy premium cricket facilities</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600">{action.description}</p>
            </button>
          );
        })}
      </div>

      {/* Facilities Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Facilities</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-gray-700">6 Premium Indoor Courts</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-gray-700">Open 6 AM - 10 PM Daily</span>
            </div>
            <div className="flex items-center">
              <Wrench className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-gray-700">Professional Bowling Machines</span>
            </div>
            <div className="flex items-center">
              <ShoppingBag className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-gray-700">Full Equipment Store</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-semibold mb-4">Special Offers</h2>
          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Weekend Special</h3>
              <p className="text-green-100">20% off on court bookings</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Equipment Bundle</h3>
              <p className="text-green-100">Buy bat + pads, get gloves free</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Group Booking</h3>
              <p className="text-green-100">Book 3+ courts, save 15%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">What Our Guests Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Rajith Perera', rating: 5, comment: 'Excellent facilities and well-maintained courts!' },
            { name: 'Priya Wickramasinghe', rating: 5, comment: 'Great equipment store with competitive prices.' },
            { name: 'Mihiri Jaywardena', rating: 4, comment: 'Professional setup, highly recommended.' }
          ].map((review, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-2">"{review.comment}"</p>
              <p className="text-gray-500 text-xs">- {review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}