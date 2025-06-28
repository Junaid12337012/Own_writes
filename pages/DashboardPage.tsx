
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BlogPost, User, Bookmark, UserRole } from '../types';
import { mockApiService } from '../services/mockApiService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';
import { 
    PencilIcon, TrashIcon, EyeIcon, BookmarkIcon as BookmarkOutlineIcon, DocumentPlusIcon, 
    CogIcon, SparklesIcon, ChartBarIcon, NewspaperIcon, RssIcon, UserGroupIcon
} from '@heroicons/react/24/outline';
import { useNotification } from '../contexts/NotificationContext';
import { DEFAULT_PROFILE_PICTURE, DEFAULT_FEATURED_IMAGE } from '../constants';
import BlogPostIdeaGenerator from '../components/Common/BlogPostIdeaGenerator'; 
import BlogPostCard from '../components/Blog/BlogPostCard';

type DashboardTab = 'posts' | 'bookmarks' | 'feed';

interface DashboardPostCardProps {
    post: BlogPost;
    onDelete: (postId: string) => void;
}

const DashboardPostCard: React.FC<DashboardPostCardProps> = ({ post, onDelete }) => {
    const navigate = useNavigate();
    const totalReactions = Object.values(post.reactions).flat().length;

    return (
        <div className="bg-white dark:bg-primary-800 rounded-xl shadow-lg border border-secondary-200 dark:border-primary-700 flex flex-col transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary-700/50">
            <div className="relative">
                <img src={post.featuredImage || DEFAULT_FEATURED_IMAGE} alt={post.title} className="w-full h-40 object-cover rounded-t-xl" onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)} />
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900' }`}>
                        {post.status}
                    </span>
                    {post.isPremium && <span className="flex items-center text-xs text-yellow-900 bg-yellow-400 px-2.5 py-1 rounded-full"><SparklesIcon className="h-4 w-4 mr-1"/>Premium</span>}
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <Link to={`/blog/${post.id}`} className="flex-grow">
                    <h3 className="text-lg font-bold text-primary-800 dark:text-primary-100 hover:text-accent-600 dark:hover:text-accent-400 line-clamp-2">{post.title}</h3>
                </Link>
                <div className="text-xs text-primary-600 dark:text-primary-400 mt-2 flex items-center justify-between">
                    <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>Reactions: {totalReactions}</span>
                </div>
            </div>
            <div className="mt-auto p-4 pt-3 border-t border-secondary-200 dark:border-primary-700 flex items-center justify-end space-x-1">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/posts/${post.id}/analytics`)} title="View Analytics" className="!p-2"><ChartBarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 hover:text-accent-500"/></Button>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/blog/edit/${post.id}`)} title="Edit Post" className="!p-2"><PencilIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 hover:text-yellow-500"/></Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(post.id)} title="Delete Post" className="!p-2"><TrashIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 hover:text-red-500"/></Button>
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
  const { user, updateUserContext } = useAuth();
  const [myPosts, setMyPosts] = useState<BlogPost[]>([]);
  const [bookmarks, setBookmarks] = useState<Array<BlogPost & { bookmarkedAt: string }>>([]);
  const [feedPosts, setFeedPosts] = useState<BlogPost[]>([]);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('posts');

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ username: '', bio: '', profilePictureUrl: '' });
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useNotification();

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        bio: user.bio || '',
        profilePictureUrl: user.profilePictureUrl || ''
      });
    }
  }, [user]);

  const fetchMyPosts = useCallback(async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      const posts = (await mockApiService.getBlogsByAuthor(user.id))
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMyPosts(posts);
    } catch (error) {
      addToast({ message: 'Failed to load your posts.', type: 'error' });
    }
    setLoadingPosts(false);
  }, [user, addToast]);

  const fetchMyBookmarks = useCallback(async () => {
    if (!user) return;
    setLoadingBookmarks(true);
    try {
        const bookmarkRecords = await mockApiService.getBookmarks(user.id);
        const bookmarkedPostsPromises = bookmarkRecords.map(async (bm: Bookmark) => {
            const post = await mockApiService.getBlogById(bm.blogPostId);
            return post ? { ...post, bookmarkedAt: bm.addedAt } : null;
        });
        const bookmarkedPostsWithData = (await Promise.all(bookmarkedPostsPromises)).filter(p => p !== null) as Array<BlogPost & { bookmarkedAt: string }>;
        setBookmarks(bookmarkedPostsWithData.sort((a,b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime() ));

    } catch (error) {
        addToast({ message: 'Failed to load your bookmarks.', type: 'error' });
    }
    setLoadingBookmarks(false);
  }, [user, addToast]);
  
  const fetchMyFeed = useCallback(async () => {
    if (!user) return;
    setLoadingFeed(true);
    try {
        const posts = await mockApiService.getFeedForUser(user.id);
        setFeedPosts(posts);
    } catch (error) {
        addToast({ message: 'Failed to load your feed.', type: 'error'});
    }
    setLoadingFeed(false);
  }, [user, addToast]);


  useEffect(() => {
    if (activeTab === 'posts') fetchMyPosts();
    if (activeTab === 'bookmarks') fetchMyBookmarks();
    if (activeTab === 'feed') fetchMyFeed();
  }, [activeTab, fetchMyPosts, fetchMyBookmarks, fetchMyFeed]);

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await mockApiService.deleteBlog(postId, user.id);
        addToast({ message: 'Post deleted successfully.', type: 'success' });
        fetchMyPosts(); 
      } catch (error) {
        addToast({ message: 'Failed to delete post.', type: 'error' });
      }
    }
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsUploading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const randomImageId = Math.floor(Math.random() * 1000);
            const newProfilePicUrl = `https://picsum.photos/seed/${randomImageId}/200/200`;
            setProfileData(prev => ({ ...prev, profilePictureUrl: newProfilePicUrl }));
            addToast({ message: 'Profile picture updated (mock).', type: 'success' });
        } catch (error) {
            addToast({ message: 'Failed to upload profile picture.', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const updatedUser = await mockApiService.updateUser(user.id, profileData);
      updateUserContext(updatedUser); 
      addToast({ message: 'Profile updated successfully.', type: 'success' });
      setEditingProfile(false);
    } catch (error) {
      addToast({ message: 'Failed to update profile.', type: 'error' });
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }
  
  const TabButton = ({ tab, label, icon: Icon }: {tab: DashboardTab, label: string, icon: React.FC<any>}) => (
       <button
        onClick={() => setActiveTab(tab)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab 
            ? 'bg-accent-500 text-white shadow' 
            : 'text-primary-700 dark:text-primary-300 hover:bg-secondary-200 dark:hover:bg-primary-700'
        }`}
        >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </button>
  );

  return (
    <div className="space-y-10">
      <header className="bg-white dark:bg-primary-800 shadow-lg p-6 sm:p-8 rounded-xl border border-secondary-200 dark:border-primary-700">
        <div className="flex flex-col sm:flex-row items-start sm:space-x-6">
            <div className="relative mb-4 sm:mb-0">
                <img 
                    src={profileData.profilePictureUrl || user.profilePictureUrl || DEFAULT_PROFILE_PICTURE} 
                    alt={user.username} 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-primary-700 shadow-md"
                    onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)}
                />
                 <button onClick={() => setEditingProfile(true)} className="absolute bottom-0 right-0 p-1.5 bg-accent-500 hover:bg-accent-600 rounded-full text-white shadow-md border-2 border-white dark:border-primary-800" title="Edit Profile">
                    <CogIcon className="h-5 w-5"/>
                </button>
            </div>
            <div className="flex-grow">
                <h1 className="text-3xl font-bold text-primary-800 dark:text-primary-100">Welcome, {user.username}!</h1>
                <p className="text-primary-600 dark:text-primary-300 mt-1">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase rounded-full text-accent-600 bg-accent-200 dark:text-accent-100 dark:bg-accent-700">
                        Role: {user.role}
                    </span>
                    <span className={`text-xs font-semibold inline-block py-1 px-2.5 uppercase rounded-full ${user.isSubscribed ? 'text-yellow-800 bg-yellow-200 dark:text-yellow-900 dark:bg-yellow-500' : 'text-primary-700 bg-secondary-200 dark:text-primary-100 dark:bg-primary-600'}`}>
                        {user.isSubscribed ? 'Premium' : 'Free Plan'}
                    </span>
                </div>
                {user.bio && <p className="text-sm text-primary-600 dark:text-primary-400 mt-3 italic max-w-lg">{user.bio}</p>}
                {!user.isSubscribed && (
                     <Button onClick={() => navigate('/pricing')} variant="secondary" size="sm" className="!bg-yellow-400 hover:!bg-yellow-500 !text-yellow-900 !border-yellow-500 dark:!bg-yellow-500 dark:hover:!bg-yellow-400 dark:!text-yellow-900 mt-4">
                        Upgrade to Premium ✨
                    </Button>
                )}
            </div>
        </div>
      </header>

      {editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 dark:bg-opacity-80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-xl w-full max-w-lg border border-secondary-300 dark:border-primary-600">
                <h2 className="text-2xl font-semibold mb-4 text-primary-800 dark:text-primary-100">Edit Profile</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-primary-600 dark:text-primary-300">Username</label>
                        <input type="text" name="username" id="username" value={profileData.username} onChange={handleProfileInputChange} className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-primary-600 dark:text-primary-300">Bio</label>
                        <textarea name="bio" id="bio" value={profileData.bio} onChange={handleProfileInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm placeholder-primary-500 dark:placeholder-primary-400"/>
                    </div>
                    <div>
                        <label htmlFor="profilePictureUrl" className="block text-sm font-medium text-primary-600 dark:text-primary-300">Profile Picture URL (or Upload)</label>
                        <input type="text" name="profilePictureUrl" id="profilePictureUrl" value={profileData.profilePictureUrl} onChange={handleProfileInputChange} placeholder="Enter image URL" className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm placeholder-primary-500 dark:placeholder-primary-400"/>
                        <label htmlFor="profilePictureFile" className="mt-2 block text-sm font-medium text-primary-600 dark:text-primary-300">Upload New Picture:</label>
                        <input type="file" name="profilePictureFile" id="profilePictureFile" accept="image/*" onChange={handleProfilePictureChange} className="mt-1 block w-full text-sm text-primary-600 dark:text-primary-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-100 dark:file:bg-accent-700 file:text-accent-600 dark:file:text-accent-100 hover:file:bg-accent-200 dark:hover:file:bg-accent-600 rounded-lg"/>
                        {isUploading && <LoadingSpinner size="sm" message="Uploading..." />}
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isUploading}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <section>
        <BlogPostIdeaGenerator />
      </section>

      <section>
          <div className="border-b border-secondary-200 dark:border-primary-700 mb-5">
              <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                  <TabButton tab="posts" label="My Posts" icon={NewspaperIcon} />
                  <TabButton tab="bookmarks" label="My Bookmarks" icon={BookmarkOutlineIcon} />
                  <TabButton tab="feed" label="My Feed" icon={RssIcon} />
              </nav>
          </div>
          
          <div className="mt-5">
              {activeTab === 'posts' && (
                   <div className="space-y-5">
                       <div className="flex justify-between items-center">
                          <h2 className="text-2xl font-semibold text-primary-800 dark:text-primary-100">My Blog Posts</h2>
                          {user.role !== UserRole.USER && (
                            <Button onClick={() => navigate('/blog/create')} leftIcon={<DocumentPlusIcon className="h-5 w-5"/>}>
                              Create New Post
                            </Button>
                          )}
                        </div>
                       {loadingPosts ? <LoadingSpinner message="Loading your posts..." /> : (
                          myPosts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {myPosts.map((post) => (
                                <DashboardPostCard key={post.id} post={post} onDelete={handleDeletePost} />
                              ))}
                            </div>
                          ) : <p className="text-primary-600 dark:text-primary-300 text-center py-6 bg-white dark:bg-primary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-primary-700">You haven't created any posts yet.</p>
                        )}
                   </div>
              )}
               {activeTab === 'bookmarks' && (
                    <div className="space-y-5">
                         <h2 className="text-2xl font-semibold text-primary-800 dark:text-primary-100">My Bookmarks</h2>
                         {loadingBookmarks ? <LoadingSpinner message="Loading bookmarks..." /> : (
                          bookmarks.length > 0 ? (
                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {bookmarks.map((post) => (
                                    <div key={post.id} className="bg-white dark:bg-primary-800 rounded-lg shadow-sm p-4 hover:shadow-md dark:hover:shadow-primary-700/50 transition-shadow border border-secondary-200 dark:border-primary-700 flex flex-col card-lift-hover">
                                        <Link to={`/blog/${post.id}`} className="flex-grow">
                                            <img src={post.featuredImage || DEFAULT_FEATURED_IMAGE} alt={post.title} className="w-full h-32 object-cover rounded-md mb-3" onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)} />
                                            <h3 className="font-semibold text-accent-500 dark:text-accent-400 hover:underline line-clamp-2 flex items-start">
                                              {post.isPremium && <SparklesIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-1.5 flex-shrink-0 mt-0.5" title="Premium Post"/>}
                                              <span className="flex-1">{post.title}</span>
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">By {post.authorName}</p>
                                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">Bookmarked on: {new Date(post.bookmarkedAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                             </div>
                          ) : <p className="text-primary-600 dark:text-primary-300 text-center py-6 bg-white dark:bg-primary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-primary-700">You haven't bookmarked any posts yet.</p>
                        )}
                    </div>
              )}
               {activeTab === 'feed' && (
                  <div className="space-y-5">
                      <h2 className="text-2xl font-semibold text-primary-800 dark:text-primary-100">My Feed</h2>
                       {loadingFeed ? <LoadingSpinner message="Loading your feed..." /> : (
                          feedPosts.length > 0 ? (
                            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {feedPosts.map(post => <BlogPostCard key={post.id} post={post} />)}
                            </div>
                           ) : (
                                <div className="text-center py-10 bg-white dark:bg-primary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-primary-700">
                                    <UserGroupIcon className="h-12 w-12 mx-auto text-primary-400 dark:text-primary-500 mb-4" />
                                    <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-100">Your feed is empty.</h3>
                                    <p className="text-primary-600 dark:text-primary-300 mt-1">Follow authors to see their latest posts here.</p>
                                    <Button onClick={() => navigate('/blogs')} className="mt-4">Explore Blogs & Authors</Button>
                                </div>
                           )
                       )}
                  </div>
              )}
          </div>
      </section>
    </div>
  );
};

export default DashboardPage;