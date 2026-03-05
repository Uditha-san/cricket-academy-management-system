import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { adminApi, MatchPerformancePayload } from '../../api/admin';

interface PlayerPerformanceModalProps {
    playerId: string;
    playerName: string;
    currentPerformance: any; // We might not need this anymore if we just add a match
    onClose: () => void;
    onUpdate: () => void;
}

export default function PlayerPerformanceModal({
    playerId,
    playerName,
    onClose,
    onUpdate
}: PlayerPerformanceModalProps) {
    const [match, setMatch] = useState<MatchPerformancePayload>({
        matchDate: new Date().toISOString().split('T')[0],
        opponent: '',
        runsScored: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        isDismissed: true,
        ballsBowled: 0,
        maidens: 0,
        runsConceded: 0,
        wicketsTaken: 0,
        catches: 0,
        stumpings: 0
    });

    const [isSaving, setIsSaving] = useState(false);

    // Helpers for overs-to-balls conversion in UI
    const [oversInput, setOversInput] = useState('0');

    const handleOversChange = (val: string) => {
        setOversInput(val);
        // convert e.g., "4.1" to balls (4 * 6 + 1 = 25)
        const parts = val.split('.');
        const overs = parseInt(parts[0]) || 0;
        const balls = parts[1] ? parseInt(parts[1]) : 0;
        setMatch(prev => ({ ...prev, ballsBowled: overs * 6 + balls }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!match.opponent) {
            alert("Opponent is required");
            return;
        }

        setIsSaving(true);
        try {
            await adminApi.addMatchPerformance(playerId, match);
            onUpdate();
        } catch (err) {
            console.error("Failed to add match performance", err);
            alert("Failed to add match data");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        Add Match Performance: {playerName}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Match Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Match Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Match Date <span className="text-red-500">*</span></label>
                                    <input required type="date" value={match.matchDate} onChange={(e) => setMatch({ ...match, matchDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Opponent / Team <span className="text-red-500">*</span></label>
                                    <input required type="text" placeholder="Opponent team name" value={match.opponent} onChange={(e) => setMatch({ ...match, opponent: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Batting Attributes */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-green-700 bg-green-50 p-2 rounded uppercase tracking-wider">Batting</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Runs Scored</label>
                                        <input type="number" min="0" value={match.runsScored} onChange={(e) => setMatch({ ...match, runsScored: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Balls Faced</label>
                                        <input type="number" min="0" value={match.ballsFaced} onChange={(e) => setMatch({ ...match, ballsFaced: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Fours (4s)</label>
                                        <input type="number" min="0" value={match.fours} onChange={(e) => setMatch({ ...match, fours: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Sixes (6s)</label>
                                        <input type="number" min="0" value={match.sixes} onChange={(e) => setMatch({ ...match, sixes: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
                                    </div>
                                    <div className="col-span-2 flex items-center mt-2">
                                        <input type="checkbox" id="isDismissed" checked={match.isDismissed} onChange={(e) => setMatch({ ...match, isDismissed: e.target.checked })} className="h-4 w-4 text-green-600 focus:ring-green-500 rounded" />
                                        <label htmlFor="isDismissed" className="ml-2 block text-sm text-gray-900">
                                            Was Dismissed (Out)?
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Bowling & Fielding Attributes */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-purple-700 bg-purple-50 p-2 rounded uppercase tracking-wider">Bowling & Fielding</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1" title="E.g. 4.1 for 4 overs and 1 ball">Overs Bowled (e.g. 4.1)</label>
                                        <input type="number" step="0.1" min="0" value={oversInput} onChange={(e) => handleOversChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Maidens</label>
                                        <input type="number" min="0" value={match.maidens} onChange={(e) => setMatch({ ...match, maidens: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Runs Conceded</label>
                                        <input type="number" min="0" value={match.runsConceded} onChange={(e) => setMatch({ ...match, runsConceded: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Wickets Taken</label>
                                        <input type="number" min="0" value={match.wicketsTaken} onChange={(e) => setMatch({ ...match, wicketsTaken: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Catches</label>
                                        <input type="number" min="0" value={match.catches} onChange={(e) => setMatch({ ...match, catches: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Stumpings</label>
                                        <input type="number" min="0" value={match.stumpings} onChange={(e) => setMatch({ ...match, stumpings: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-8 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center font-medium"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Adding...' : 'Add Match Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
