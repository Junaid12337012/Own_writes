
import React, { useState, useEffect, useCallback } from 'react';
import { mockApiService } from '../../services/mockApiService';
import LoadingSpinner from '../Common/LoadingSpinner';
import { TotalStats, TopPostStat } from '../../types';
import { UsersIcon, DocumentTextIcon, ChatBubbleLeftEllipsisIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const AdminAnalyticsOverview: React.FC = () => {
  const [stats, setStats] = useState<TotalStats | null>(null);
  const [topPosts, setTopPosts] = useState<TopPostStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [totalStats, topPostsData] = await Promise.all([
        mockApiService.getAnalyticsTotalStats(),
        mockApiService.getAnalyticsTopPosts(),
      ]);
      setStats(totalStats);
      setTopPosts(topPostsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Add notification if available
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return <LoadingSpinner message="Loading analytics data..." />;
  }

  if (!stats) {
    return <p className="text-red-500 dark:text-red-400">Could not load analytics data.</p>;
  }

  const chartData = topPosts.map(post => ({
    name: post.title.substring(0, 20) + (post.title.length > 20 ? '...' : ''), 
    Likes: post.viewsOrLikes, 
    postId: post.postId
  }));

  return (
    <div className="space-y-8">
      <h3 className="text-3xl font-semibold text-primary-900 dark:text-primary-100">Analytics Overview</h3>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-accent-500 dark:bg-accent-600 text-white p-6 rounded-lg shadow-md flex items-center space-x-4 border border-accent-600 dark:border-accent-700">
          <UsersIcon className="h-10 w-10" />
          <div>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
            <p className="text-accent-100 dark:text-accent-200">Total Users</p>
          </div>
        </div>
        <div className="bg-green-500 dark:bg-green-600 text-white p-6 rounded-lg shadow-md flex items-center space-x-4 border border-green-600 dark:border-green-700">
          <DocumentTextIcon className="h-10 w-10" />
          <div>
            <p className="text-3xl font-bold">{stats.totalBlogs}</p>
            <p className="text-green-100 dark:text-green-200">Total Blog Posts</p>
          </div>
        </div>
        <div className="bg-yellow-500 dark:bg-yellow-600 text-white p-6 rounded-lg shadow-md flex items-center space-x-4 border border-yellow-600 dark:border-yellow-700">
          <ChatBubbleLeftEllipsisIcon className="h-10 w-10" />
          <div>
            <p className="text-3xl font-bold">{stats.totalComments}</p>
            <p className="text-yellow-100 dark:text-yellow-200">Total Comments</p>
          </div>
        </div>
      </div>

      {/* Top Posts Chart */}
      {topPosts.length > 0 && (
        <div className="bg-white dark:bg-primary-800 p-6 rounded-lg shadow-md border border-secondary-200 dark:border-primary-700">
          <div className="flex items-center mb-4">
            <ArrowTrendingUpIcon className="h-6 w-6 text-accent-600 dark:text-accent-400 mr-2" />
            <h4 className="text-xl font-semibold text-primary-800 dark:text-primary-100">Top Liked Posts</h4>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)"/>
                <XAxis dataKey="name" tick={{fill: 'var(--chart-text-color)'}} />
                <YAxis allowDecimals={false} tick={{fill: 'var(--chart-text-color)'}}/>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-tooltip-bg)', 
                    color: 'var(--chart-tooltip-text)', 
                    borderRadius: '0.5rem', 
                    border: '1px solid var(--chart-grid-color)' 
                  }}
                  cursor={{fill: 'var(--chart-grid-color)', fillOpacity: 0.3}}
                />
                <Legend wrapperStyle={{ color: 'var(--chart-legend-text)' }} />
                <Bar dataKey="Likes" fill="var(--chart-bar-color)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Top Posts List */}
       {topPosts.length > 0 && (
         <div className="bg-white dark:bg-primary-800 p-6 rounded-lg shadow-md border border-secondary-200 dark:border-primary-700">
            <h4 className="text-xl font-semibold text-primary-800 dark:text-primary-100 mb-4">Top Posts Details</h4>
            <ul className="divide-y divide-secondary-200 dark:divide-primary-700">
                {topPosts.map(post => (
                    <li key={post.postId} className="py-3">
                        <Link to={`/blog/${post.postId}`} className="text-accent-600 dark:text-accent-400 hover:underline font-medium">
                            {post.title}
                        </Link>
                        <p className="text-sm text-primary-600 dark:text-primary-400">{post.viewsOrLikes} Likes</p>
                    </li>
                ))}
            </ul>
         </div>
       )}

    </div>
  );
};

export default AdminAnalyticsOverview;
