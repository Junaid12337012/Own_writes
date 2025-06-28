


import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types';
import { DEFAULT_FEATURED_IMAGE, DEFAULT_PROFILE_PICTURE } from '../../constants';
import { createExcerpt, estimateReadingTime } from '../../utils/helpers';
import { ClockIcon, EyeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface BlogPostCardProps {
  post: BlogPost;
}

const PremiumIcon = () => (
  <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 p-1 rounded-full z-10 shadow-lg border-2 border-white/50" title="Premium Content">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M9.69 2.69a.75.75 0 01.62 0l1.653 1.14.918-1.423a.75.75 0 011.29.832l-.42 1.84a.75.75 0 01-.282.49L15.3 7.04a.75.75 0 01-.2 1.284l-1.83.421a.75.75 0 01-.489.282l-1.14 1.652a.75.75 0 01-1.298-.832l.42-1.84a.75.75 0 01.282-.49l-1.54-1.54a.75.75 0 01-.2-1.284l1.83-.421a.75.75 0 01.49-.282l1.14-1.653zM4.69 2.69a.75.75 0 01.62 0l1.653 1.14.918-1.423a.75.75 0 011.29.832l-.42 1.84a.75.75 0 01-.282.49L10.3 7.04a.75.75 0 01-.2 1.284l-1.83.421a.75.75 0 01-.489.282l-1.14 1.652a.75.75 0 01-1.298-.832l.42-1.84a.75.75 0 01.282-.49l-1.54-1.54a.75.75 0 01-.2-1.284l1.83-.421a.75.75 0 01.49-.282L4.69 2.69z" clipRule="evenodd" />
      <path d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.06 4.75a.75.75 0 01.12.52l-.42 1.84a.75.75 0 01-1.47-.33l.42-1.84a.75.75 0 011.35-.19zM14.94 4.75a.75.75 0 011.35.19l.42 1.84a.75.75 0 01-1.47.33l-.42-1.84a.75.75 0 01.12-.52zM10 18a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H10a.75.75 0 01-.75-.75zM3.25 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM18.25 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM14.94 15.25a.75.75 0 01.12-.52l.42-1.84a.75.75 0 011.47.33l-.42 1.84a.75.75 0 01-1.35.19zM5.06 15.25a.75.75 0 011.35-.19l.42 1.84a.75.75 0 01-1.47.33l-.42-1.84a.75.75 0 01.12-.52z" />
    </svg>
  </span>
);

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const displayImage = post.featuredImage || DEFAULT_FEATURED_IMAGE;
  const authorImage = DEFAULT_PROFILE_PICTURE; 

  return (
    <article className="relative bg-white dark:bg-primary-800 rounded-lg shadow-md flex flex-col overflow-hidden group border border-secondary-200 dark:border-primary-700 card-lift-hover">
      {/* Image Section */}
      <div className="overflow-hidden relative">
        <Link to={`/blog/${post.id}`} aria-label={`Read more about ${post.title}`}>
            <img 
                src={displayImage} 
                alt={post.title} 
                className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)}
            />
        </Link>
        {post.isPremium && <PremiumIcon />}
      </div>

      {/* Content Section */}
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        {/* Post Type & Tags */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-block bg-secondary-100 dark:bg-primary-700 text-primary-600 dark:text-primary-300 text-xs font-bold px-2 py-0.5 rounded-md capitalize tracking-wide border border-secondary-200 dark:border-primary-600">
            {post.postType || 'blog'}
          </span>
          {post.tags.slice(0, 2).map(tag => ( 
            <Link 
              key={tag} 
              to={`/category/${encodeURIComponent(tag)}`} 
              className="bg-accent-100 text-accent-700 hover:bg-accent-200 hover:text-accent-800 dark:bg-accent-900/50 dark:text-accent-300 dark:hover:bg-accent-800/70 dark:hover:text-accent-200 text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
              aria-label={`View posts tagged with ${tag}`}
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-xl lg:text-2xl font-heading font-semibold text-primary-900 dark:text-primary-100 mb-2 leading-tight">
          <Link to={`/blog/${post.id}`} className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors duration-200 line-clamp-2">
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-primary-700 dark:text-primary-300 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
          {post.excerpt || createExcerpt(post.content, 130)}
        </p>

        {/* Footer: Author & Date */}
        <div className="mt-auto pt-4 border-t border-secondary-200 dark:border-primary-700">
          <div className="flex items-center justify-between">
            <Link to={`/author/${post.authorId}`} className="flex items-center group/author">
              <img 
                src={authorImage} 
                alt={post.authorName} 
                className="h-8 w-8 rounded-full object-cover mr-2.5 border border-secondary-100 dark:border-primary-700 group-hover/author:border-accent-300 dark:group-hover/author:border-accent-500 transition-colors"
              />
              <div>
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300 group-hover/author:text-accent-600 dark:group-hover/author:text-accent-400 transition-colors">{post.authorName}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </Link>
            
            <Link to={`/blog/${post.id}`} className="text-sm font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors flex items-center group/readmore self-end">
                Read
                <ArrowRightIcon className="h-4 w-4 ml-1.5 transition-transform duration-200 group-hover/readmore:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPostCard;
