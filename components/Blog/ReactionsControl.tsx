
import React, { useState, useMemo } from 'react';
import { BlogPost, ReactionType, ReactionTypes } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { mockApiService } from '../../services/mockApiService';
import { HeartIcon } from '@heroicons/react/24/outline'; // Fallback icon

interface ReactionsControlProps {
  post: BlogPost;
  setPost: React.Dispatch<React.SetStateAction<BlogPost | null>>;
}

const ReactionsControl: React.FC<ReactionsControlProps> = ({ post, setPost }) => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState<ReactionType | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const userReaction = useMemo(() => {
    if (!user) return null;
    for (const type in post.reactions) {
      if (post.reactions[type as ReactionType]?.includes(user.id)) {
        return type as ReactionType;
      }
    }
    return null;
  }, [post.reactions, user]);
  
  const totalReactionCount = useMemo(() => {
      return Object.values(post.reactions).reduce((acc, userIds) => acc + (userIds?.length || 0), 0);
  }, [post.reactions]);

  const handleReaction = async (type: ReactionType) => {
    if (!user) {
      addToast({ message: 'You must be logged in to react.', type: 'warning' });
      return;
    }
    
    setIsSubmitting(type);
    
    try {
      let updatedPost;
      if (userReaction === type) {
        // User is clicking the same reaction again, so we remove it
        updatedPost = await mockApiService.removeReaction(post.id, user.id);
      } else {
        // User is adding a new reaction or changing their reaction
        updatedPost = await mockApiService.addReaction(post.id, user.id, type);
      }
      setPost(updatedPost);
    } catch (error) {
      addToast({ message: 'Failed to update reaction.', type: 'error' });
    } finally {
      setIsSubmitting(null);
      setShowPicker(false);
    }
  };

  const ReactionButton: React.FC<{ type: ReactionType, emoji: string }> = ({ type, emoji }) => (
    <button
      onClick={() => handleReaction(type)}
      disabled={!!isSubmitting}
      className={`p-1.5 rounded-full transition-transform transform hover:scale-125 focus:outline-none ${userReaction === type ? 'bg-accent-200 dark:bg-accent-700' : 'hover:bg-secondary-200 dark:hover:bg-primary-600'}`}
      title={type.charAt(0).toUpperCase() + type.slice(1)}
    >
      <span className="text-xl">{emoji}</span>
    </button>
  );

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setShowPicker(false)}
        onClick={() => userReaction ? handleReaction(userReaction) : setShowPicker(!showPicker)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 hover:border-accent-400 dark:hover:border-accent-400 transition-colors"
      >
        <span className="text-lg">{userReaction ? ReactionTypes[userReaction] : <HeartIcon className="h-5 w-5 text-primary-600 dark:text-primary-300"/>}</span>
        <span className="text-sm font-medium text-primary-700 dark:text-primary-200">{totalReactionCount}</span>
      </button>

      {showPicker && (
        <div 
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
          className="absolute bottom-full mb-2 left-0 bg-white dark:bg-primary-700 border border-secondary-200 dark:border-primary-600 rounded-full shadow-lg p-1.5 flex items-center space-x-1.5 z-20"
        >
          {Object.entries(ReactionTypes).map(([type, emoji]) => (
            <ReactionButton key={type} type={type as ReactionType} emoji={emoji} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReactionsControl;
