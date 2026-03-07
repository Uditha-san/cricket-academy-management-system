import { LogOut, Bell, User as UserIcon } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'player' | 'coach' | 'admin';
  avatar?: string;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ user, onLogout, currentPage, onNavigate }: HeaderProps) {
  const getNavItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'bookings', label: 'Bookings' },
          { id: 'equipment', label: 'Equipment' },
          { id: 'players', label: 'Players' },
          { id: 'reports', label: 'Reports' }
        ];
      case 'coach':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'attendance', label: 'Attendance' }
        ];
      case 'player':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'booking', label: 'Bookings' },
          { id: 'shop', label: 'Shop' },
          { id: 'stats', label: 'Stats' },
          { id: 'profile', label: 'Profile' }
        ];
      case 'guest':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'booking', label: 'Bookings' },
          { id: 'shop', label: 'Shop' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const showMobileNav = user.role === 'player';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-green-500/50 to-emerald-300/50 blur-md" aria-hidden="true"></div>
              <img
                src="/assets/logo.jpg"
                alt="App logo"
                className="relative h-10 w-10 rounded-full object-cover ring-2 ring-green-600 shadow-md bg-white p-0.5"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">CrickPro 360</h1>
              <p className="text-xs text-gray-500 capitalize">{user.role} Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {!showMobileNav && (
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === item.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user.role !== 'guest' && (
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-gray-600" />
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}