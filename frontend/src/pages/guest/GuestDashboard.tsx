import { useState, useEffect } from 'react';
import { Calendar, ShoppingBag, Clock, MapPin, Star, MessageSquare, Send, Wrench, Lock, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import api from '../../api/axios';
import MyOrders from '../../components/MyOrders';

interface GuestDashboardProps {
  onNavigate: (page: string) => void;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  guestName: string;
  createdAt: string;
}

export default function GuestDashboard({ onNavigate }: GuestDashboardProps) {
  const { user, logout } = useAuth();
  const { bookings, refreshBookings } = useData();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    // Fetch guest reviews
    api.get('/guest-reviews')
      .then(res => setReviews(res.data))
      .catch(console.error)
      .finally(() => setIsLoadingReviews(false));

    // Fetch guest's bookings
    if (user) {
      refreshBookings().catch(console.error);
    }
  }, [user]);

  const guestBookings = bookings.filter(b => b.userId === user?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentBookings = guestBookings.slice(0, 5);

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      setSubmitError('Please select a star rating.');
      return;
    }
    if (feedbackComment.trim().length < 10) {
      setSubmitError('Comment must be at least 10 characters.');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const res = await api.post('/guest-reviews', { rating: feedbackRating, comment: feedbackComment.trim() });
      const newReview: Review = {
        id: res.data.id,
        rating: res.data.rating,
        comment: res.data.comment,
        guestName: res.data.guestName,
        createdAt: res.data.createdAt
      };
      setReviews(prev => [newReview, ...prev]);
      setFeedbackRating(0);
      setFeedbackComment('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickActions = [
    {
      id: 'booking',
      title: 'Book a Court',
      description: 'Reserve courts for play & practice',
      icon: Calendar,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      action: () => onNavigate('booking')
    },
    {
      id: 'machine',
      title: 'Rent a Machine',
      description: 'Academy members only',
      icon: Lock,
      color: 'bg-gradient-to-br from-gray-400 to-gray-500',
      locked: true,
      action: () => { }
    },
    {
      id: 'shop',
      title: 'Shop Equipment',
      description: 'Cricket gear & accessories',
      icon: ShoppingBag,
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      action: () => onNavigate('shop')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}! 👋</h1>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase tracking-wide">Guest</span>
        </div>
        <p className="text-lg text-gray-600">Book courts, shop equipment, and enjoy premium cricket facilities</p>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <span className="text-blue-500 text-lg">💡</span>
          <p className="text-sm text-blue-700">
            You're using a guest account. <strong>Machine rentals</strong> and <strong>coach sessions</strong> are available to registered academy members.
            <button
              onClick={() => {
                logout();
                window.location.replace('/register');
              }}
              className="ml-1 underline font-semibold hover:text-blue-900 transition-colors"
            >
              Register now →
            </button>
          </p>
        </div>
      </div>

      {/* Stats Overview for Guests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-center md:text-left">
        <div
          onClick={() => setShowBookingsModal(true)}
          className="bg-white rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all border border-gray-100 group"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{guestBookings.length}</p>
              <p className="text-sm text-gray-500">Total Bookings</p>
            </div>
          </div>
        </div>
        {/* Placeholder stats to maintain balance */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 opacity-60">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-gray-300 mr-3" />
            <div>
              <p className="text-xl font-bold text-gray-400">—</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Member Perks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              disabled={action.locked}
              className={`relative bg-white rounded-2xl p-6 shadow-lg text-left transition-all duration-200 border border-gray-100 ${action.locked
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-xl hover:-translate-y-1 hover:border-green-300'
                }`}
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-gray-500 text-sm">{action.description}</p>
              {action.locked && (
                <div className="absolute top-3 right-3 bg-gray-100 rounded-full p-1">
                  <Lock className="w-3 h-3 text-gray-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* My Court Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">My Court Bookings</h2>
            </div>
            {guestBookings.length > 5 && (
              <button
                onClick={() => setShowBookingsModal(true)}
                className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                View All →
              </button>
            )}
          </div>

          {recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="flex items-center p-4 bg-gray-50 rounded-xl border border-transparent hover:border-green-200 hover:bg-green-50/30 transition-all cursor-pointer group"
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm mr-4 text-center min-w-[60px]">
                    <p className="text-[10px] uppercase text-gray-400 font-bold">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-xl font-black text-gray-800 leading-none">{new Date(booking.date).getDate()}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 group-hover:text-green-800 transition-colors">{booking.courtName}</p>
                    <p className="text-sm text-gray-500">{booking.timeSlot}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {booking.status}
                    </span>
                    <p className="text-xs font-semibold text-gray-900 mt-1">Rs.{booking.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
              <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium italic">No court bookings yet</p>
              <button
                onClick={() => onNavigate('booking')}
                className="mt-3 inline-flex items-center text-sm font-bold text-green-600 hover:text-green-700"
              >
                Book your first session →
              </button>
            </div>
          )}
        </div>

        {/* Facilities & Services */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Academy Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">Indoor Courts</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Premium Quality</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">Open Daily</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">6 AM - 10 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">Pro Shop</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Official Gear</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
              <Star className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-indigo-900">Top Rated</p>
                <p className="text-[10px] text-indigo-500 uppercase tracking-widest font-bold">4.8 Overall Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Equipment Orders */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Equipment Orders</h2>
          <button onClick={() => onNavigate('shop')} className="text-sm text-green-600 hover:underline font-medium">Shop Equipment →</button>
        </div>
        <MyOrders />
      </div>

      {/* Share Your Feedback */}
      <div className="bg-white rounded-2xl p-6 shadow-lg my-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Share Your Experience</h2>
            <p className="text-sm text-gray-500">Your feedback helps us improve. It'll appear in the reviews section below.</p>
          </div>
        </div>

        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
            ✅ <span>Thank you! Your review has been posted successfully.</span>
          </div>
        )}
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        {/* Rating & Comment Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${star <= (hoveredStar || feedbackRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                      }`}
                  />
                </button>
              ))}
              {feedbackRating > 0 && (
                <span className="ml-2 text-sm text-gray-500 self-center font-medium">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][feedbackRating]}
                </span>
              )}
            </div>

            <button
              onClick={handleSubmitFeedback}
              disabled={isSubmitting}
              className="hidden md:flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
            <textarea
              value={feedbackComment}
              onChange={e => setFeedbackComment(e.target.value)}
              rows={3}
              placeholder="Tell us about your experience..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm transition-all"
            />
            <button
              onClick={handleSubmitFeedback}
              disabled={isSubmitting}
              className="flex md:hidden w-full items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold mt-4"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Guest Community Reviews</h2>
        {isLoadingReviews ? (
          <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.slice(0, 3).map(review => (
              <div key={review.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                <div className="flex text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                </div>
                <p className="text-sm text-gray-700 mb-2">"{review.comment}"</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">— {review.guestName}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl scale-in-center">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Booking Details</h2>
              <p className="text-sm text-gray-500">Scheduled session Information</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500 font-medium">Facility</span>
                <span className="text-sm font-bold text-gray-900">{selectedBooking.courtName}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500 font-medium">Session Date</span>
                <span className="text-sm font-bold text-gray-900">{new Date(selectedBooking.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500 font-medium">Time Slot</span>
                <span className="text-sm font-bold text-gray-900">{selectedBooking.timeSlot}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500 font-medium">Paid Amount</span>
                <span className="text-sm font-bold text-indigo-600">Rs.{selectedBooking.amount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500 font-medium">Status</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${selectedBooking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* All Bookings Modal */}
      {showBookingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full relative shadow-2xl max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowBookingsModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full font-bold"
            >
              ✕
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900">Your Booking History</h2>
              <p className="text-sm text-gray-500">All sessions you've booked at SCC Academy</p>
            </div>
            
            <div className="overflow-y-auto space-y-3 flex-1 pr-2 custom-scrollbar">
              {guestBookings.length > 0 ? (
                guestBookings.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => {
                      setShowBookingsModal(false);
                      setSelectedBooking(booking);
                    }}
                    className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-green-200 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 p-2 rounded-xl text-center min-w-[50px]">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                        <p className="text-lg font-black text-gray-700">{new Date(booking.date).getDate()}</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 transition-colors group-hover:text-green-700">{booking.courtName}</p>
                        <p className="text-xs text-gray-500">{booking.timeSlot}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${booking.status === 'Confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {booking.status}
                      </p>
                      <p className="text-xs font-bold text-gray-800">Rs.{booking.amount}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                  <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">Your history is currently empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}