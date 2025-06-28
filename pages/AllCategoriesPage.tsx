

import React, { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '../types';
import { mockApiService } from '../services/mockApiService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import FeaturedCategoryCard from '../components/Home/FeaturedCategoryCard';
import { Squares2X2Icon, TagIcon } from '@heroicons/react/24/outline'; 

interface CategoryInfo {
  name: string;
  postCount: number;
}

const AllCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const allPosts = await mockApiService.getBlogs();
      const publishedPosts = allPosts.filter(p => p.status === 'published');
      
      const tagCounts: { [key: string]: number } = {};
      publishedPosts.forEach(post => {
        post.tags.forEach(tag => {
          const normalizedTag = tag.trim();
          if (normalizedTag) {
            tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
          }
        });
      });

      const categoryList: CategoryInfo[] = Object.entries(tagCounts)
        .map(([name, postCount]) => ({ name, postCount }))
        .sort((a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name)); 
      
      setCategories(categoryList);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      addToast({ message: 'Could not load categories. Please try again later.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) {
    return <LoadingSpinner message="Loading all categories..." className="py-20 min-h-[calc(100vh-20rem)]" />;
  }

  return (
    <div className="space-y-8">
      <header className="pb-6 border-b border-secondary-200 dark:border-primary-700">
        <div className="flex items-center">
          <Squares2X2Icon className="h-9 w-9 text-accent-500 dark:text-accent-400 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
              Explore All Categories
            </h1>
            <p className="text-primary-700 dark:text-primary-300 mt-1">Discover topics that interest you from our collection of blog posts.</p>
          </div>
        </div>
      </header>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {categories.map(category => (
            <FeaturedCategoryCard 
              key={category.name} 
              categoryName={category.name} 
              description={`${category.postCount} ${category.postCount === 1 ? 'post' : 'posts'}`}
              icon={TagIcon} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-primary-800 rounded-lg shadow-md dark:shadow-primary-700/50 border border-secondary-200 dark:border-primary-700">
          <Squares2X2Icon className="h-16 w-16 text-secondary-300 dark:text-primary-600 mx-auto mb-5" />
          <p className="text-xl text-primary-800 dark:text-primary-100 mb-2">No categories found.</p>
          <p className="text-primary-700 dark:text-primary-300">It seems we haven't categorized any posts yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default AllCategoriesPage;
