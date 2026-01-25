import { useData } from '../../contexts/DataContext';
// import { useStats } from '../../contexts/StatsContext';
import { TrendingUp, Award, Target, ChevronRight, Star } from 'lucide-react';

interface ImprovementSectionProps {
    playerId: string;
}

export default function ImprovementSection({ playerId }: ImprovementSectionProps) {
    const { feedbacks } = useData();
    // const { getStats } = useStats();

    const playerFeedbacks = feedbacks
        .filter(f => f.playerId === playerId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // const stats = getStats(playerId);

    // Mock performance trend data (last 5 matches)
    // In a real app, this would come from a match history endpoint
    const performanceTrend = [35, 42, 18, 56, 45];
    const maxScore = Math.max(...performanceTrend, 80);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Performance & Improvement</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Trend Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <TrendingUp className="w-6 h-6 text-blue-500 mr-2" />
                            <h3 className="font-semibold text-gray-900">Batting Form</h3>
                        </div>
                        <span className="text-sm text-green-600 font-medium">+12% vs last month</span>
                    </div>

                    <div className="h-48 flex items-end justify-between gap-2">
                        {performanceTrend.map((score, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center group">
                                <div className="relative w-full flex justify-center">
                                    <div
                                        className="w-full max-w-[40px] bg-blue-100 group-hover:bg-blue-200 transition-all rounded-t-sm relative"
                                        style={{ height: `${(score / maxScore) * 150}px` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {score} runs
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2">M{idx + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skill Focus Radar (Simplified visual) */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                        <Target className="w-6 h-6 text-purple-500 mr-2" />
                        <h3 className="font-semibold text-gray-900">Skill Focus Areas</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Batting Technique</span>
                                <span className="font-medium text-purple-600">8.5/10</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Bowling Accuracy</span>
                                <span className="font-medium text-blue-600">7.2/10</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '72%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Fielding Agility</span>
                                <span className="font-medium text-green-600">9.0/10</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Recommended Drills</h4>
                        <div className="flex gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">Drive Shot Practice</span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">Spot Bowling</span>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">High Catches</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coach Feedback List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                        <Award className="w-6 h-6 text-orange-500 mr-2" />
                        <h3 className="font-semibold text-gray-900">Coach Feedback</h3>
                    </div>
                    <span className="text-sm text-gray-500">{playerFeedbacks.length} reviews</span>
                </div>

                <div className="divide-y divide-gray-100">
                    {playerFeedbacks.length > 0 ? (
                        playerFeedbacks.map((feedback) => (
                            <div key={feedback.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${feedback.category === 'Batting' ? 'bg-blue-100 text-blue-700' :
                                                feedback.category === 'Bowling' ? 'bg-green-100 text-green-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {feedback.category}
                                            </span>
                                            <span className="text-xs text-gray-500">{feedback.date}</span>
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-1">{feedback.coachName}</h4>
                                    </div>
                                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                                        <span className="font-bold text-yellow-700">{feedback.rating}/10</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-3">"{feedback.comment}"</p>

                                {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {feedback.areasForImprovement.map((area, idx) => (
                                            <span key={idx} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                                                Focus: {area}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No feedback available yet.
                        </div>
                    )}
                </div>

                {playerFeedbacks.length > 3 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center mx-auto">
                            View All History <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
