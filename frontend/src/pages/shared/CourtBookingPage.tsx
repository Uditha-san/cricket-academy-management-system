import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ArrowLeft, Check, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import api from '../../api/axios';

interface CourtBookingPageProps {
  onNavigate: (page: string) => void;
}

export default function CourtBookingPage({ onNavigate }: CourtBookingPageProps) {
  const { user } = useAuth();
  const { refreshBookings } = useData();
  const [selectedDate, setSelectedDate] = useState('2025-01-22');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookingType, setBookingType] = useState<'friends' | 'practice'>('friends');
  const [selectedCoach, setSelectedCoach] = useState('');
  const [coaches, setCoaches] = useState<any[]>([]);
  const [isLoadingCoaches, setIsLoadingCoaches] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [courts, setCourts] = useState<any[]>([]);
  const [isLoadingCourts, setIsLoadingCourts] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    api.get('/facility/courts')
      .then(res => {
        const fetchedCourts = res.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          features: c.description ? c.description.split(', ') : [],
          price: Number(c.pricePerHour)
        }));
        setCourts(fetchedCourts);
      })
      .catch(console.error)
      .finally(() => setIsLoadingCourts(false));
  }, []);

  useEffect(() => {
    if (bookingType === 'practice' && selectedDate && selectedSlots.length > 0) {
      setIsLoadingCoaches(true);
      const startTimeStr = `${selectedSlots[0].split('-')[0].padStart(2, '0')}:00`;

      api.get(`/users/coaches?date=${selectedDate}&time=${startTimeStr}`)
        .then(res => {
          setCoaches(res.data);
          if (!res.data.find((c: any) => c.id === selectedCoach)) {
            setSelectedCoach('');
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingCoaches(false));
    }
  }, [bookingType, selectedDate, selectedSlots]);



  const timeSlots = [
    { id: '6-7', time: '6:00 AM - 7:00 AM' },
    { id: '7-8', time: '7:00 AM - 8:00 AM' },
    { id: '8-9', time: '8:00 AM - 9:00 AM' },
    { id: '9-10', time: '9:00 AM - 10:00 AM' },
    { id: '10-11', time: '10:00 AM - 11:00 AM' },
    { id: '11-12', time: '11:00 AM - 12:00 PM' },
    { id: '12-13', time: '12:00 PM - 1:00 PM' },
    { id: '13-14', time: '1:00 PM - 2:00 PM' },
    { id: '14-15', time: '2:00 PM - 3:00 PM' },
    { id: '15-16', time: '3:00 PM - 4:00 PM' },
    { id: '16-17', time: '4:00 PM - 5:00 PM' },
    { id: '17-18', time: '5:00 PM - 6:00 PM' },
    { id: '18-19', time: '6:00 PM - 7:00 PM' },
    { id: '19-20', time: '7:00 PM - 8:00 PM' },
    { id: '20-21', time: '8:00 PM - 9:00 PM' },
    { id: '21-22', time: '9:00 PM - 10:00 PM' },
  ];

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      setIsLoadingSlots(true);
      api.get(`/bookings/availability?facilityId=${selectedCourt}&date=${selectedDate}`)
        .then(res => {
          const booked = res.data.bookedTimes || [];
          setBookedSlots(booked);

          // Deselect any slots that are now booked
          setSelectedSlots(prev => prev.filter(id => {
            const slotObj = timeSlots.find(s => s.id === id);
            if (!slotObj) return false;
            const startTime = slotObj.time.split(' - ')[0]; // E.g., '6:00 AM'
            return !booked.includes(startTime);
          }));
        })
        .catch(console.error)
        .finally(() => setIsLoadingSlots(false));
    } else {
      setBookedSlots([]);
    }
  }, [selectedCourt, selectedDate]);

  const selectedCourtData = courts.find(court => court.id === selectedCourt);
  const selectedSlotsData = timeSlots.filter(slot => selectedSlots.includes(slot.id));

  const handleSlotToggle = (slotId: string) => {
    setSelectedSlots(prev =>
      prev.includes(slotId)
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleBooking = async () => {
    if (!user || !selectedCourtData || selectedSlotsData.length === 0) return;
    if (bookingType === 'practice' && !selectedCoach) {
      alert("Please select a coach for your practice session.");
      return;
    }

    const coachFee = bookingType === 'practice' ? 1000 : 0;
    const amountPerSlot = Math.round((selectedCourtData.price + coachFee) * 1.18);

    try {
      // Create all bookings simultaneously via Promises
      const bookingPromises = selectedSlotsData.map((slotData) => {
        const payload = {
          facilityId: selectedCourtData.id,
          bookingDate: selectedDate,
          startTime: slotData.time.split(' - ')[0], // Sending just the start time (e.g., '6:00 AM')
          duration: 1, // Assume each slot is 1 hour based on timeSlots array format
          amount: amountPerSlot,
          coachId: bookingType === 'practice' ? selectedCoach : undefined
        };

        return api.post('/bookings', payload);
      });

      await Promise.all(bookingPromises);

      // Refresh data so the dashboard reflects the new booking(s)
      await refreshBookings();

      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        onNavigate('dashboard');
      }, 2000);

    } catch (error) {
      console.error("Booking generation failed:", error);
      alert("There was an error saving your booking. Please try again.");
    }
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
              <strong>Time:</strong> {selectedSlotsData.map(s => s.time).join(', ')}<br />
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
        {/* Court Selection Content */}
        <div className="lg:col-span-2">

          {/* Booking Type Selection added at the top! */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Who are you playing with?</h2>
            <div className="flex space-x-4 mb-6">
              <label className={`flex-1 flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${bookingType === 'friends' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" className="hidden" checked={bookingType === 'friends'} onChange={() => { setBookingType('friends'); setSelectedCoach(''); }} />
                <span className={`font-medium ${bookingType === 'friends' ? 'text-green-700' : 'text-gray-900'}`}>Play with Friends</span>
              </label>
              <label className={`flex-1 flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${bookingType === 'practice' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" className="hidden" checked={bookingType === 'practice'} onChange={() => setBookingType('practice')} />
                <span className={`font-medium ${bookingType === 'practice' ? 'text-green-700' : 'text-gray-900'}`}>Practice with a Coach</span>
              </label>
            </div>
          </div>

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
            {isLoadingCourts ? (
              <p className="text-gray-500">Loading available courts...</p>
            ) : courts.length > 0 ? (
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
                      {court.features.map((feature: string, index: number) => (
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
            ) : (
              <p className="text-red-500 text-sm">No courts found.</p>
            )}
          </div>

          {selectedCourt && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Time Slot</h2>
              {isLoadingSlots ? (
                <p className="text-gray-500">Checking availability...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => {
                    const startTime = slot.time.split(' - ')[0];
                    const isBooked = bookedSlots.includes(startTime);
                    const isAvailable = !isBooked;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => isAvailable && handleSlotToggle(slot.id)}
                        disabled={!isAvailable}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${selectedSlots.includes(slot.id)
                            ? 'border-green-500 bg-green-500 text-white'
                            : isAvailable
                              ? 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
                              : 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                          }`}
                      >
                        <Clock className={`w-4 h-4 mx-auto mb-1 ${!isAvailable ? 'text-gray-400' : ''}`} />
                        {slot.time}
                        {!isAvailable && <span className="block text-xs mt-1 text-red-500 font-bold">Booked</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {bookingType === 'practice' && (
            <div className="bg-white rounded-xl p-6 shadow-lg mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Coach</h2>
              {(selectedSlots.length === 0) ? (
                <p className="text-gray-500">Please select at least one Time Slot first to see which coaches are available.</p>
              ) : (
                <div className="mt-4">
                  {isLoadingCoaches ? (
                    <p className="text-gray-500">Loading available coaches...</p>
                  ) : coaches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {coaches.map(coach => (
                        <button
                          key={coach.id}
                          onClick={() => setSelectedCoach(coach.id)}
                          className={`flex items-center p-3 border rounded-lg transition-colors ${selectedCoach === coach.id ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'}`}
                        >
                          {coach.avatar ? (
                            <img src={coach.avatar} alt={coach.name} className="w-10 h-10 rounded-full mr-3 object-cover shadow-sm bg-white" />
                          ) : (
                            <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center font-bold ${selectedCoach === coach.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                              <UserIcon className="w-5 h-5" />
                            </div>
                          )}
                          <span className="font-medium">{coach.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-500 text-sm">No coaches available for this time slot. Please select a different time or date.</p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-lg sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>

            {selectedCourt && selectedSlots.length > 0 ? (
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
                  <p className="text-sm text-gray-600">Time ({selectedSlots.length} slots)</p>
                  <p className="font-semibold text-gray-900">{selectedSlotsData.map(s => s.time).join(', ')}</p>
                </div>
                {bookingType === 'practice' && selectedCoach && (
                  <div>
                    <p className="text-sm text-gray-600">Coach</p>
                    <p className="font-semibold text-gray-900">{coaches.find(c => c.id === selectedCoach)?.name}</p>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Court Fee ({selectedSlots.length}x)</span>
                    <span className="font-semibold">Rs.{(selectedCourtData?.price || 0) * selectedSlots.length}</span>
                  </div>
                  {bookingType === 'practice' && selectedCoach && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coach Fee ({selectedSlots.length}x)</span>
                      <span className="font-semibold">Rs.{1000 * selectedSlots.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-semibold">Rs.{Math.round((((selectedCourtData?.price || 0) * selectedSlots.length) + (bookingType === 'practice' && selectedCoach ? 1000 * selectedSlots.length : 0)) * 0.18)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-green-600">Rs.{Math.round((((selectedCourtData?.price || 0) * selectedSlots.length) + (bookingType === 'practice' && selectedCoach ? 1000 * selectedSlots.length : 0)) * 1.18)}</span>
                  </div>
                </div>
                <button
                  onClick={handleBooking}
                  disabled={bookingType === 'practice' && !selectedCoach}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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