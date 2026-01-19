import { useState } from 'react';
import { Calendar, Clock, MapPin, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface CourtBookingPageProps {
  onNavigate: (page: string) => void;
}

export default function CourtBookingPage({ onNavigate }: CourtBookingPageProps) {
  const { user } = useAuth();
  const { addBooking } = useData();
  const [selectedDate, setSelectedDate] = useState('2025-01-22');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const courts = [
    { id: 'court-1', name: 'Court 1', features: ['Premium Lighting', 'Air Conditioned'], price: 800 },
    { id: 'court-2', name: 'Court 2', features: ['Natural Lighting', 'Standard'], price: 600 },
    { id: 'court-3', name: 'Court 3', features: ['Premium Lighting', 'Air Conditioned'], price: 800 },
    { id: 'court-4', name: 'Court 4', features: ['Premium Lighting', 'Scoreboard'], price: 900 },
  ];

  const timeSlots = [
    { id: '6-7', time: '6:00 AM - 7:00 AM', available: true },
    { id: '7-8', time: '7:00 AM - 8:00 AM', available: true },
    { id: '8-9', time: '8:00 AM - 9:00 AM', available: false },
    { id: '9-10', time: '9:00 AM - 10:00 AM', available: true },
    { id: '10-11', time: '10:00 AM - 11:00 AM', available: true },
    { id: '11-12', time: '11:00 AM - 12:00 PM', available: false },
    { id: '12-13', time: '12:00 PM - 1:00 PM', available: true },
    { id: '13-14', time: '1:00 PM - 2:00 PM', available: true },
    { id: '14-15', time: '2:00 PM - 3:00 PM', available: true },
    { id: '15-16', time: '3:00 PM - 4:00 PM', available: false },
    { id: '16-17', time: '4:00 PM - 5:00 PM', available: true },
    { id: '17-18', time: '5:00 PM - 6:00 PM', available: true },
    { id: '18-19', time: '6:00 PM - 7:00 PM', available: true },
    { id: '19-20', time: '7:00 PM - 8:00 PM', available: false },
    { id: '20-21', time: '8:00 PM - 9:00 PM', available: true },
    { id: '21-22', time: '9:00 PM - 10:00 PM', available: true },
  ];

  const selectedCourtData = courts.find(court => court.id === selectedCourt);
  const selectedSlotData = timeSlots.find(slot => slot.id === selectedSlot);

  const handleBooking = () => {
    if (!user || !selectedCourtData || !selectedSlotData) return;

    const amount = Math.round(selectedCourtData.price * 1.18);

    addBooking({
      id: `B${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      courtId: selectedCourt,
      courtName: selectedCourtData.name,
      date: selectedDate,
      timeSlot: selectedSlotData.time,
      amount: amount,
      status: 'Pending',
      bookingDate: new Date().toISOString().split('T')[0]
    });

    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your court has been successfully booked. You'll receive a confirmation email shortly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Court:</strong> {selectedCourtData?.name}<br />
              <strong>Date:</strong> {selectedDate}<br />
              <strong>Time:</strong> {selectedSlotData?.time}<br />
              <strong>Price:</strong> Rs.{selectedCourtData?.price}
            </p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Court</h1>
        <p className="text-lg text-gray-600">Select your preferred court and time slot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Court Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Court</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courts.map((court) => (
                <button
                  key={court.id}
                  onClick={() => setSelectedCourt(court.id)}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${selectedCourt === court.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center mb-2">
                    <MapPin className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">{court.name}</h3>
                  </div>
                  <div className="mb-3">
                    {court.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-green-600">Rs.{court.price}/hour</p>
                </button>
              ))}
            </div>
          </div>

          {selectedCourt && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Time Slot</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.available && setSelectedSlot(slot.id)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${selectedSlot === slot.id
                        ? 'border-green-500 bg-green-500 text-white'
                        : slot.available
                          ? 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
                          : 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-lg sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>

            {selectedCourt && selectedSlot ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Court</p>
                  <p className="font-semibold text-gray-900">{selectedCourtData?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">{selectedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-semibold text-gray-900">{selectedSlotData?.time}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Court Fee</span>
                    <span className="font-semibold">Rs.{selectedCourtData?.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-semibold">Rs.{Math.round((selectedCourtData?.price || 0) * 0.18)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-green-600">Rs.{Math.round((selectedCourtData?.price || 0) * 1.18)}</span>
                  </div>
                </div>
                <button
                  onClick={handleBooking}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a court and time slot to see booking summary</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}