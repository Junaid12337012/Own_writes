

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Comment, User } from '../../types';
import { mockApiService } from '../../services/mockApiService';
import Button from '../Common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { UserCircleIcon, PaperAirplaneIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DEFAULT_PROFILE_PICTURE } from '../../constants';
import { geminiService } from '../../services/geminiService';

interface CommentSectionProps {
  blogPostId: string;
}

const CommentItem: React.FC<{ comment: Comment; onReply: (parentId: string) => void; currentUser: User | null }> = ({ comment, onReply, currentUser }) => {
  const { addToast } = useNotification();
  const [showReplies, setShowReplies] = useState(false);
  
  const handleReportComment = async () => {
    if (!currentUser) {
      addToast({ message: "You need to be logged in to report comments.", type: "warning" });
      return;
    }
    try {
      await mockApiService.reportComment(comment.id, currentUser.id);
      addToast({ message: "Comment reported for review.", type: "success" });
    } catch (error) {
      addToast({ message: "Failed to report comment.", type: "error" });
    }
  };

  return (
    <div className={`py-4 ${comment.parentId ? 'ml-6 sm:ml-8 pl-3 border-l-2 border-secondary-200 dark:border-primary-700' : ''}`}>
      <div className="flex items-start space-x-3 sm:space-x-3.5">
        <img 
            src={comment.userProfilePictureUrl || DEFAULT_PROFILE_PICTURE} 
            alt={comment.userName} 
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shadow-sm"
            onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary-700 dark:text-primary-200">{comment.userName}</p>
            <span className="text-xs text-primary-600 dark:text-primary-400">{new Date(comment.createdAt).toLocaleString()}</span>
          </div>
          <div className="text-primary-600 dark:text-primary-300 mt-1 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: comment.content }}></div>
          <div className="mt-2 space-x-3 text-xs">
            {currentUser && <button onClick={() => onReply(comment.id)} className="font-medium text-accent-500 dark:text-accent-400 hover:text-accent-600 dark:hover:text-accent-300 hover:underline">Reply</button>}
            {comment.replies && comment.replies.length > 0 && (
              <button onClick={() => setShowReplies(!showReplies)} className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
              </button>
            )}
             <button onClick={handleReportComment} className="font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Report</button>
          </div>
        </div>
      </div>
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2.5">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  );
};


const CommentSection: React.FC<CommentSectionProps> = ({ blogPostId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { addToast } = useNotification();
  
  const [commentSummary, setCommentSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);


  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedComments = await mockApiService.getComments(blogPostId);
      const commentsWithReplies = fetchedComments.filter(c => !c.parentId).map(parent => ({
        ...parent,
        replies: fetchedComments.filter(reply => reply.parentId === parent.id).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) 
      })).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); 
      setComments(commentsWithReplies);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      addToast({ message: 'Could not load comments.', type: 'error' });
    }
    setLoading(false);
  }, [blogPostId, addToast]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast({ message: 'You must be logged in to comment.', type: 'warning' });
      return;
    }
    if (!newComment.trim()) {
      addToast({ message: 'Comment cannot be empty.', type: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      await mockApiService.addComment({
        blogPostId,
        userId: user.id,
        content: newComment, 
        parentId: replyTo,
      });
      setNewComment('');
      setReplyTo(null); 
      addToast({ message: 'Comment posted!', type: 'success' });
      fetchComments(); 
    } catch (error) {
      addToast({ message: 'Failed to post comment.', type: 'error' });
    }
    setSubmitting(false);
  };

  const handleReply = (parentId: string) => {
    setReplyTo(parentId);
    const textarea = document.getElementById('comment-textarea');
    if (textarea) textarea.focus();
  };
  
  const handleSummarizeComments = async () => {
    if (comments.length === 0) {
      addToast({ message: "No comments to summarize.", type: 'info'});
      return;
    }
    setLoadingSummary(true);
    setCommentSummary(null);
    try {
      const summaryText = await geminiService.summarizeComments(comments);
      setCommentSummary(summaryText);
      setShowSummary(true);
    } catch (error: any) {
      addToast({ message: `Failed to get summary: ${error.message || 'An error occurred.'}`, type: 'error'});
    } finally {
      setLoadingSummary(false);
    }
  };

  const totalCommentsCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="mt-12 bg-white dark:bg-primary-800 p-0 sm:p-2 rounded-lg"> 
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
        <h3 className="text-2xl lg:text-3xl font-heading font-semibold text-primary-800 dark:text-primary-100">Comments ({totalCommentsCount})</h3>
        {totalCommentsCount > 3 && (
            <Button
                onClick={handleSummarizeComments}
                isLoading={loadingSummary}
                disabled={loadingSummary}
                variant="ghost"
                size="sm"
                leftIcon={<SparklesIcon className="h-5 w-5"/>}
                className="!text-accent-600 dark:!text-accent-400 hover:!bg-accent-100 dark:hover:!bg-primary-700 self-start sm:self-center"
            >
                {loadingSummary ? 'Analyzing...' : 'Summarize Comments'}
            </Button>
        )}
      </div>

      {showSummary && commentSummary && (
        <div className="mb-8 p-4 bg-accent-50 dark:bg-primary-700 border-l-4 border-accent-400 dark:border-accent-500 rounded-r-lg relative">
          <button onClick={() => setShowSummary(false)} className="absolute top-2 right-2 p-1 text-primary-500 dark:text-primary-400 hover:bg-black/10 dark:hover:bg-white/10 rounded-full" aria-label="Close summary">
            <XMarkIcon className="h-5 w-5" />
          </button>
          <h4 className="font-semibold text-primary-700 dark:text-primary-100 flex items-center mb-2">
            <SparklesIcon className="h-5 w-5 mr-2 text-accent-500" />
            AI Summary of Comments
          </h4>
          <div 
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: '<ul>' + commentSummary.replace(/^\* (.*)/gm, '<li>$1</li>') + '</ul>' }}
          />
        </div>
      )}
      
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start space-x-3 sm:space-x-3.5">
            <img 
                src={user.profilePictureUrl || DEFAULT_PROFILE_PICTURE} 
                alt={user.username} 
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shadow-sm"
                onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)}
            />
            <div className="flex-1">
              <textarea
                id="comment-textarea"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? `Replying to a comment...` : "Share your thoughts..."}
                rows={3}
                className="w-full p-3 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-800 dark:text-primary-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 transition-colors placeholder-primary-500 dark:placeholder-primary-400 text-sm"
                disabled={submitting}
                aria-label="Comment input"
              />
              {replyTo && (
                 <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mt-1.5">Cancel Reply</button>
              )}
            </div>
          </div>
          <div className="text-right mt-3">
            <Button type="submit" isLoading={submitting} disabled={submitting} leftIcon={<PaperAirplaneIcon className="h-5 w-5"/>}>
              Post Comment
            </Button>
          </div>
        </form>
      )}
      {!user && <p className="text-primary-600 dark:text-primary-400 mb-8">Please <Link to="/login" className="text-accent-500 dark:text-accent-400 hover:underline">log in</Link> to post a comment.</p>}

      {loading && comments.length === 0 && <p className="text-primary-600 dark:text-primary-400 py-5 text-center">Loading comments...</p>}
      {!loading && comments.length === 0 && <p className="text-primary-600 dark:text-primary-400 py-5 text-center">No comments yet. Be the first to share your thoughts!</p>}
      
      <div className="space-y-3 divide-y divide-secondary-200 dark:divide-primary-700">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} onReply={handleReply} currentUser={user} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;