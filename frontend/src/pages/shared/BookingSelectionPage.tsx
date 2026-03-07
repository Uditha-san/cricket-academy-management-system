import { Calendar, Wrench, ArrowLeft } from 'lucide-react';

interface BookingSelectionPageProps {
    onNavigate: (page: string) => void;
}

export default function BookingSelectionPage({ onNavigate }: BookingSelectionPageProps) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-12">
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Facility Booking</h1>
                <p className="text-lg text-gray-600">Choose what you would like to reserve for your training session.</p>
            </div>

            <div className="flex-1 flex items-start justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <button
                        onClick={() => onNavigate('court-booking')}
                        className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden text-left border border-gray-100 hover:border-green-500 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                                <Calendar className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Book a Court</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Reserve practice nets, pitches, or gym access to elevate your skillset.
                            </p>
                            <div className="mt-8 flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                                Get started
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate('machine-rental')}
                        className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden text-left border border-gray-100 hover:border-blue-500 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-inner">
                                <Wrench className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Rent a Machine</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Rent premium bowling or batting machines for specialized, consistent practice.
                            </p>
                            <div className="mt-8 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                                Get started
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
