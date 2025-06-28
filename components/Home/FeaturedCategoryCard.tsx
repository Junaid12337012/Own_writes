
import React from 'react';
import { Link } from 'react-router-dom';
import { TagIcon as DefaultCategoryIcon } from '@heroicons/react/24/outline';

interface FeaturedCategoryCardProps {
  categoryName: string;
  icon?: React.ElementType;
  description?: string; 
}

const FeaturedCategoryCard: React.FC<FeaturedCategoryCardProps> = ({ categoryName, icon: IconComponent, description }) => {
  const Icon = IconComponent || DefaultCategoryIcon;
  return (
    <Link
      to={`/category/${encodeURIComponent(categoryName)}`}
      className="block bg-white dark:bg-primary-800 p-5 rounded-lg shadow-md hover:shadow-lg dark:hover:shadow-primary-700/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out group border border-secondary-200 dark:border-primary-700 hover:border-secondary-300 dark:hover:border-primary-600"
      aria-label={`View posts in category ${categoryName}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="p-2.5 bg-accent-100 dark:bg-primary-700 rounded-full mb-3 group-hover:bg-accent-200 dark:group-hover:bg-primary-600 transition-colors">
          <Icon className="h-8 w-8 text-accent-500 dark:text-accent-400 transition-colors group-hover:text-accent-600 dark:group-hover:text-accent-300" />
        </div>
        <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors mb-1">
          {categoryName}
        </h3>
        {description && (
          <p className="text-xs text-primary-600 dark:text-primary-400 line-clamp-2">{description}</p>
        )}
      </div>
    </Link>
  );
};

export default FeaturedCategoryCard;
