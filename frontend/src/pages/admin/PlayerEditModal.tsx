import { useState } from 'react';
import { adminApi } from '../../api/admin';

interface PlayerEditModalProps {
    player: any;
    onClose: () => void;
    onUpdate: () => void;
}

export default function PlayerEditModal({ player, onClose, onUpdate }: PlayerEditModalProps) {
    const [formData, setFormData] = useState({
        name: player.name || '',
        email: player.email || '',
        phone: player.phone || '',
        dateOfBirth: player.playerProfile?.dateOfBirth || '',
        status: player.status || 'Active',
        battingStyle: player.playerProfile?.battingStyle || 'Right-handed',
        bowlingStyle: player.playerProfile?.bowlingStyle || 'Right-arm Medium',
        preferredPosition: player.playerProfile?.preferredPosition || 'All-rounder'
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await adminApi.updatePlayer(player.id, formData);
            onUpdate();
        } catch (err: any) {
            console.error("Update player failed", err);
            alert('Failed to update player.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Player Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Batting Style</label>
                            <select
                                value={formData.battingStyle}
                                onChange={(e) => setFormData(p => ({ ...p, battingStyle: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="Right-handed">Right-handed</option>
                                <option value="Left-handed">Left-handed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bowling Style</label>
                            <select
                                value={formData.bowlingStyle}
                                onChange={(e) => setFormData(p => ({ ...p, bowlingStyle: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="Right-arm Medium">Right-arm Medium</option>
                                <option value="Right-arm Fast">Right-arm Fast</option>
                                <option value="Left-arm Medium">Left-arm Medium</option>
                                <option value="Left-arm Fast">Left-arm Fast</option>
                                <option value="Right-arm Spin">Right-arm Spin</option>
                                <option value="Left-arm Spin">Left-arm Spin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Position</label>
                            <select
                                value={formData.preferredPosition}
                                onChange={(e) => setFormData(p => ({ ...p, preferredPosition: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="Batsman">Batsman</option>
                                <option value="Bowler">Bowler</option>
                                <option value="All-rounder">All-rounder</option>
                                <option value="Wicket-keeper">Wicket-keeper</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isSaving ? 'Updating...' : 'Update Player'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
