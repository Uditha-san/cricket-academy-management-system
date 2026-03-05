
import { ArrowLeft, TrendingUp, Target, Trophy, Calendar } from 'lucide-react';

interface PlayerStatsPageProps {
  onNavigate: (page: string) => void;
}

import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function PlayerStatsPage({ onNavigate }: PlayerStatsPageProps) {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [matchPerformances, setMatchPerformances] = useState<any[]>([]);
  const [coachFeedbacks, setCoachFeedbacks] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [selectedCoach, setSelectedCoach] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.id !== 'guest') {
      Promise.all([
        api.get('/users/profile'),
        api.get('/users/notifications'),
        api.get('/users/coaches')
      ]).then(([profileRes, notifRes, coachesRes]) => {
        setPerformanceData(profileRes.data.performance);
        if (profileRes.data.matchPerformances) {
          setMatchPerformances(profileRes.data.matchPerformances);
        }
        setCoachFeedbacks(notifRes.data || []);

        const fetchedCoaches = coachesRes.data || [];
        setCoaches(fetchedCoaches);
        if (fetchedCoaches.length > 0) {
          setSelectedCoach(fetchedCoaches[0].id);
        }
      }).catch(console.error).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);



  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach || !messageContent.trim()) return;

    setIsSendingMessage(true);
    try {
      await api.post('/users/messages', {
        coachId: selectedCoach,
        content: messageContent
      });
      alert('Message sent to coach successfully!');
      setMessageContent('');
    } catch (error) {
      console.error('Failed to send message', error);
      alert('Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Player Statistics</h1>
        <p className="text-lg text-gray-600">Track your cricket performance and progress</p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Loading your statistics...</div>
      ) : performanceData ? (
        <>
          {/* Performance Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{performanceData?.matchesPlayed || 0}</p>
                  <p className="text-sm text-gray-600">Matches</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{performanceData?.totalRuns || 0}</p>
                  <p className="text-sm text-gray-600">Total Runs</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{performanceData?.totalWickets || 0}</p>
                  <p className="text-sm text-gray-600">Wickets</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{performanceData?.catches || 0}</p>
                  <p className="text-sm text-gray-600">Catches</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Batting Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Runs</span>
                  <span className="font-semibold">{performanceData?.totalRuns || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average</span>
                  <span className="font-semibold">{performanceData?.battingAverage || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Strike Rate</span>
                  <span className="font-semibold">{performanceData?.strikeRate || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Highest Score</span>
                  <span className="font-semibold">{performanceData?.highestScore || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hundreds / Fifties</span>
                  <span className="font-semibold">{performanceData?.hundreds || 0} / {performanceData?.fifties || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bowling Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Wickets</span>
                  <span className="font-semibold">{performanceData?.totalWickets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average</span>
                  <span className="font-semibold">{performanceData?.bowlingAverage || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Economy Rate</span>
                  <span className="font-semibold">{performanceData?.economyRate || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">5-Wicket Hauls</span>
                  <span className="font-semibold">{performanceData?.fiveWicketHauls || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stumpings</span>
                  <span className="font-semibold">{performanceData?.stumpings || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Matches & Coach Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg overflow-y-auto max-h-[800px]">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Match History</h2>
              <div className="space-y-4">
                {matchPerformances.length > 0 ? (
                  matchPerformances
                    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
                    .map((match, index) => {
                      const bowOvers = Math.floor(match.ballsBowled / 6);
                      const bowBalls = match.ballsBowled % 6;
                      const oversStr = `${bowOvers}.${bowBalls}`;
                      return (
                        <div key={match.id || index} className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-gray-900 px-2 py-1 bg-green-100 text-green-800 rounded inline-block mb-1">{match.opponent}</p>
                              <p className="text-sm text-gray-500 font-medium ml-1">{match.matchDate}</p>
                            </div>
                            <div className="text-right">
                              {match.isDismissed ? (
                                <span className="text-xs font-semibold text-red-600 border border-red-200 bg-red-50 px-2 py-1 rounded">Dismissed</span>
                              ) : (
                                <span className="text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-2 py-1 rounded">Not Out</span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-200 text-sm">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Batting</p>
                              <p className="font-semibold text-gray-800">{match.runsScored} <span className="font-normal text-gray-600 text-xs">({match.ballsFaced} b)</span></p>
                              <p className="text-xs text-gray-500">{match.fours}x4, {match.sixes}x6</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Bowling</p>
                              <p className="font-semibold text-gray-800">{match.wicketsTaken}/{match.runsConceded}</p>
                              <p className="text-xs text-gray-500">{oversStr} ov, {match.maidens} M</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Fielding</p>
                              <p className="font-semibold text-gray-800">{match.catches} C</p>
                              <p className="text-xs text-gray-500">{match.stumpings} St</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No match history found.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg overflow-y-auto max-h-[800px]">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Coach Feedback</h2>
              <div className="space-y-4">
                {coachFeedbacks && coachFeedbacks.length > 0 ? (
                  coachFeedbacks.map((feedback, index) => {
                    const dateObj = new Date(feedback.createdAt);
                    const formattedDate = dateObj.toLocaleDateString();
                    return (
                      <div key={feedback.id || index} className="p-4 bg-gray-50 rounded-lg relative overflow-hidden shadow-sm">
                        {!feedback.isRead && (
                          <div className="absolute top-0 right-0 w-2 h-2 mt-4 mr-4 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{feedback.area}</p>
                            <p className="text-sm text-gray-600">{feedback.coachName} • {formattedDate}</p>
                          </div>
                          <div className="flex bg-white px-2 py-1 rounded-full shadow-sm border border-gray-100">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 italic border-l-2 border-indigo-200 pl-3">"{feedback.feedback}"</p>

                        {!feedback.isRead && (
                          <button
                            className="mt-3 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium px-3 py-1 rounded"
                            onClick={() => {
                              api.put(`/users/notifications/${feedback.id}/read`).then(() => {
                                setCoachFeedbacks(prev => prev.map(f => f.id === feedback.id ? { ...f, isRead: true } : f));
                              });
                            }}
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No feedback from coach yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Coach / Ask Questions */}
          <div className="grid grid-cols-1 mt-8">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-4xl mx-auto w-full border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                  <TrendingUp className="w-5 h-5" />
                </span>
                Ask Anything From Your Coach
              </h2>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Coach</label>
                  <select
                    value={selectedCoach}
                    onChange={(e) => setSelectedCoach(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                  >
                    {coaches.map(coach => (
                      <option key={coach.id} value={coach.id}>
                        {coach.name}
                      </option>
                    ))}
                    {coaches.length === 0 && <option value="">No coaches available</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Message or Question</label>
                  <textarea
                    rows={4}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                    placeholder="Ask about your technique, request specific drills, or discuss your performance..."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!messageContent.trim() || isSendingMessage || coaches.length === 0}
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSendingMessage ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg text-gray-500 mb-8">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
          <p className="text-lg font-medium text-gray-600 mb-1">No Statistics Available</p>
          <p className="text-sm">Your performance data has not been updated yet.</p>
        </div>
      )}
    </div>
  );
}