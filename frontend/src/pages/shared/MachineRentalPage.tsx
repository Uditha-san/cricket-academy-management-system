import { useState } from 'react';
import { Wrench, Clock, ArrowLeft, Check, Play } from 'lucide-react';

interface MachineRentalPageProps {
  onNavigate: (page: string) => void;
}

export default function MachineRentalPage({ onNavigate }: MachineRentalPageProps) {
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const machines = [
    {
      id: 'bowling-pro',
      name: 'Professional Bowling Machine',
  image: '/assets/bowling machine.jpg',
      description: 'High-speed bowling machine with variable speed and swing control',
      features: ['Speed: 80-150 km/h', 'Swing Control', 'Length Adjustment', 'Auto Ball Feeder'],
      price: 1500
    },
    {
      id: 'batting-trainer',
      name: 'Batting Training Machine',
  image: '/assets/battingmachines.webp',
      description: 'Perfect for batting practice with consistent line and length',
      features: ['Consistent Delivery', 'Adjustable Height', 'Easy Setup', 'Ball Return'],
      price: 2500
    },
    {
      id: 'spin-master',
      name: 'Spin Bowling Simulator',
  image: '/assets/spin.jpg',
      description: 'Advanced spin bowling machine for specialized training',
      features: ['Multiple Spin Types', 'Variable Turn', 'Programmable', 'Remote Control'],
      price: 2500
    }
  ];

  const durations = [
    { id: '30min', label: '30 minutes', multiplier: 0.5 },
    { id: '1hour', label: '1 hour', multiplier: 1 },
    { id: '2hours', label: '2 hours', multiplier: 2 },
    { id: '3hours', label: '3 hours', multiplier: 3 },
  ];

  const handleRental = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      onNavigate('dashboard');
    }, 2000);
  };

  const selectedMachineData = machines.find(machine => machine.id === selectedMachine);
  const selectedDurationData = durations.find(duration => duration.id === selectedDuration);
  const totalPrice = selectedMachineData && selectedDurationData 
    ? selectedMachineData.price * selectedDurationData.multiplier 
    : 0;

  if (showConfirmation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rental Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your machine rental has been confirmed. Head to the designated area to start your session.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Machine:</strong> {selectedMachineData?.name}<br/>
              <strong>Duration:</strong> {selectedDurationData?.label}<br/>
              <strong>Total Price:</strong> Rs.{totalPrice}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rent a Machine</h1>
        <p className="text-lg text-gray-600">Choose from our professional training equipment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Machine Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Machines</h2>
            <div className="space-y-6">
              {machines.map((machine) => (
                <button
                  key={machine.id}
                  onClick={() => setSelectedMachine(machine.id)}
                  className={`w-full p-6 rounded-xl border-2 transition-colors text-left ${
                    selectedMachine === machine.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row">
                    <img
                      src={machine.image}
                      alt={machine.name}
                      className="w-full md:w-32 h-32 object-cover rounded-lg mb-4 md:mb-0 md:mr-6"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{machine.name}</h3>
                        <div className="flex items-center text-green-600">
                          <Play className="w-4 h-4 mr-1" />
                          <span className="text-lg font-bold">Rs.{machine.price}/hour</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{machine.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {machine.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedMachine && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Duration</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {durations.map((duration) => (
                  <button
                    key={duration.id}
                    onClick={() => setSelectedDuration(duration.id)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedDuration === duration.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Clock className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="font-semibold text-gray-900">{duration.label}</p>
                    <p className="text-sm text-gray-600">
                      Rs.{selectedMachineData ? selectedMachineData.price * duration.multiplier : 0}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rental Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-lg sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rental Summary</h2>
            
            {selectedMachine && selectedDuration ? (
              <div className="space-y-4">
                <div>
                  <img
                    src={selectedMachineData?.image}
                    alt={selectedMachineData?.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <p className="text-sm text-gray-600">Machine</p>
                  <p className="font-semibold text-gray-900">{selectedMachineData?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">{selectedDurationData?.label}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Fee</span>
                    <span className="font-semibold">Rs.{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-semibold">Rs.{Math.round(totalPrice * 0.18)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-green-600">Rs.{Math.round(totalPrice * 1.18)}</span>
                  </div>
                </div>
                <button
                  onClick={handleRental}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Confirm Rental
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a machine and duration to see rental summary</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}