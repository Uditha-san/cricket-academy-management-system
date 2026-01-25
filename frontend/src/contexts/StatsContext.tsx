import { createContext, useContext, useState, ReactNode } from 'react';

export interface PlayerStats {
    batting: {
        totalRuns: number;
        average: number;
        strikeRate: number;
        highestScore: number;
        centuries: number;
        fifties: number;
    };
    bowling: {
        totalWickets: number;
        average: number;
        economyRate: number;
        bestFigures: string;
        fiveWickets: number;
        maidens: number;
    };
    fielding: {
        catches: number;
        stumpings: number;
        runOuts: number;
    };
    general: {
        matchesPlayed: number;
        wins: number;
        losses: number;
        draws: number;
    };
}

interface StatsContextType {
    getStats: (playerId: string) => PlayerStats;
    updateStats: (playerId: string, newStats: PlayerStats) => void;
}

const defaultStats: PlayerStats = {
    batting: {
        totalRuns: 0,
        average: 0,
        strikeRate: 0,
        highestScore: 0,
        centuries: 0,
        fifties: 0
    },
    bowling: {
        totalWickets: 0,
        average: 0,
        economyRate: 0,
        bestFigures: '0/0',
        fiveWickets: 0,
        maidens: 0
    },
    fielding: {
        catches: 0,
        stumpings: 0,
        runOuts: 0
    },
    general: {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0
    }
};

const initialData: Record<string, PlayerStats> = {
    '3': { // Sumith Ranasinghe
        batting: {
            totalRuns: 1247,
            average: 34.6,
            strikeRate: 89.2,
            highestScore: 89,
            centuries: 0,
            fifties: 8
        },
        bowling: {
            totalWickets: 15,
            average: 28.5,
            economyRate: 7.2,
            bestFigures: '3/25',
            fiveWickets: 0,
            maidens: 2
        },
        fielding: { catches: 12, stumpings: 2, runOuts: 1 },
        general: { matchesPlayed: 45, wins: 28, losses: 15, draws: 2 }
    },
    '4': { // Amil Gunaratne
        batting: {
            totalRuns: 850,
            average: 42.5,
            strikeRate: 75.0,
            highestScore: 65,
            centuries: 0,
            fifties: 5
        },
        bowling: {
            totalWickets: 45,
            average: 22.1,
            economyRate: 5.8,
            bestFigures: '5/30',
            fiveWickets: 1,
            maidens: 8
        },
        fielding: { catches: 8, stumpings: 0, runOuts: 3 },
        general: { matchesPlayed: 32, wins: 20, losses: 10, draws: 2 }
    }
};

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
    const [playerStatsMap, setPlayerStatsMap] = useState<Record<string, PlayerStats>>(initialData);

    const getStats = (playerId: string) => {
        return playerStatsMap[playerId] || defaultStats;
    };

    const updateStats = (playerId: string, newStats: PlayerStats) => {
        setPlayerStatsMap(prev => ({
            ...prev,
            [playerId]: newStats
        }));
    };

    return (
        <StatsContext.Provider value={{ getStats, updateStats }}>
            {children}
        </StatsContext.Provider>
    );
}

export function useStats() {
    const context = useContext(StatsContext);
    if (context === undefined) {
        throw new Error('useStats must be used within a StatsProvider');
    }
    return context;
}
