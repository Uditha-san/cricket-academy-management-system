import { useState, useEffect } from 'react';
import { Calendar, ShoppingBag, Clock, MapPin, Star, MessageSquare, Send, Wrench, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    api.get('/guest-reviews')
      .then(res => setReviews(res.data))
      .catch(console.error)
      .finally(() => setIsLoadingReviews(false));
  }, []);

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
      // Add the new review to the list
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
                logout(); // Clears localStorage + user state
                window.location.replace('/register'); // Hard nav: AuthScreens sees no token → shows registration form
              }}
              className="ml-1 underline font-semibold hover:text-blue-900 transition-colors"
            >
              Register now →
            </button>
          </p>
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
        {/* Facilities Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Facilities</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">6 Premium Indoor Courts</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">Open 6 AM - 10 PM Daily</span>
            </div>
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">Professional Bowling Machines</span>
            </div>
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">Full Equipment Store</span>
            </div>
          </div>
        </div>

        {/* Special Offers */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Special Offers</h2>
          <div className="space-y-3">
            {[
              { title: 'Weekend Special', desc: '20% off on court bookings' },
              { title: 'Equipment Bundle', desc: 'Buy bat + pads, get gloves free' },
              { title: 'Group Booking', desc: 'Book 3+ courts, save 15%' },
            ].map((offer, i) => (
              <div key={i} className="bg-white/15 rounded-lg p-3">
                <h3 className="font-semibold text-sm mb-0.5">{offer.title}</h3>
                <p className="text-green-100 text-sm">{offer.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Feedback Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
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

        {/* Star Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
          <div className="flex gap-1">
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
              <span className="ml-2 text-sm text-gray-500 self-center">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][feedbackRating]}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
          <textarea
            value={feedbackComment}
            onChange={e => setFeedbackComment(e.target.value)}
            rows={3}
            placeholder="Tell us about your experience at SCC Academy... (minimum 10 characters)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">{feedbackComment.length} characters</p>
        </div>

        <button
          onClick={handleSubmitFeedback}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>

      {/* Reviews from All Guests */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">
          What Our Guests Say
          {reviews.length > 0 && <span className="ml-2 text-sm font-normal text-gray-400">({reviews.length} reviews)</span>}
        </h2>

        {isLoadingReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-28" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.slice(0, 6).map(review => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-3 italic">"{review.comment}"</p>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-xs font-medium">— {review.guestName}</p>
                  <p className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Equipment Orders */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Equipment Orders</h2>
          <button onClick={() => onNavigate('shop')} className="text-sm text-green-600 hover:underline font-medium">Shop Equipment →</button>
        </div>
        <MyOrders />
      </div>
    </div>
  );
}