import { Home, Calendar, ShoppingBag, User, BarChart3 } from 'lucide-react';

interface MobileNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function MobileNavigation({ currentPage, onNavigate }: MobileNavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}