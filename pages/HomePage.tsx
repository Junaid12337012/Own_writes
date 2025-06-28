

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BlogPost } from '../types';
import { mockApiService } from '../services/mockApiService';
import BlogPostCard from '../components/Blog/BlogPostCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { ArrowPathIcon, FireIcon, NewspaperIcon, ChevronDoubleRightIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { DEFAULT_FEATURED_IMAGE, APP_NAME } from '../constants';
import { createExcerpt } from '../utils/helpers';
import FeaturedCategoryCard from '../components/Home/FeaturedCategoryCard';
import CompactPostCard from '../components/Home/CompactPostCard';
import Button from '../components/Common/Button';
import { updatePageMeta, injectJSONLD, setSiteDefaults, removeJSONLD } from '../utils/seoUtils';

const POSTS_PER_PAGE = 6; 

const HomePage: React.FC = () => {
  const [allPublishedPosts, setAllPublishedPosts] = useState<BlogPost[]>([]);
  const [heroMainPost, setHeroMainPost] = useState<BlogPost | null>(null);
  const [heroSecondaryPosts, setHeroSecondaryPosts] = useState<BlogPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [displayedLatestPosts, setDisplayedLatestPosts] = useState<BlogPost[]>([]);
  const [latestPostsOffset, setLatestPostsOffset] = useState(POSTS_PER_PAGE);

  const [loading, setLoading] = useState(true);
  
  const { addToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    // Set SEO for HomePage
    setSiteDefaults(); // This sets general site defaults and WebSite schema
    // Optionally, override or add specific HomePage meta if different from site defaults
    updatePageMeta({
      title: `${APP_NAME} - Your Modern Blogging Platform`,
      description: `Discover articles on technology, writing, and more on ${APP_NAME}. AI-powered content creation and a vibrant community.`,
      url: window.location.origin + window.location.pathname,
    });
     return () => {
        removeJSONLD(); // Clean up JSON-LD when component unmounts
    };
  }, []);


  const fetchBlogData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedAllPostsRaw = await mockApiService.getBlogs();
      const publishedAndSortedByRecency = fetchedAllPostsRaw
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAllPublishedPosts(publishedAndSortedByRecency); // State now holds recency-sorted published posts

      // Hero Posts (Newest)
      let currentHeroMainPost: BlogPost | null = null;
      let currentHeroSecondaryPosts: BlogPost[] = [];

      if (publishedAndSortedByRecency.length > 0) {
        currentHeroMainPost = publishedAndSortedByRecency[0];
        currentHeroSecondaryPosts = publishedAndSortedByRecency.slice(1, 6);
      }
      setHeroMainPost(currentHeroMainPost);
      setHeroSecondaryPosts(currentHeroSecondaryPosts);
      
      // Popular Posts (from remaining, sorted by reactions)
      const heroPostIdsCurrent = new Set<string>();
      if (currentHeroMainPost) heroPostIdsCurrent.add(currentHeroMainPost.id);
      currentHeroSecondaryPosts.forEach(p => { if(p) heroPostIdsCurrent.add(p.id); });

      const postsForPopularConsideration = publishedAndSortedByRecency.filter(p => !heroPostIdsCurrent.has(p.id));
      const getTotalReactions = (post: BlogPost) => Object.values(post.reactions || {}).reduce((sum, users) => sum + (users?.length || 0), 0);
      const sortedByLikesForPopular = [...postsForPopularConsideration].sort((a,b) => getTotalReactions(b) - getTotalReactions(a));
      setPopularPosts(sortedByLikesForPopular.slice(0, 3));

      // Categories (from all published posts for full category list)
      const allTags = new Set(fetchedAllPostsRaw.filter(p => p.status === 'published').flatMap(post => post.tags));
      setCategories(Array.from(allTags).sort().slice(0, 6)); 

    } catch (error) {
      console.error("Failed to fetch blog data:", error);
      addToast({ message: 'Could not load blog posts. Please try again later.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchBlogData();
  }, [fetchBlogData]);

  useEffect(() => {
    // allPublishedPosts is already sorted by recency
    if (!heroMainPost && heroSecondaryPosts.length === 0 && popularPosts.length === 0 && allPublishedPosts.length > 0 && !loading) {
      setDisplayedLatestPosts(allPublishedPosts.slice(0, POSTS_PER_PAGE));
      setLatestPostsOffset(POSTS_PER_PAGE);
      return;
    }
    
    const heroPostIds = new Set([heroMainPost?.id, ...heroSecondaryPosts.map(p => p?.id)].filter(Boolean));
    const popularPostIds = new Set(popularPosts.map(p => p.id));

    const latestFeedPosts = allPublishedPosts.filter(p => !heroPostIds.has(p.id) && !popularPostIds.has(p.id));
    
    setDisplayedLatestPosts(latestFeedPosts.slice(0, POSTS_PER_PAGE));
    setLatestPostsOffset(POSTS_PER_PAGE);
  }, [allPublishedPosts, heroMainPost, heroSecondaryPosts, popularPosts, loading]);

  const handleLoadMoreLatest = () => {
    const heroPostIds = new Set([heroMainPost?.id, ...heroSecondaryPosts.map(p => p?.id)].filter(Boolean));
    const popularPostIds = new Set(popularPosts.map(p => p.id));
    
    const basePostsForLatestFeed = allPublishedPosts.filter(p => !heroPostIds.has(p.id) && !popularPostIds.has(p.id));

    const nextOffset = latestPostsOffset + POSTS_PER_PAGE;
    setDisplayedLatestPosts(prev => [...prev, ...basePostsForLatestFeed.slice(latestPostsOffset, nextOffset)]);
    setLatestPostsOffset(nextOffset);
  };

  const hasMoreLatestPosts = useMemo(() => {
    const heroPostIds = new Set([heroMainPost?.id, ...heroSecondaryPosts.map(p => p?.id)].filter(Boolean));
    const popularPostIds = new Set(popularPosts.map(p => p.id));
    const totalFilterablePostsForLatest = allPublishedPosts.filter(p => !heroPostIds.has(p.id) && !popularPostIds.has(p.id)).length;
    return displayedLatestPosts.length < totalFilterablePostsForLatest;
  }, [displayedLatestPosts.length, allPublishedPosts, heroMainPost, heroSecondaryPosts, popularPosts]);


  const handleRefresh = () => {
    addToast({ message: 'Refreshing blog posts...', type: 'info' });
    fetchBlogData();
  };

  const handleSelectCategory = (category: string) => {
      navigate(`/category/${encodeURIComponent(category)}`);
  };


  if (loading && allPublishedPosts.length === 0) { 
    return <LoadingSpinner message={"Loading latest articles..."} className="py-20 min-h-[calc(100vh-20rem)]" />;
  }

  const HeroSection: React.FC = () => {
    if (!heroMainPost) return null;

    return (
      <section className="mb-12 md:mb-16 lg:mb-20 group">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          <div className="md:col-span-1 lg:col-span-3 relative rounded-lg shadow-lg dark:shadow-primary-700/50 overflow-hidden min-h-[400px] md:min-h-[450px] lg:min-h-[500px] flex flex-col justify-end group border border-secondary-200 dark:border-primary-700">
            <img 
              src={heroMainPost.featuredImage || DEFAULT_FEATURED_IMAGE} 
              alt={heroMainPost.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
            <div className="relative p-6 md:p-8 text-white z-10">
              {heroMainPost.tags.slice(0, 1).map(tag => (
                <Link 
                    key={tag} 
                    to={`/category/${encodeURIComponent(tag)}`}
                    className="inline-block bg-accent-500 dark:bg-accent-600 text-white dark:text-accent-100 text-xs font-semibold mb-3 px-3 py-1 rounded-full uppercase tracking-wider hover:bg-accent-600 dark:hover:bg-accent-500 transition-colors"
                >
                    {tag}
                </Link>
              ))}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 hover:text-accent-300 dark:hover:text-accent-200 transition-colors leading-tight">
                <Link to={`/blog/${heroMainPost.id}`}>{heroMainPost.title}</Link>
              </h1>
              <p className="text-gray-200 dark:text-gray-300 text-base md:text-lg mb-4 line-clamp-2">{heroMainPost.excerpt || createExcerpt(heroMainPost.content, 150)}</p>
              <div className="text-sm text-gray-300 dark:text-gray-400">
                By <Link to={`/author/${heroMainPost.authorId}`} className="font-medium hover:underline">{heroMainPost.authorName}</Link> &bull; {new Date(heroMainPost.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {heroSecondaryPosts.length > 0 && (
            <div className="md:col-span-1 lg:col-span-2 flex flex-col space-y-4">
              {heroSecondaryPosts.map(post => (
                post && <CompactPostCard key={post.id} post={post} orientation="horizontal"/>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };
  
  const NoHeroFallback: React.FC = () => {
     if (heroMainPost) return null;
     return (
        <section className="mb-12 md:mb-16 text-center py-16 bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 dark:from-primary-700 dark:via-primary-800 dark:to-primary-900 text-white rounded-lg shadow-lg dark:shadow-primary-700/50">
             <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-5">Welcome to Own_writes</h1>
             <p className="text-lg md:text-xl text-primary-200 dark:text-primary-300 mb-8 max-w-xl mx-auto">Discover amazing stories, insights, and ideas from our community.</p>
             <Link to="/blogs">
                <Button variant="secondary" size="lg" className="!bg-white !text-accent-600 dark:!bg-primary-100 dark:!text-accent-500 hover:!bg-accent-50 dark:hover:!bg-primary-200 text-lg">Explore All Posts</Button>
             </Link>
        </section>
     );
  };


  return (
    <div className="space-y-12 md:space-y-16">
      <HeroSection />
      <NoHeroFallback />
      
      {loading && (heroMainPost || displayedLatestPosts.length > 0) && <LoadingSpinner message="Updating feed..." className="py-10" />}

      {categories.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-900 dark:text-primary-100 flex items-center">
                <HashtagIcon className="h-7 w-7 text-accent-500 dark:text-accent-400 mr-2.5" /> Featured Categories
            </h2>
             <Link to="/categories" className="text-sm font-semibold text-accent-500 dark:text-accent-400 hover:text-accent-600 dark:hover:text-accent-300 flex items-center group">
                View All <ChevronDoubleRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform"/>
             </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-5">
            {categories.slice(0,3).map(category => ( 
              <FeaturedCategoryCard 
                key={category} 
                categoryName={category}
              />
            ))}
          </div>
        </section>
      )}

      {popularPosts.length > 0 && (
         <section>
            <div className="flex justify-between items-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-900 dark:text-primary-100 flex items-center">
                    <FireIcon className="h-7 w-7 text-red-500 mr-2.5" /> Popular This Week
                </h2>
            </div>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {popularPosts.map(post => (
                    <BlogPostCard key={post.id} post={post} />
                ))}
            </div>
         </section>
      )}


      <section>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-900 dark:text-primary-100 flex items-center mb-3 sm:mb-0">
                <NewspaperIcon className="h-8 w-8 text-accent-500 dark:text-accent-400 mr-3" />
                Latest Articles
            </h2>
             <button 
                onClick={handleRefresh}
                className="text-accent-500 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-semibold py-1.5 px-3 rounded-md hover:bg-accent-100 dark:hover:bg-primary-700 transition-colors flex items-center text-sm self-start sm:self-center"
                aria-label="Refresh posts"
            >
                <ArrowPathIcon className="h-4 w-4 mr-1.5"/>
                Refresh
            </button>
        </div>
        
        {categories.length > 0 && (
            <div className="mb-8 md:mb-10 flex flex-wrap justify-center gap-2.5">
                <Button
                    onClick={() => navigate('/blogs')} 
                    variant="primary"
                    size="sm"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md`}
                >
                    All Posts
                </Button>
                {categories.map(category => (
                <button
                    key={category}
                    onClick={() => handleSelectCategory(category)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md bg-secondary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-200 hover:bg-secondary-200 dark:hover:bg-primary-600 hover:text-accent-600 dark:hover:text-accent-300 border border-secondary-200 dark:border-primary-600`}
                >
                    {category}
                </button>
                ))}
            </div>
        )}


        {displayedLatestPosts.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {displayedLatestPosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          !loading && ( 
            <div className="text-primary-700 dark:text-primary-300 text-center py-12 text-lg bg-white dark:bg-primary-800 rounded-lg shadow-md dark:shadow-primary-700/50 border border-secondary-200 dark:border-primary-700">
              <NewspaperIcon className="h-12 w-12 text-secondary-300 dark:text-primary-600 mx-auto mb-4" />
              <p>No posts found. Check back soon!</p>
            </div>
          )
        )}

        {hasMoreLatestPosts && !loading && (
            <div className="mt-10 text-center">
                <Button onClick={handleLoadMoreLatest} variant="primary" size="md" className="!text-base">
                    Load More Posts
                </Button>
            </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
