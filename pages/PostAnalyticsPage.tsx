
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockApiService } from '../services/mockApiService';
import { PostAnalyticsData, BlogPost } from '../types';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUturnLeftIcon, ChartBarIcon, ShareIcon, ChatBubbleLeftRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import Button from '../components/Common/Button';

const PostAnalyticsPage: React.FC = () => {
  const { id: postId } = useParams<{ id: string }>();
  const [analytics, setAnalytics] = useState<PostAnalyticsData | null>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const fetchAnalyticsData = useCallback(async () => {
    if (!postId) {
      addToast({ message: 'Post ID is missing.', type: 'error' });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [postData, analyticsData] = await Promise.all([
        mockApiService.getBlogById(postId),
        mockApiService.getPostAnalytics(postId),
      ]);
      setPost(postData);
      setAnalytics(analyticsData);
    } catch (error) {
      addToast({ message: 'Failed to load post analytics.', type: 'error' });
    }
    setLoading(false);
  }, [postId, addToast]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading) {
    return <LoadingSpinner message="Loading post analytics..." />;
  }

  if (!analytics || !post) {
    return <div className="text-center py-10">Analytics data for this post could not be found.</div>;
  }
  
  const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

  return (
    <div className="space-y-8">
       <header>
          <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm" className="mb-4 -ml-2 !text-primary-700 dark:!text-primary-300" leftIcon={<ArrowUturnLeftIcon className="h-5 w-5"/>}>
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-primary-800 dark:text-primary-100">Analytics for "{post.title}"</h1>
          <p className="text-primary-600 dark:text-primary-400">Published on {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</p>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-primary-800 p-6 rounded-lg shadow-md border border-secondary-200 dark:border-primary-700 text-center">
                <HeartIcon className="h-8 w-8 mx-auto text-pink-500 mb-2" />
                <p className="text-3xl font-bold text-primary-800 dark:text-primary-100">{analytics.engagementScore.breakdown.reactions}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400">Total Reactions</p>
            </div>
             <div className="bg-white dark:bg-primary-800 p-6 rounded-lg shadow-md border border-secondary-200 dark:border-primary-700 text-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-3xl font-bold text-primary-800 dark:text-primary-100">{analytics.engagementScore.breakdown.comments}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400">Total Comments</p>
            </div>
             <div className="bg-white dark:bg-primary-800 p-6 rounded-lg shadow-md border border-secondary-200 dark:border-primary-700 text-center">
                <ShareIcon className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-3xl font-bold text-primary-800 dark:text-primary-100">{analytics.engagementScore.breakdown.shares}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400">Mock Shares</p>
            </div>
       </div>

        <div className="bg-white dark:bg-primary-800 p-6 rounded-lg shadow-md border border-secondary-200 dark:border-primary-700">
          <h2 className="text-xl font-semibold text-primary-800 dark:text-primary-100 mb-4 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-accent-500" />
              Mock Views Over Last 7 Days
          </h2>
          <div style={{ width: '100%', height: 300 }}>
             <ResponsiveContainer>
              <LineChart data={analytics.viewsOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)"/>
                <XAxis dataKey="date" tick={{fill: 'var(--chart-text-color)'}}/>
                <YAxis allowDecimals={false} tick={{fill: 'var(--chart-text-color)'}}/>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-tooltip-bg)', 
                    color: 'var(--chart-tooltip-text)', 
                    borderRadius: '0.5rem', 
                    border: '1px solid var(--chart-grid-color)' 
                  }}
                  cursor={{stroke: 'var(--chart-bar-color)', strokeWidth: 2}}
                />
                <Legend wrapperStyle={{ color: 'var(--chart-legend-text)' }} />
                <Line type="monotone" dataKey="views" stroke="var(--chart-bar-color)" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-primary-800 p-6 rounded-lg shadow-md border border-secondary-200 dark:border-primary-700">
                <h2 className="text-xl font-semibold text-primary-800 dark:text-primary-100 mb-4">Traffic Sources</h2>
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <PieChart>
                        <Pie
                            data={analytics.trafficSources}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="source"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12">
                                    {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                );
                            }}
                        >
                            {analytics.trafficSources.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                         <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'var(--chart-tooltip-bg)', 
                                color: 'var(--chart-tooltip-text)', 
                                borderRadius: '0.5rem', 
                                border: '1px solid var(--chart-grid-color)' 
                            }}
                         />
                         <Legend wrapperStyle={{ color: 'var(--chart-legend-text)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="bg-white dark:bg-primary-800 p-6 rounded-lg shadow-md border border-secondary-200 dark:border-primary-700 flex flex-col justify-center items-center">
                 <h2 className="text-xl font-semibold text-primary-800 dark:text-primary-100 mb-2">Engagement Score</h2>
                 <div className="w-32 h-32 rounded-full flex items-center justify-center bg-accent-100 dark:bg-primary-700 border-4 border-accent-400">
                    <span className="text-4xl font-bold text-accent-500 dark:text-accent-300">{analytics.engagementScore.score}</span>
                 </div>
                 <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 text-center">A score based on reactions, comments, and shares (mock).</p>
            </div>
        </div>
    </div>
  );
};

export default PostAnalyticsPage;
