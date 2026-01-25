import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'guest' | 'player' | 'coach' | 'admin';
    status: 'Active' | 'Inactive';
    joinDate: string;
    avatar?: string;
    // Stats-related info
    battingStyle?: string;
    bowlingStyle?: string;
    totalBookings: number;
    totalSpent: number;
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
    addUser: (user: User) => void;
    updateUser: (user: User) => void;
    deleteUser: (id: string) => void;
    addBooking: (booking: Booking) => void;
    updateBookingStatus: (id: string, status: Booking['status']) => void;
    addFeedback: (feedback: CoachFeedback) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial Mock Data
const initialUsers: User[] = [
    {
        id: '1',
        name: 'Uditha Sandeepa',
        email: 'uditha@example.com',
        phone: '+94 77 123 4567',
        role: 'admin',
        status: 'Active',
        joinDate: '2024-01-01',
        totalBookings: 0,
        totalSpent: 0,
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
        id: '2',
        name: 'Ravindra Pushpakumara',
        email: 'ravindra@example.com',
        phone: '+94 71 234 5678',
        role: 'coach',
        status: 'Active',
        joinDate: '2024-02-15',
        totalBookings: 0,
        totalSpent: 0,
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
        id: '3',
        name: 'Sumith Ranasinghe',
        email: 'sumith@example.com',
        phone: '+94 76 345 6789',
        role: 'player',
        status: 'Active',
        joinDate: '2024-03-10',
        battingStyle: 'Right-handed',
        bowlingStyle: 'Right-arm Fast',
        totalBookings: 15,
        totalSpent: 18500,
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
        id: '4',
        name: 'Amil Gunaratne',
        email: 'amil@example.com',
        phone: '+94 75 456 7890',
        role: 'player',
        status: 'Active',
        joinDate: '2024-04-05',
        battingStyle: 'Left-handed',
        bowlingStyle: 'Right-arm Spin',
        totalBookings: 8,
        totalSpent: 9200,
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
];

const initialBookings: Booking[] = [
    {
        id: 'B001',
        userId: '1',
        userName: 'Rahul Sharma',
        userEmail: 'rahul.sharma@example.com',
        courtId: 'court-1',
        courtName: 'Court 1',
        date: '2025-01-22',
        timeSlot: '10:00 AM - 11:00 AM',
        amount: 944,
        status: 'Confirmed',
        bookingDate: '2025-01-20'
    },
    {
        id: 'B002',
        userId: '2',
        userName: 'Priya Patel',
        userEmail: 'priya.patel@example.com',
        courtId: 'court-2',
        courtName: 'Court 2',
        date: '2025-01-22',
        timeSlot: '2:00 PM - 3:00 PM',
        amount: 708,
        status: 'Pending',
        bookingDate: '2025-01-21'
    }
];

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

    const addUser = (user: User) => {
        setUsers(prev => [...prev, user]);
    };

    const updateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const deleteUser = (id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    const addBooking = (booking: Booking) => {
        setBookings(prev => [booking, ...prev]);
        // Also update total bookings/spent for the user
        setUsers(prev => prev.map(u => {
            if (u.id === booking.userId) {
                return {
                    ...u,
                    totalBookings: u.totalBookings + 1,
                    totalSpent: u.totalSpent + booking.amount
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
            addUser,
            updateUser,
            deleteUser,
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
