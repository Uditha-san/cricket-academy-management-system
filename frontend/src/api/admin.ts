import api from './axios';

// Type definitions for API requests
export interface UpdatePlayerStatsPayload {
    matchesPlayed: number;
    totalRuns: number;
    highestScore: number;
    battingAverage: number;
    strikeRate: number;
    hundreds: number;
    fifties: number;
    totalWickets: number;
    bowlingAverage: number;
    economyRate: number;
    fiveWicketHauls: number;
    catches: number;
    stumpings: number;
}

export interface MatchPerformancePayload {
    matchDate: string;
    opponent: string;
    runsScored: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    isDismissed: boolean;
    ballsBowled: number;
    maidens: number;
    runsConceded: number;
    wicketsTaken: number;
    catches: number;
    stumpings: number;
}

export const adminApi = {
    // Fetch all players with performance data
    getPlayers: async () => {
        const response = await api.get('/admin/players');
        return response.data;
    },

    // Update basic player profile details
    updatePlayer: async (id: string, data: any) => {
        const response = await api.put(`/admin/players/${id}`, data);
        return response.data;
    },

    // Delete a player
    deletePlayer: async (id: string) => {
        const response = await api.delete(`/admin/players/${id}`);
        return response.data;
    },

    // Update player performance statistics
    updatePlayerPerformance: async (id: string, stats: UpdatePlayerStatsPayload) => {
        const response = await api.put(`/admin/players/${id}/performance`, stats);
        return response.data;
    },

    // Add match-by-match performance
    addMatchPerformance: async (id: string, match: MatchPerformancePayload) => {
        const response = await api.post(`/admin/players/${id}/matches`, match);
        return response.data;
    }
};
