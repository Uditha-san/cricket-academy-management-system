import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, BarChart3, ShoppingBag, Target, Award, Clock, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    const features = [
        {
            icon: Calendar,
            title: 'Court Booking',
            description: 'Reserve cricket courts with ease and manage your practice sessions efficiently.',
            color: 'from-green-400 to-emerald-500'
        },
        {
            icon: BarChart3,
            title: 'Player Statistics',
            description: 'Track your progress with detailed performance analytics and insights.',
            color: 'from-blue-400 to-cyan-500'
        },
        {
            icon: Users,
            title: 'Expert Coaching',
            description: 'Learn from professional coaches with personalized training programs.',
            color: 'from-purple-400 to-pink-500'
        },
        {
            icon: ShoppingBag,
            title: 'Equipment Rental',
            description: 'Access top-quality cricket equipment and gear for your training.',
            color: 'from-orange-400 to-red-500'
        }
    ];

    const benefits = [
        { icon: Trophy, text: 'State-of-the-art facilities' },
        { icon: Target, text: 'Personalized training programs' },
        { icon: Award, text: 'Professional coaching staff' },
        { icon: Clock, text: 'Flexible scheduling options' }
    ];

    // Animation styles
    const animationStyles = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-20px);
            }
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }

        @keyframes shimmer {
            0% {
                background-position: -1000px 0;
            }
            100% {
                background-position: 1000px 0;
            }
        }

        .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
        }

        .animate-slide-in-left {
            animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-slide-in-right {
            animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-float {
            animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
            animation: pulse 2s ease-in-out infinite;
        }

        .delay-100 {
            animation-delay: 0.1s;
        }

        .delay-200 {
            animation-delay: 0.2s;
        }

        .delay-300 {
            animation-delay: 0.3s;
        }

        .delay-400 {
            animation-delay: 0.4s;
        }

        .delay-500 {
            animation-delay: 0.5s;
        }

        .delay-600 {
            animation-delay: 0.6s;
        }

        .initial-hidden {
            opacity: 0;
        }

        .shimmer-effect {
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
        }
    `;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
            {/* Inject Animation Styles */}
            <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm animate-fade-in">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <img
                                src="/assets/logo.jpg"
                                alt="SCC Academy"
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-green-600 animate-pulse-slow"
                            />
                            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                SCC Academy
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 text-green-700 font-medium hover:text-green-800 transition-all hover:scale-105"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-110"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Hero Content */}
                        <div className="space-y-8">
                            <div className="inline-block initial-hidden animate-fade-in-up">
                                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                    🏏 Welcome to Excellence
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight initial-hidden animate-fade-in-up delay-100">
                                Master Your Game at{' '}
                                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    SCC Academy
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed initial-hidden animate-fade-in-up delay-200">
                                Transform your cricket skills with professional coaching, world-class facilities,
                                and cutting-edge performance tracking. Join Sri Lanka's premier cricket academy.
                            </p>
                            <div className="flex flex-wrap gap-4 initial-hidden animate-fade-in-up delay-300">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-110 flex items-center space-x-2"
                                >
                                    <span>Start Your Journey</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-8 py-4 bg-white text-green-700 border-2 border-green-600 rounded-xl font-semibold hover:bg-green-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Sign In
                                </button>
                            </div>
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-8 initial-hidden animate-fade-in-up delay-400">
                                <div className="transform hover:scale-110 transition-transform">
                                    <div className="text-3xl font-bold text-green-600">500+</div>
                                    <div className="text-sm text-gray-600">Active Players</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-green-600">50+</div>
                                    <div className="text-sm text-gray-600">Expert Coaches</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-green-600">10+</div>
                                    <div className="text-sm text-gray-600">Years Experience</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="relative initial-hidden animate-slide-in-right delay-200">
                            <div className="absolute -inset-4 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-3xl blur-2xl animate-pulse-slow"></div>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200 animate-float">
                                <img
                                    src="/assets/cricket-hero.png"
                                    alt="Cricket Academy"
                                    className="w-full h-auto object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = '/assets/logo.jpg';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 initial-hidden animate-fade-in-up">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Excel
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our comprehensive platform provides all the tools and resources for your cricket journey
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`group relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300 border border-gray-100 hover:border-green-300 transform hover:-translate-y-6 hover:scale-105 hover:z-50 initial-hidden animate-fade-in-up delay-${(index + 1) * 100}`}
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all shadow-lg`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-emerald-600 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6 initial-hidden animate-slide-in-left">
                                Why Choose SCC Academy of Cricket?
                            </h2>
                            <p className="text-lg text-green-50 mb-8 initial-hidden animate-slide-in-left delay-100">
                                We're committed to developing cricket talent through modern training methodologies,
                                professional guidance, and a passion for the sport.
                            </p>
                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className={`flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all transform hover:scale-105 initial-hidden animate-slide-in-left delay-${(index + 2) * 100}`}>
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <benefit.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-lg font-medium">{benefit.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 initial-hidden animate-slide-in-right delay-200 hover:bg-white/15 transition-all">
                            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="w-6 h-6 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-semibold">Location</div>
                                        <div className="text-green-50">No.14, Wawulagala road, Munagama, Horana</div>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Phone className="w-6 h-6 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-semibold">Phone</div>
                                        <div className="text-green-50">077 207 3762</div>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Mail className="w-6 h-6 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-semibold">Email</div>
                                        <div className="text-green-50">info@sccacademy.lk</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6 initial-hidden animate-fade-in-up">
                        Ready to Elevate Your Cricket Skills?
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 initial-hidden animate-fade-in-up delay-100">
                        Join hundreds of players who are already training at SCC Academy.
                        Start your journey to cricket excellence today.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 initial-hidden animate-fade-in-up delay-200">
                        <button
                            onClick={() => navigate('/register')}
                            className="group px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-110 flex items-center space-x-2"
                        >
                            <span>Create Free Account</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8 initial-hidden animate-fade-in">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4 transform hover:scale-105 transition-transform">
                        <img
                            src="/assets/logo.jpg"
                            alt="SCC Academy"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-green-600"
                        />
                        <span className="text-xl font-bold text-white">SCC Academy of Cricket</span>
                    </div>
                    <p className="text-gray-400 mb-6">
                        Developing cricket champions through excellence in coaching and facilities
                    </p>
                    <div className="border-t border-gray-800 pt-6">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} SCC Academy of Cricket. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
