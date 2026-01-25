import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { PlayerStats } from '../../contexts/StatsContext';

interface PlayerStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerId: string;
    playerName: string;
    currentStats: PlayerStats;
    onSave: (stats: PlayerStats) => void;
}

type Tab = 'batting' | 'bowling' | 'fielding' | 'general';

export default function PlayerStatsModal({
    isOpen,
    onClose,
    playerName,
    currentStats,
    onSave
}: PlayerStatsModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('batting');
    const [stats, setStats] = useState<PlayerStats>(currentStats);

    useEffect(() => {
        setStats(currentStats);
    }, [currentStats]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(stats);
        onClose();
    };

    const tabs: { id: Tab; label: string }[] = [
        { id: 'batting', label: 'Batting' },
        { id: 'bowling', label: 'Bowling' },
        { id: 'fielding', label: 'Fielding' },
        { id: 'general', label: 'General' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        Update Stats: {playerName}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mb-6 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Batting Tab */}
                        {activeTab === 'batting' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Total Runs</label>
                                    <input
                                        type="number"
                                        value={stats.batting.totalRuns}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            batting: { ...stats.batting, totalRuns: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Average</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={stats.batting.average}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            batting: { ...stats.batting, average: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Strike Rate</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={stats.batting.strikeRate}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            batting: { ...stats.batting, strikeRate: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Highest Score</label>
                                    <input
                                        type="number"
                                        value={stats.batting.highestScore}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            batting: { ...stats.batting, highestScore: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Centuries (100s)</label>
                                    <input
                                        type="number"
                                        value={stats.batting.centuries}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            batting: { ...stats.batting, centuries: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Fifties (50s)</label>
                                    <input
                                        type="number"
                                        value={stats.batting.fifties}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            batting: { ...stats.batting, fifties: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Bowling Tab */}
                        {activeTab === 'bowling' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Total Wickets</label>
                                    <input
                                        type="number"
                                        value={stats.bowling.totalWickets}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            bowling: { ...stats.bowling, totalWickets: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Average</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={stats.bowling.average}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            bowling: { ...stats.bowling, average: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Economy Rate</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={stats.bowling.economyRate}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            bowling: { ...stats.bowling, economyRate: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Best Figures</label>
                                    <input
                                        type="text"
                                        value={stats.bowling.bestFigures}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            bowling: { ...stats.bowling, bestFigures: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                        placeholder="e.g. 5/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">5 Wickets</label>
                                    <input
                                        type="number"
                                        value={stats.bowling.fiveWickets}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            bowling: { ...stats.bowling, fiveWickets: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Maidens</label>
                                    <input
                                        type="number"
                                        value={stats.bowling.maidens}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            bowling: { ...stats.bowling, maidens: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Fielding Tab */}
                        {activeTab === 'fielding' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Catches</label>
                                    <input
                                        type="number"
                                        value={stats.fielding.catches}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            fielding: { ...stats.fielding, catches: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Stumpings</label>
                                    <input
                                        type="number"
                                        value={stats.fielding.stumpings}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            fielding: { ...stats.fielding, stumpings: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Run Outs</label>
                                    <input
                                        type="number"
                                        value={stats.fielding.runOuts}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            fielding: { ...stats.fielding, runOuts: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Matches Played</label>
                                    <input
                                        type="number"
                                        value={stats.general.matchesPlayed}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            general: { ...stats.general, matchesPlayed: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Wins</label>
                                    <input
                                        type="number"
                                        value={stats.general.wins}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            general: { ...stats.general, wins: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Losses</label>
                                    <input
                                        type="number"
                                        value={stats.general.losses}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            general: { ...stats.general, losses: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Draws/Ties</label>
                                    <input
                                        type="number"
                                        value={stats.general.draws}
                                        onChange={(e) => setStats({
                                            ...stats,
                                            general: { ...stats.general, draws: Number(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-3 mt-8 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center font-medium"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Stats
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
