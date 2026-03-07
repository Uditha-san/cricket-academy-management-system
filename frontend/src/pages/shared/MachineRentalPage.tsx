import { useState, useEffect } from 'react';
import { Wrench, Clock, ArrowLeft, Check, Users, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

interface MachineRentalPageProps {
  onNavigate: (page: string) => void;
}

const TIME_SLOTS = [
  { id: '6-7', time: '6:00 AM - 7:00 AM', startTime: '06:00' },
  { id: '7-8', time: '7:00 AM - 8:00 AM', startTime: '07:00' },
  { id: '8-9', time: '8:00 AM - 9:00 AM', startTime: '08:00' },
  { id: '9-10', time: '9:00 AM - 10:00 AM', startTime: '09:00' },
  { id: '10-11', time: '10:00 AM - 11:00 AM', startTime: '10:00' },
  { id: '11-12', time: '11:00 AM - 12:00 PM', startTime: '11:00' },
  { id: '12-13', time: '12:00 PM - 1:00 PM', startTime: '12:00' },
  { id: '13-14', time: '1:00 PM - 2:00 PM', startTime: '13:00' },
  { id: '14-15', time: '2:00 PM - 3:00 PM', startTime: '14:00' },
  { id: '15-16', time: '3:00 PM - 4:00 PM', startTime: '15:00' },
  { id: '16-17', time: '4:00 PM - 5:00 PM', startTime: '16:00' },
  { id: '17-18', time: '5:00 PM - 6:00 PM', startTime: '17:00' },
  { id: '18-19', time: '6:00 PM - 7:00 PM', startTime: '18:00' },
  { id: '19-20', time: '7:00 PM - 8:00 PM', startTime: '19:00' },
  { id: '20-21', time: '8:00 PM - 9:00 PM', startTime: '20:00' },
  { id: '21-22', time: '9:00 PM - 10:00 PM', startTime: '21:00' },
];

export default function MachineRentalPage({ onNavigate }: MachineRentalPageProps) {
  const { user } = useAuth();

  const [machines, setMachines] = useState<any[]>([]);
  const [isLoadingMachines, setIsLoadingMachines] = useState(true);

  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [rentalType, setRentalType] = useState<'friends' | 'coach'>('friends');
  const [coaches, setCoaches] = useState<any[]>([]);
  const [selectedCoach, setSelectedCoach] = useState('');
  const [isLoadingCoaches, setIsLoadingCoaches] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch machines from DB
  useEffect(() => {
    api.get('/facility/machines')
      .then(res => {
        setMachines(res.data.map((m: any) => ({
          id: m.id,
          name: m.name,
          description: m.description || '',
          features: m.description ? m.description.split(', ') : [],
          price: Number(m.pricePerHour),
          imageUrl: m.imageUrl || null
        })));
      })
      .catch(console.error)
      .finally(() => setIsLoadingMachines(false));
  }, []);

  // Fetch availability when machine/date changes
  useEffect(() => {
    if (selectedMachine && selectedDate) {
      setIsLoadingSlots(true);
      setSelectedSlots([]);
      api.get(`/rentals/availability?facilityId=${selectedMachine}&date=${selectedDate}`)
        .then(res => setBookedSlots(res.data.bookedTimes || []))
        .catch(console.error)
        .finally(() => setIsLoadingSlots(false));
    } else {
      setBookedSlots([]);
    }
  }, [selectedMachine, selectedDate]);

  // Fetch available coaches when type is coach and slots selected
  useEffect(() => {
    if (rentalType === 'coach' && selectedDate && selectedSlots.length > 0) {
      setIsLoadingCoaches(true);
      const firstSlot = TIME_SLOTS.find(s => s.id === selectedSlots[0]);
      const startTimeStr = firstSlot?.startTime || '09:00';
      api.get(`/users/coaches?date=${selectedDate}&time=${startTimeStr}`)
        .then(res => {
          setCoaches(res.data);
          if (!res.data.find((c: any) => c.id === selectedCoach)) setSelectedCoach('');
        })
        .catch(console.error)
        .finally(() => setIsLoadingCoaches(false));
    } else {
      setCoaches([]);
      setSelectedCoach('');
    }
  }, [rentalType, selectedDate, selectedSlots]);

  const selectedMachineData = machines.find(m => m.id === selectedMachine);
  const selectedSlotsData = TIME_SLOTS.filter(s => selectedSlots.includes(s.id));
  const coachFee = rentalType === 'coach' ? 1000 : 0;
  const pricePerSlot = selectedMachineData ? Math.round((selectedMachineData.price + coachFee) * 1.18) : 0;
  const total = pricePerSlot * selectedSlotsData.length;

  const handleSlotToggle = (id: string) => {
    setSelectedSlots(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleRental = async () => {
    if (!user || !selectedMachineData || selectedSlotsData.length === 0 || !selectedDate) return;
    if (rentalType === 'coach' && !selectedCoach) {
      alert('Please select a coach for your session.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Post one rental per selected slot (mirroring court booking)
      const promises = selectedSlotsData.map(slot =>
        api.post('/rentals', {
          facilityId: selectedMachineData.id,
          rentalDate: selectedDate,
          startTime: slot.startTime,
          duration: 1,
          amount: pricePerSlot,
          coachId: rentalType === 'coach' ? selectedCoach : undefined
        })
      );
      await Promise.all(promises);
      setShowConfirmation(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit rental. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-10 shadow-lg">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Rental Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your rental is <strong>pending approval</strong>. You'll receive an email once confirmed by our team.
          </p>
          <div className="bg-gray-50 rounded-lg p-5 text-left space-y-2 mb-6">
            <p className="text-sm text-gray-600"><strong>Machine:</strong> {selectedMachineData?.name}</p>
            <p className="text-sm text-gray-600"><strong>Date:</strong> {selectedDate}</p>
            <p className="text-sm text-gray-600"><strong>Time Slots:</strong> {selectedSlotsData.map(s => s.time).join(', ')}</p>
            <p className="text-sm text-gray-600"><strong>Type:</strong> {rentalType === 'coach' ? 'Practice with Coach' : 'Practice with Friends'}</p>
            <p className="text-sm text-gray-600"><strong>Total:</strong> Rs.{total}</p>
          </div>
          <button onClick={() => onNavigate('dashboard')} className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rent a Machine</h1>
        <p className="text-lg text-gray-600">Choose from our professional training equipment and select your time slots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Machine Selection */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Machine</h2>
            {isLoadingMachines ? (
              <p className="text-gray-500">Loading machines...</p>
            ) : machines.length === 0 ? (
              <p className="text-red-500 text-sm">No machines available. Please ask an admin to add machines.</p>
            ) : (
              <div className="space-y-4">
                {machines.map(machine => (
                  <button
                    key={machine.id}
                    onClick={() => setSelectedMachine(machine.id)}
                    className={`w-full p-5 rounded-xl border-2 transition-colors text-left ${selectedMachine === machine.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {machine.imageUrl ? (
                        <img src={machine.imageUrl} alt={machine.name} className="w-full md:w-32 h-28 object-cover rounded-lg" />
                      ) : (
                        <div className="w-full md:w-32 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Wrench className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{machine.name}</h3>
                          <span className="text-green-600 font-bold ml-2 shrink-0">Rs.{machine.price}/hr</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{machine.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {machine.features.slice(0, 4).map((f: string, i: number) => (
                            <span key={i} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Practice Type */}
          {selectedMachine && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Type</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setRentalType('friends')}
                  className={`p-4 rounded-xl border-2 text-center transition-colors ${rentalType === 'friends' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}
                >
                  <Users className="w-7 h-7 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold text-gray-900">With Friends</p>
                  <p className="text-xs text-gray-500 mt-1">Casual practice, no coach</p>
                </button>
                <button
                  onClick={() => setRentalType('coach')}
                  className={`p-4 rounded-xl border-2 text-center transition-colors ${rentalType === 'coach' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}
                >
                  <UserIcon className="w-7 h-7 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold text-gray-900">With Coach</p>
                  <p className="text-xs text-gray-500 mt-1">+Rs.1000 coaching fee</p>
                </button>
              </div>
            </div>
          )}

          {/* Date + Time Slots */}
          {selectedMachine && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date & Time Slots</h2>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {selectedDate && (
                <>
                  <p className="text-sm text-gray-500 mb-3">Select one or more time slots (each = 1 hour):</p>
                  {isLoadingSlots ? (
                    <p className="text-gray-500 text-sm">Checking availability...</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {TIME_SLOTS.map(slot => {
                        const isBooked = bookedSlots.includes(slot.startTime);
                        const isSelected = selectedSlots.includes(slot.id);
                        return (
                          <button
                            key={slot.id}
                            onClick={() => !isBooked && handleSlotToggle(slot.id)}
                            disabled={isBooked}
                            className={`p-3 rounded-lg border text-xs font-medium transition-colors ${isSelected
                                ? 'border-green-500 bg-green-500 text-white'
                                : isBooked
                                  ? 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                  : 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
                              }`}
                          >
                            <Clock className={`w-3 h-3 mx-auto mb-1 ${isBooked ? 'text-gray-400' : ''}`} />
                            {slot.time}
                            {isBooked && <span className="block mt-1 text-red-500 font-bold">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Coach Selection */}
          {rentalType === 'coach' && selectedSlots.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Coach</h2>
              {isLoadingCoaches ? (
                <p className="text-gray-500 text-sm">Loading available coaches...</p>
              ) : coaches.length === 0 ? (
                <p className="text-red-500 text-sm">No coaches available for this time. Try different slots.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coaches.map(coach => (
                    <button
                      key={coach.id}
                      onClick={() => setSelectedCoach(coach.id)}
                      className={`p-4 border-2 rounded-xl text-left transition-colors ${selectedCoach === coach.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg mb-2">
                        {coach.name.charAt(0)}
                      </div>
                      <p className="font-semibold text-gray-900">{coach.name}</p>
                      <p className="text-xs text-gray-500">{coach.specialization || 'Cricket Coach'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rental Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-lg sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rental Summary</h2>
            {selectedMachine && selectedSlotsData.length > 0 && selectedDate ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Machine</p>
                  <p className="font-semibold text-gray-900">{selectedMachineData?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">{selectedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Selected Slots ({selectedSlotsData.length}h)</p>
                  <div className="flex flex-col gap-1 mt-1">
                    {selectedSlotsData.map(s => (
                      <span key={s.id} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{s.time}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold text-gray-900">{rentalType === 'coach' ? 'With Coach' : 'With Friends'}</p>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Machine Fee</span>
                    <span>Rs.{(selectedMachineData?.price || 0) * selectedSlotsData.length}</span>
                  </div>
                  {rentalType === 'coach' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coaching Fee</span>
                      <span>Rs.{1000 * selectedSlotsData.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span>Rs.{Math.round(((selectedMachineData?.price || 0) + (rentalType === 'coach' ? 1000 : 0)) * selectedSlotsData.length * 0.18)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2">
                    <span>Total</span>
                    <span className="text-green-600">Rs.{total}</span>
                  </div>
                </div>

                <button
                  onClick={handleRental}
                  disabled={isSubmitting || (rentalType === 'coach' && !selectedCoach)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Rental'}
                </button>
                {rentalType === 'coach' && !selectedCoach && (
                  <p className="text-xs text-red-500 text-center">Please select a coach above</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">Select a machine, date and at least one time slot to see summary</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}