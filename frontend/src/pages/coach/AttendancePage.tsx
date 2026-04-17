import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../api/axios';

interface AttendancePageProps {
  onNavigate: (page: string) => void;
}

interface Player {
  id: string;
  name: string;
}

interface AttendanceRecord {
  playerId: string;
  status: 'Present' | 'Absent';
}

export default function AttendancePage({ onNavigate }: AttendancePageProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlayersAndAttendance();
  }, [date]);

  const fetchPlayersAndAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch players
      const playerRes = await api.get('/coach/players');
      setPlayers(playerRes.data);

      // Fetch attendance for the selected date
      const attendanceRes = await api.get(`/attendance/by-date?date=${date}`);

      const initialAttendance: Record<string, 'Present' | 'Absent'> = {};
      
      // Default all to Present, then override with fetched data
      playerRes.data.forEach((p: Player) => {
        initialAttendance[p.id] = 'Present';
      });

      attendanceRes.data.forEach((record: any) => {
        initialAttendance[record.playerId] = record.status;
      });

      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (playerId: string, status: 'Present' | 'Absent') => {
    setAttendance(prev => ({
      ...prev,
      [playerId]: status
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const records = Object.keys(attendance).map(playerId => ({
        playerId,
        status: attendance[playerId]
      }));
      await api.post('/attendance/mark', {
        date,
        records
      });
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
          <p className="text-lg text-gray-600">Manage daily attendance for your players</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
          />
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {player.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        attendance[player.id] === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {attendance[player.id] || 'Present'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={attendance[player.id] || 'Present'}
                        onChange={(e) => handleStatusChange(player.id, e.target.value as 'Present' | 'Absent')}
                        className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No players found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}