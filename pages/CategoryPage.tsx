

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BlogPost } from '../types';
import { mockApiService } from '../services/mockApiService';
import BlogPostCard from '../components/Blog/BlogPostCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';
import { useNotification } from '../contexts/NotificationContext';
import { TagIcon, ArrowPathIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { updatePageMeta, removeJSONLD } from '../utils/seoUtils';
import { APP_NAME } from '../constants';


interface CategoryPageProps {
  categoryName: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ categoryName }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    updatePageMeta({
      title: `Category: ${categoryName}`,
      description: `Explore all blog posts in the "${categoryName}" category on ${APP_NAME}. Find articles and insights on ${categoryName}.`,
      url: window.location.href, // Or construct more cleanly: `${window.location.origin}/#/category/${encodeURIComponent(categoryName)}`
    });
    return () => {
        removeJSONLD(); // No specific JSON-LD for category page in this iteration
    };
  }, [categoryName]);


  const fetchPostsByCategory = useCallback(async () => {
    setLoading(true);
    try {
      const allPosts = await mockApiService.getBlogs();
      const filteredPosts = allPosts.filter(post => 
        post.status === 'published' &&
        post.tags.map(tag => tag.toLowerCase()).includes(categoryName.toLowerCase())
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setPosts(filteredPosts);
    } catch (error) {
      console.error(`Failed to fetch posts for category ${categoryName}:`, error);
      addToast({ message: `Could not load posts for ${categoryName}.`, type: 'error' });
    }
    setLoading(false);
  }, [categoryName, addToast]);

  useEffect(() => {
    fetchPostsByCategory();
  }, [fetchPostsByCategory]);

  const handleRefresh = () => {
    addToast({ message: `Refreshing posts in ${categoryName}...`, type: 'info' });
    fetchPostsByCategory();
  };

  if (loading) {
    return <LoadingSpinner message={`Loading posts in "${categoryName}"...`} className="py-20 min-h-[calc(100vh-20rem)]" />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-secondary-200 dark:border-primary-700">
        <div>
            <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-2 -ml-2 !text-primary-700 dark:!text-primary-300 hover:!text-accent-600 dark:hover:!text-accent-400" leftIcon={<ArrowUturnLeftIcon className="h-5 w-5"/>}>
                Back
            </Button>
            <div className="flex items-center">
                <TagIcon className="h-8 w-8 text-accent-500 dark:text-accent-400 mr-3" />
                <div>
                    <p className="text-sm text-primary-600 dark:text-primary-400">Category</p>
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
                        {categoryName}
                    </h1>
                </div>
            </div>
        </div>
        <button 
            onClick={handleRefresh}
            className="text-accent-500 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-semibold py-1.5 px-3 rounded-md hover:bg-accent-100 dark:hover:bg-primary-700 transition-colors flex items-center text-sm mt-3 sm:mt-0 self-start sm:self-center"
        >
            <ArrowPathIcon className="h-4 w-4 mr-1.5"/>
            Refresh
        </button>
      </header>

      {posts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map(post => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-primary-800 rounded-lg shadow-md dark:shadow-primary-700/50 border border-secondary-200 dark:border-primary-700">
          <TagIcon className="h-16 w-16 text-secondary-300 dark:text-primary-600 mx-auto mb-5" />
          <p className="text-xl text-primary-800 dark:text-primary-100 mb-2">No posts found in the "{categoryName}" category.</p>
          <p className="text-primary-700 dark:text-primary-300 mb-5">Why not explore other topics or check back later?</p>
          <div className="space-x-3">
            <Link to="/blogs">
              <Button variant="primary">View All Posts</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Go to Homepage</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
