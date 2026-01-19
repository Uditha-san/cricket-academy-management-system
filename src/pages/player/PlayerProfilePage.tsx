import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard as Edit2, Save, Calendar, MapPin, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface PlayerProfilePageProps {
  onNavigate: (page: string) => void;
}

export default function PlayerProfilePage({ onNavigate }: PlayerProfilePageProps) {
  const { user: authUser } = useAuth();
  const { users, updateUser, bookings } = useData();
  const [isEditing, setIsEditing] = useState(false);

  // Find the current user in the centralized data
  const currentUser = users.find(u => u.id === authUser?.id);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '1995-05-15', // Default or from DB if added to User interface
    address: 'Colombo, Sri Lanka', // Default or from DB
    emergencyContact: '+94 77 123 4567', // Default
    battingStyle: 'Right-handed',
    bowlingStyle: 'Right-arm Medium',
    preferredPosition: 'All-rounder'
  });

  // Update local state when currentUser changes (e.g. loaded)
  useEffect(() => {
    if (currentUser) {
      setProfile(prev => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        battingStyle: currentUser.battingStyle || 'Right-handed',
        bowlingStyle: currentUser.bowlingStyle || 'Right-arm Medium',
        // Preserve other fields if they aren't in User interface yet
      }));
    }
  }, [currentUser]);

  const myBookings = bookings.filter(b => b.userId === authUser?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Mock payment history for now, but could be derived from bookings + status 'Confirmed'
  const paymentHistory = myBookings.filter(b => b.status === 'Confirmed').map(b => ({
    id: `P${b.id}`,
    date: b.date,
    type: 'Court Booking',
    amount: b.amount,
    status: 'Paid'
  }));

  const handleSave = () => {
    if (currentUser) {
      updateUser({
        ...currentUser,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        battingStyle: profile.battingStyle,
        bowlingStyle: profile.bowlingStyle,
      });
      setIsEditing(false);
      alert('Profile updated successfully!');
    }
  };

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-lg text-gray-600">Manage your personal information and preferences</p>
          </div>
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            {isEditing ? (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 className="w-5 h-5 mr-2" />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-2" />
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-2" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                {isEditing ? (
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.dateOfBirth}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Colombo, Sri Lanka"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cricket Preferences */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Cricket Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batting Style</label>
              {isEditing ? (
                <select
                  value={profile.battingStyle}
                  onChange={(e) => handleChange('battingStyle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Right-handed">Right-handed</option>
                  <option value="Left-handed">Left-handed</option>
                </select>
              ) : (
                <p className="text-gray-900 font-medium">{profile.battingStyle}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bowling Style</label>
              {isEditing ? (
                <select
                  value={profile.bowlingStyle}
                  onChange={(e) => handleChange('bowlingStyle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Right-arm Medium">Right-arm Medium</option>
                  <option value="Right-arm Fast">Right-arm Fast</option>
                  <option value="Left-arm Medium">Left-arm Medium</option>
                  <option value="Left-arm Fast">Left-arm Fast</option>
                  <option value="Right-arm Spin">Right-arm Spin</option>
                  <option value="Left-arm Spin">Left-arm Spin</option>
                </select>
              ) : (
                <p className="text-gray-900 font-medium">{profile.bowlingStyle}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Position</label>
              {isEditing ? (
                <select
                  value={profile.preferredPosition}
                  onChange={(e) => handleChange('preferredPosition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicket-keeper">Wicket-keeper</option>
                </select>
              ) : (
                <p className="text-gray-900 font-medium">{profile.preferredPosition}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profile.emergencyContact}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking History */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Booking History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Court</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.courtName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{payment.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{payment.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">Rs.{payment.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}