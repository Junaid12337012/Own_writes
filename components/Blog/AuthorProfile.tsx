

import React, { useState, useEffect, useCallback } from 'react';
import { User, BlogPost } from '../../types';
import { mockApiService } from '../../services/mockApiService';
import LoadingSpinner from '../Common/LoadingSpinner';
import BlogPostCard from './BlogPostCard';
import { useNotification } from '../../contexts/NotificationContext';
import { DEFAULT_PROFILE_PICTURE, APP_NAME } from '../../constants';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Button from '../Common/Button';
import { updatePageMeta, injectJSONLD, removeJSONLD } from '../../utils/seoUtils';
import { useAuth } from '../../contexts/AuthContext';

interface AuthorProfileProps {
  authorId: string;
}

const AuthorProfile: React.FC<AuthorProfileProps> = ({ authorId }) => {
  const [author, setAuthor] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { user, followAuthor, unfollowAuthor } = useAuth();
  
  const isFollowing = user?.following.includes(authorId) ?? false;
  const isOwnProfile = user?.id === authorId;


  useEffect(() => {
    if (author) {
      const pageUrl = `${window.location.origin}/#/author/${author.id}`;
      updatePageMeta({
        title: `Posts by ${author.username}`,
        description: author.bio || `Read articles written by ${author.username} on ${APP_NAME}.`,
        imageUrl: author.profilePictureUrl || DEFAULT_PROFILE_PICTURE,
        url: pageUrl,
        author: author.username,
      });
      injectJSONLD({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": author.username,
        "url": pageUrl,
        "image": author.profilePictureUrl || DEFAULT_PROFILE_PICTURE,
        "description": author.bio || `Author on ${APP_NAME}`,
        // "sameAs": [ // Add links to social profiles if available
        //   "https://twitter.com/authorhandle",
        //   "https://linkedin.com/in/authorprofile"
        // ]
      });
    }
    return () => {
        removeJSONLD();
    };
  }, [author]);

  const fetchAuthorData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedAuthor = await mockApiService.getUserById(authorId);
      if (fetchedAuthor) {
        setAuthor(fetchedAuthor);
        const authorPosts = await mockApiService.getBlogsByAuthor(authorId);
        setPosts(authorPosts.filter(p => p.status === 'published'));
      } else {
        addToast({ message: 'Author not found.', type: 'error' });
        // navigate('/404'); 
      }
    } catch (error) {
      console.error("Failed to fetch author data:", error);
      addToast({ message: 'Could not load author profile.', type: 'error' });
    }
    setLoading(false);
  }, [authorId, addToast]);

  useEffect(() => {
    fetchAuthorData();
  }, [fetchAuthorData]);

  const handleFollowToggle = () => {
      if (!user) {
          addToast({ message: 'Please log in to follow authors.', type: 'info' });
          navigate('/login');
          return;
      }
      if (isFollowing) {
          unfollowAuthor(authorId);
      } else {
          followAuthor(authorId);
      }
  }

  if (loading) {
    return <LoadingSpinner message="Loading author profile..." className="py-20" />;
  }

  if (!author) {
    return <div className="text-center py-10 text-xl text-primary-700 dark:text-primary-300">Author not found.</div>;
  }

  const profileImage = author.profilePictureUrl || DEFAULT_PROFILE_PICTURE;

  return (
    <div className="max-w-5xl mx-auto">
      <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-6 !text-primary-700 dark:!text-primary-300 hover:!text-accent-600 dark:hover:!text-accent-400" leftIcon={<ArrowUturnLeftIcon className="h-5 w-5"/>}>
            Back
      </Button>
      <header className="bg-white dark:bg-primary-800 p-8 rounded-lg shadow-md dark:shadow-primary-700/50 mb-10 text-center border border-secondary-200 dark:border-primary-700 flex flex-col items-center">
        <img 
            src={profileImage} 
            alt={author.username} 
            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover mb-5 border-2 border-secondary-300 dark:border-primary-600"
            onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)}
        />
        <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-1.5">{author.username}</h1>
        <p className="text-primary-700 dark:text-primary-300 mb-3">{author.email}</p>
        {author.bio && (
          <p className="text-primary-700 dark:text-primary-300 max-w-xl mx-auto italic text-sm mb-4">{author.bio}</p>
        )}
        
        {!isOwnProfile && (
             <Button onClick={handleFollowToggle} variant={isFollowing ? 'secondary' : 'primary'} size="md">
                {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
        )}
      </header>

      <section>
        <h2 className="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-6 text-center md:text-left">
          Posts by {author.username} ({posts.length})
        </h2>
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-primary-700 dark:text-primary-300 text-center py-10 text-lg">This author has not published any posts yet.</p>
        )}
      </section>
    </div>
  );
};

export default AuthorProfile;
