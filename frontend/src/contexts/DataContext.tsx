import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../api/axios';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'guest' | 'player' | 'coach' | 'admin';
    status: 'Active' | 'Inactive';
    joinDate: string;
    avatar?: string;
    // Stats-related info removed from root, added in profile
    playerProfile?: {
        battingStyle?: string;
        bowlingStyle?: string;
        totalBookings: number;
        totalSpent: number;
        preferredPosition?: string;
        address?: string;
        emergencyContact?: string;
    };
}

export interface CoachFeedback {
    id: string;
    playerId: string;
    coachId: string;
    coachName: string;
    date: string;
    category: 'Batting' | 'Bowling' | 'Fielding' | 'Fitness' | 'General';
    rating: number; // 1-10
    comment: string;
    areasForImprovement: string[];
}

export interface Booking {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    courtId: string;
    courtName: string;
    date: string;
    timeSlot: string;
    amount: number;
    status: 'Confirmed' | 'Pending' | 'Cancelled';
    bookingDate: string;
}

interface DataContextType {
    users: User[];
    bookings: Booking[];
    feedbacks: CoachFeedback[];
    // Admin user functions removed, as they will be handled by specific API services
    // logged in user profile updates handled separately if needed, or we can keep a simple setProfile
    addBooking: (booking: Booking) => void;
    updateBookingStatus: (id: string, status: Booking['status']) => void;
    addFeedback: (feedback: CoachFeedback) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial Mock Data (kept for guest/demo purposes if needed, but primary is fetch)
const initialUsers: User[] = [];

const initialBookings: Booking[] = [];

const initialFeedbacks: CoachFeedback[] = [
    {
        id: 'F001',
        playerId: '3', // Sumith
        coachId: '2', // Ravindra
        coachName: 'Ravindra Pushpakumara',
        date: '2025-01-15',
        category: 'Batting',
        rating: 8,
        comment: "Great improvement in footwork. Focus on follow-through for better timing. Keep practicing the drive shots.",
        areasForImprovement: ['Follow-through', 'Off-side awareness']
    },
    {
        id: 'F002',
        playerId: '3',
        coachId: '2',
        coachName: 'Ravindra Pushpakumara',
        date: '2025-01-10',
        category: 'Bowling',
        rating: 7,
        comment: "Consistent line and length. Work on variations and speed control. Excellent progress this week!",
        areasForImprovement: ['Speed variations', 'Yorker accuracy']
    },
    {
        id: 'F003',
        playerId: '4', // Amil
        coachId: '2',
        coachName: 'Ravindra Pushpakumara',
        date: '2025-01-12',
        category: 'Fielding',
        rating: 9,
        comment: "Exceptional agility on the field. Great catching technique.",
        areasForImprovement: ['Throwing accuracy from deep']
    }
];

export function DataProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [feedbacks, setFeedbacks] = useState<CoachFeedback[]>(initialFeedbacks);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const [profileRes, bookingsRes] = await Promise.all([
                        api.get('/users/profile'),
                        api.get('/bookings/my')
                    ]);

                    const userProfile = profileRes.data;
                    setUsers([userProfile]); // For now, just set the current user

                    // Transform backend bookings to frontend Booking interface
                    const backendBookings = bookingsRes.data.map((b: any) => ({
                        id: b.id,
                        userId: b.user?.id,
                        userName: userProfile.name, // Assuming own bookings
                        userEmail: userProfile.email,
                        courtId: b.facility?.id || 'unknown',
                        courtName: b.facility?.name || 'Unknown Court',
                        date: new Date(b.bookingDate).toISOString().split('T')[0],
                        timeSlot: `${b.startTime} - ${calculateEndTime(b.startTime, b.duration)}`,
                        amount: parseFloat(b.amount),
                        status: b.status.charAt(0).toUpperCase() + b.status.slice(1), // Capitalize
                        bookingDate: new Date(b.createdAt).toISOString().split('T')[0]
                    }));
                    setBookings(backendBookings);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    const calculateEndTime = (startTime: string, duration: number) => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration * 60;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    };

    // User management functions removed

    const addBooking = (booking: Booking) => {
        setBookings(prev => [booking, ...prev]);
        // Also update total bookings/spent for the user
        setUsers(prev => prev.map(u => {
            if (u.id === booking.userId && u.playerProfile) {
                return {
                    ...u,
                    playerProfile: {
                        ...u.playerProfile,
                        totalBookings: u.playerProfile.totalBookings + 1,
                        totalSpent: u.playerProfile.totalSpent + booking.amount
                    }
                };
            }
            return u;
        }));
    };

    const updateBookingStatus = (id: string, status: Booking['status']) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    };

    const addFeedback = (feedback: CoachFeedback) => {
        setFeedbacks(prev => [feedback, ...prev]);
    };

    return (
        <DataContext.Provider value={{
            users,
            bookings,
            feedbacks,
            addBooking,
            updateBookingStatus,
            addFeedback
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
