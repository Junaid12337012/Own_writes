

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BlogPost } from '../../types';
import { mockApiService } from '../../services/mockApiService';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import { useNotification } from '../../contexts/NotificationContext';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';


const AdminBlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { user } = useAuth(); 


  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPosts = await mockApiService.getBlogs(); 
      setPosts(fetchedPosts);
    } catch (error) {
      addToast({ message: 'Failed to load blog posts.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!user) {
        addToast({ message: 'Authentication error.', type: 'error'});
        return;
    }
    if (window.confirm(`Are you sure you want to delete the post "${postTitle}"? This action cannot be undone.`)) {
      try {
        await mockApiService.deleteBlog(postId, user.id); 
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
        addToast({ message: `Post "${postTitle}" deleted successfully.`, type: 'success' });
      } catch (error) {
        addToast({ message: `Failed to delete post "${postTitle}".`, type: 'error' });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading all blog posts..." />;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-primary-900 dark:text-primary-100">Blog Post Management</h3>
      {posts.length === 0 ? <p className="text-primary-700 dark:text-primary-300">No blog posts found in the system.</p> : (
        <div className="overflow-x-auto bg-white dark:bg-primary-800 shadow-sm rounded-lg border border-secondary-200 dark:border-primary-700">
          <table className="min-w-full divide-y divide-secondary-200 dark:divide-primary-700">
            <thead className="bg-secondary-100 dark:bg-primary-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider">Author</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-primary-800 divide-y divide-secondary-200 dark:divide-primary-700">
              {posts.map(post => (
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-800 dark:text-primary-200 max-w-xs truncate" title={post.title}>
                    <Link to={`/blog/${post.id}`} className="hover:text-accent-600 dark:hover:text-accent-400">{post.title}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700 dark:text-primary-300">
                    <Link to={`/author/${post.authorId}`} className="hover:text-accent-600 dark:hover:text-accent-400">{post.authorName}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' : 
                        post.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' 
                      }`}>
                        {post.status}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                     <Button variant="ghost" size="sm" onClick={() => navigate(`/blog/${post.id}`)} title="View Post" className="p-1.5">
                        <EyeIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 hover:text-accent-500 dark:hover:text-accent-400"/>
                     </Button>
                     <Button variant="ghost" size="sm" onClick={() => navigate(`/blog/edit/${post.id}`)} title="Edit Post" className="p-1.5">
                        <PencilIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 hover:text-yellow-500 dark:hover:text-yellow-400"/>
                     </Button>
                     <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id, post.title)} title="Delete Post" className="p-1.5">
                        <TrashIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 hover:text-red-500 dark:hover:text-red-400"/>
                     </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBlogManagement;
