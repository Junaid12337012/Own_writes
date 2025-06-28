

import { User, UserRole, BlogPost, Comment, Bookmark, TotalStats, TopPostStat, Reaction, ReactionType, Notification, PostAnalyticsData } from '../types';
import { MOCK_API_DELAY, DEFAULT_PROFILE_PICTURE, DEFAULT_FEATURED_IMAGE } from '../constants';
import { delay, generateId, createExcerpt } from '../utils/helpers';

// --- In-memory database ---
let users: User[] = [];
let blogPosts: BlogPost[] = [];
let comments: Comment[] = [];
let bookmarks: Bookmark[] = [];
let reactions: Reaction[] = [];
let notifications: Notification[] = [];
let sessions: { [userId: string]: User } = {}; // Simple session mock
let managedCategories: string[] = [];

// --- Helper to initialize mock data ---
const initializeMockData = () => {
  users = [
    { id: 'user1', email: 'admin@example.com', username: 'AdminUser', role: UserRole.ADMIN, bio: 'I run this place!', profilePictureUrl: 'https://picsum.photos/seed/admin/200', isSubscribed: true, following: ['user2'] },
    { id: 'user2', email: 'editor@example.com', username: 'EditorAlice', role: UserRole.EDITOR, bio: 'Curating the best content.', profilePictureUrl: 'https://picsum.photos/seed/alice/200', isSubscribed: true, following: [] },
    { id: 'user3', email: 'user@example.com', username: 'UserBob', role: UserRole.USER, bio: 'Just a regular user enjoying blogs.', profilePictureUrl: 'https://picsum.photos/seed/bob/200', isSubscribed: false, following: ['user1', 'user2'] },
    { id: 'user4', email: 'googleuser@example.com', username: 'GoogleUserCharlie', role: UserRole.USER, bio: 'Signed in with Google!', profilePictureUrl: 'https://picsum.photos/seed/charlie/200', isSubscribed: false, following: [] },
  ];

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);


  blogPosts = [
    { 
      id: 'post1', title: 'Getting Started with AI', 
      content: '<p>Artificial Intelligence is rapidly changing the world. This post explores the basics of AI and its potential applications.</p><h2>Key Concepts</h2><ul><li>Machine Learning</li><li>Deep Learning</li><li>Natural Language Processing</li></ul><p>Future is exciting!</p><h3>The Impact on Industries</h3><p>From healthcare to finance, AI is making waves. Automated diagnostics, fraud detection, and personalized customer service are just a few examples of how AI is transforming various sectors.</p><h4>Ethical Considerations</h4><p>With great power comes great responsibility. It is crucial to address the ethical implications of AI, including bias in algorithms, job displacement, and the potential for misuse. Open discussions and robust regulations are necessary to ensure AI develops in a way that benefits all of humanity.</p>', 
      excerpt: 'Artificial Intelligence is rapidly changing the world. This post explores the basics...',
      metaDescription: 'Discover the fundamentals of Artificial Intelligence, including Machine Learning and Deep Learning, and explore its transformative impact on various industries.',
      tags: ['AI', 'Technology', 'Future'], 
      authorId: 'user1', authorName: 'AdminUser', 
      createdAt: twoDaysAgo.toISOString(), updatedAt: twoDaysAgo.toISOString(), publishedAt: twoDaysAgo.toISOString(), 
      status: 'published', postType: 'article', reactions: { like: ['user2', 'user3'], celebrate: ['user4'] }, isPremium: true,
      featuredImage: 'https://picsum.photos/seed/ai_post/800/400'
    },
    { 
      id: 'post2', title: 'The Art of Blogging', 
      content: '<p>Blogging is a great way to share your thoughts and connect with others. Here are some tips for successful blogging.</p><p>Consistency is key. Find your niche. Engage with your readers.</p>', 
      excerpt: 'Blogging is a great way to share your thoughts and connect with others...',
      metaDescription: 'Learn the art of successful blogging with key tips on consistency, finding your niche, and engaging with your readers to build a thriving community.',
      tags: ['Blogging', 'Writing', 'Community'], 
      authorId: 'user2', authorName: 'EditorAlice', 
      createdAt: yesterday.toISOString(), updatedAt: yesterday.toISOString(), publishedAt: yesterday.toISOString(), 
      status: 'published', postType: 'blog', reactions: { insightful: ['user1'], love: ['user3', 'user4'] }, isPremium: false,
      featuredImage: 'https://picsum.photos/seed/blogging_post/800/400'
    },
    { 
      id: 'post3', title: 'My Thoughts on Web Development', 
      content: '<p>Web development is an ever-evolving field. I love working with React and TypeScript!</p>', 
      excerpt: 'Web development is an ever-evolving field. I love working with React and TypeScript!',
      tags: ['WebDev', 'React', 'TypeScript'], 
      authorId: 'user3', authorName: 'UserBob', 
      createdAt: now.toISOString(), updatedAt: now.toISOString(), 
      status: 'draft', postType: 'blog', reactions: { like: ['user1'] }, isPremium: false,
      featuredImage: 'https://picsum.photos/seed/webdev_post/800/400'
    },
     { 
      id: 'post4', title: 'Scheduled Adventures', 
      content: '<p>This post is scheduled to be published soon! Get ready for an adventure.</p>', 
      excerpt: 'This post is scheduled to be published soon!',
      tags: ['Travel', 'Adventure', 'Scheduled', 'AI'], 
      authorId: 'user2', authorName: 'EditorAlice', 
      createdAt: now.toISOString(), updatedAt: now.toISOString(), 
      status: 'scheduled', postType: 'blog', reactions: {}, scheduledPublishTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Scheduled for tomorrow
      featuredImage: 'https://picsum.photos/seed/scheduled_post/800/400',
      isPremium: true
    },
  ];
  
  // Populate reactions data from blogPosts
  blogPosts.forEach(post => {
      for (const [type, userIds] of Object.entries(post.reactions)) {
          userIds.forEach(userId => {
              reactions.push({ userId, postId: post.id, type: type as ReactionType });
          });
      }
  });


  comments = [
    { id: 'comment1', blogPostId: 'post1', userId: 'user2', userName: 'EditorAlice', content: 'Great overview of AI!', createdAt: yesterday.toISOString(), userProfilePictureUrl: users[1].profilePictureUrl },
    { id: 'comment2', blogPostId: 'post1', userId: 'user3', userName: 'UserBob', content: 'I learned a lot, thanks!', createdAt: now.toISOString(), parentId: 'comment1', userProfilePictureUrl: users[2].profilePictureUrl },
    { id: 'comment3', blogPostId: 'post2', userId: 'user1', userName: 'AdminUser', content: 'Excellent tips for bloggers.', createdAt: now.toISOString(), userProfilePictureUrl: users[0].profilePictureUrl, reported: true },
  ];

  bookmarks = [
    { userId: 'user3', blogPostId: 'post1', addedAt: now.toISOString() }
  ];

  // Initialize managedCategories from existing post tags initially for demo purposes
  const initialManagedTags = new Set<string>();
  initialManagedTags.add('AI');
  initialManagedTags.add('Technology');
  initialManagedTags.add('Blogging');
  initialManagedTags.add('Writing');
  // blogPosts.forEach(post => post.tags.forEach(tag => initialManagedTags.add(tag)));
  managedCategories = Array.from(initialManagedTags).sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  
  notifications = [
      {
          id: 'notif1',
          recipientId: 'user1',
          actor: { id: 'user3', username: 'UserBob', profilePictureUrl: users[2].profilePictureUrl },
          type: 'reaction',
          message: `UserBob reacted with ❤️ to your post "Getting Started with AI"`,
          link: `#/blog/post1`,
          read: false,
          createdAt: new Date().toISOString()
      },
       {
          id: 'notif2',
          recipientId: 'user2',
          actor: { id: 'user1', username: 'AdminUser', profilePictureUrl: users[0].profilePictureUrl },
          type: 'follow',
          message: `AdminUser started following you.`,
          link: `#/author/user1`,
          read: true,
          createdAt: twoDaysAgo.toISOString()
      },
  ];
};

initializeMockData(); // Initialize data on load

const stripHtmlForSearch = (html: string): string => {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  } catch(e) {
    console.error("Error stripping HTML for search:", e);
    // Fallback for environments where DOMParser might not be fully available or fails
    return html.replace(/<[^>]+>/g, ' '); 
  }
};

const createNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotif: Notification = {
        ...notification,
        id: generateId(),
        createdAt: new Date().toISOString(),
    };
    notifications.unshift(newNotif);
};


// --- API Service Implementation ---
export const mockApiService = {
  checkSession: async (): Promise<User | null> => {
    await delay(MOCK_API_DELAY / 2);
    const storedUserId = localStorage.getItem('mockSessionUserId');
    if (storedUserId && sessions[storedUserId]) {
      return sessions[storedUserId];
    }
    return null;
  },

  login: async (email: string, _password_DO_NOT_USE: string): Promise<User | null> => {
    await delay(MOCK_API_DELAY);
    const user = users.find(u => u.email === email);
    // In a real app, password would be hashed and checked on the server
    if (user) {
      sessions[user.id] = user;
      localStorage.setItem('mockSessionUserId', user.id);
      return user;
    }
    return null;
  },

  signup: async (username: string, email: string, _password_DO_NOT_USE: string, role: UserRole): Promise<User | null> => {
    await delay(MOCK_API_DELAY);
    if (users.find(u => u.email === email)) {
      return null; // Email already exists
    }
    const newUser: User = {
      id: generateId(),
      username,
      email,
      role,
      bio: '',
      profilePictureUrl: DEFAULT_PROFILE_PICTURE,
      isSubscribed: false,
      following: [],
    };
    users.push(newUser);
    sessions[newUser.id] = newUser;
    localStorage.setItem('mockSessionUserId', newUser.id);
    return newUser;
  },

  logout: async (): Promise<void> => {
    await delay(MOCK_API_DELAY / 2);
    const storedUserId = localStorage.getItem('mockSessionUserId');
    if (storedUserId) {
        delete sessions[storedUserId];
    }
    localStorage.removeItem('mockSessionUserId');
  },

  getBlogs: async (): Promise<BlogPost[]> => {
    await delay(MOCK_API_DELAY);
    return [...blogPosts];
  },

  getBlogById: async (id: string): Promise<BlogPost | null> => {
    await delay(MOCK_API_DELAY);
    const post = blogPosts.find(p => p.id === id);
    return post ? {...post} : null;
  },

  getBlogsByAuthor: async (authorId: string): Promise<BlogPost[]> => {
    await delay(MOCK_API_DELAY);
    return blogPosts.filter(p => p.authorId === authorId);
  },

  searchBlogsFullText: async (term: string): Promise<BlogPost[]> => {
    await delay(MOCK_API_DELAY / 2); // Faster search
    if (!term.trim()) return [];

    const lowerCaseTerm = term.toLowerCase();
    const results: BlogPost[] = [];

    for (const post of blogPosts) {
      if (post.status !== 'published') continue;

      let matchField: BlogPost['matchField'] = undefined;
      let matchSnippet: BlogPost['matchSnippet'] = undefined;

      // Check title
      if (post.title.toLowerCase().includes(lowerCaseTerm)) {
        matchField = 'title';
      }

      // Check content
      const plainContent = stripHtmlForSearch(post.content);
      const contentIndex = plainContent.toLowerCase().indexOf(lowerCaseTerm);
      if (contentIndex > -1) {
        if (!matchField) matchField = 'content';
        const start = Math.max(0, contentIndex - 60);
        const end = Math.min(plainContent.length, contentIndex + lowerCaseTerm.length + 60);
        const prefix = start > 0 ? "..." : "";
        const suffix = end < plainContent.length ? "..." : "";
        matchSnippet = prefix + plainContent.substring(start, end) + suffix;
      }
      
      // Check author
      if (post.authorName.toLowerCase().includes(lowerCaseTerm)) {
        if (!matchField) matchField = 'author';
      }

      // Check tags
      if (post.tags.some(tag => tag.toLowerCase().includes(lowerCaseTerm))) {
        if (!matchField) matchField = 'tag';
        if(!matchSnippet && matchField === 'tag') { // Provide tag context if no content snippet
            matchSnippet = `Tagged with: ${post.tags.find(tag => tag.toLowerCase().includes(lowerCaseTerm))}`;
        }
      }

      if (matchField) {
        results.push({
          ...post,
          matchField,
          matchSnippet: matchSnippet || createExcerpt(post.content, 100), // Fallback snippet
        });
      }
    }
    return results;
  },

  createBlog: async (postData: Partial<BlogPost>): Promise<BlogPost> => {
    await delay(MOCK_API_DELAY);
    const author = users.find(u => u.id === postData.authorId);
    if (!author) throw new Error("Author not found for creating blog post");
    if (postData.title === undefined) throw new Error("Title is required for creating blog post");
    if (postData.content === undefined) throw new Error("Content is required for creating blog post");
    if (postData.authorId === undefined) throw new Error("Author ID is required for creating blog post");

    const newPost: BlogPost = {
      id: generateId(),
      title: postData.title,
      content: postData.content,
      tags: Array.isArray(postData.tags) ? postData.tags : [],
      authorId: postData.authorId,
      authorName: author.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: postData.status || 'draft',
      postType: postData.postType || 'blog',
      reactions: {},
      featuredImage: postData.featuredImage || DEFAULT_FEATURED_IMAGE,
      excerpt: postData.excerpt || createExcerpt(postData.content, 150),
      metaDescription: postData.metaDescription || createExcerpt(postData.content, 160),
      publishedAt: postData.status === 'published' ? new Date().toISOString() : undefined,
      scheduledPublishTime: postData.scheduledPublishTime,
      isPremium: postData.isPremium || false,
    };
    blogPosts.unshift(newPost); // Add to the beginning
    // DO NOT automatically add tags to managedCategories. Admin controls this.
    return newPost;
  },

  updateBlog: async (id: string, updates: Partial<BlogPost>, userId: string): Promise<BlogPost> => {
    await delay(MOCK_API_DELAY);
    const postIndex = blogPosts.findIndex(p => p.id === id);
    if (postIndex === -1) throw new Error("Blog post not found");
    
    const post = blogPosts[postIndex];
    if (post.authorId !== userId && !users.find(u => u.id === userId && u.role === UserRole.ADMIN)) {
        throw new Error("User not authorized to update this post");
    }

    const updatedPost = { ...post, ...updates, updatedAt: new Date().toISOString() };
    if (updates.content && !updates.excerpt) {
        updatedPost.excerpt = createExcerpt(updates.content, 150);
    }
    if (updates.content && !updates.metaDescription) {
        updatedPost.metaDescription = createExcerpt(updates.content, 160);
    }
    if (updates.status === 'published' && !post.publishedAt) {
        updatedPost.publishedAt = new Date().toISOString();
    }
     if (updates.status !== 'scheduled') {
        updatedPost.scheduledPublishTime = undefined;
    }
    if (Array.isArray(updates.tags)) {
      updatedPost.tags = updates.tags;
      // DO NOT automatically add tags to managedCategories. Admin controls this.
    }

    blogPosts[postIndex] = updatedPost;
    return updatedPost;
  },

  deleteBlog: async (id: string, userId: string): Promise<void> => {
    await delay(MOCK_API_DELAY);
    const postIndex = blogPosts.findIndex(p => p.id === id);
    if (postIndex === -1) throw new Error("Blog post not found");

    const post = blogPosts[postIndex];
    if (post.authorId !== userId && !users.find(u => u.id === userId && u.role === UserRole.ADMIN)) {
        throw new Error("User not authorized to delete this post");
    }
    blogPosts.splice(postIndex, 1);
    comments = comments.filter(c => c.blogPostId !== id); // Also delete associated comments
    reactions = reactions.filter(r => r.postId !== id); // Also delete associated reactions
  },

  addReaction: async (postId: string, userId: string, type: ReactionType): Promise<BlogPost> => {
    await delay(MOCK_API_DELAY / 3);
    const post = blogPosts.find(p => p.id === postId);
    const actor = users.find(u => u.id === userId);
    if (!post || !actor) throw new Error("Post or user not found for reaction");

    // Remove any existing reaction by this user on this post
    Object.values(post.reactions).forEach(userIds => {
      const index = userIds.indexOf(userId);
      if (index > -1) userIds.splice(index, 1);
    });
    reactions = reactions.filter(r => !(r.postId === postId && r.userId === userId));

    // Add the new reaction
    if (!post.reactions[type]) {
      post.reactions[type] = [];
    }
    post.reactions[type]!.push(userId);
    reactions.push({ postId, userId, type });
    
    // Create notification if not reacting to own post
    if (post.authorId !== userId) {
        createNotification({
            recipientId: post.authorId,
            actor: { id: actor.id, username: actor.username, profilePictureUrl: actor.profilePictureUrl },
            type: 'reaction',
            message: `${actor.username} reacted to your post "${post.title}"`,
            link: `#/blog/${post.id}`,
            read: false,
        });
    }

    return { ...post };
  },
  
  removeReaction: async (postId: string, userId: string): Promise<BlogPost> => {
     await delay(MOCK_API_DELAY / 3);
    const post = blogPosts.find(p => p.id === postId);
    if (!post) throw new Error("Post not found for reaction removal");
    
    // Remove any existing reaction by this user on this post
    Object.values(post.reactions).forEach(userIds => {
      const index = userIds.indexOf(userId);
      if (index > -1) userIds.splice(index, 1);
    });
    reactions = reactions.filter(r => !(r.postId === postId && r.userId === userId));
    
    return { ...post };
  },

  getComments: async (blogPostId: string): Promise<Comment[]> => {
    await delay(MOCK_API_DELAY);
    return comments.filter(c => c.blogPostId === blogPostId && !c.reported); // Filter out reported comments for normal view
  },

  addComment: async (commentData: Partial<Comment>): Promise<Comment> => {
    await delay(MOCK_API_DELAY);
    const actor = users.find(u => u.id === commentData.userId);
    const post = blogPosts.find(p => p.id === commentData.blogPostId);
    if (!actor || !post) throw new Error("User or Post not found for adding comment");
    if (!commentData.content) throw new Error("Content is required for comment");


    const newComment: Comment = {
      id: generateId(),
      blogPostId: post.id,
      userId: actor.id,
      userName: actor.username,
      userProfilePictureUrl: actor.profilePictureUrl || DEFAULT_PROFILE_PICTURE,
      content: commentData.content,
      createdAt: new Date().toISOString(),
      parentId: commentData.parentId || null,
      reported: false,
    };
    comments.push(newComment);
    
    // Create notifications
    if (post.authorId !== actor.id) {
        createNotification({
            recipientId: post.authorId,
            actor,
            type: 'comment',
            message: `${actor.username} commented on your post "${post.title}"`,
            link: `#/blog/${post.id}`,
            read: false
        });
    }
    if (newComment.parentId) {
        const parentComment = comments.find(c => c.id === newComment.parentId);
        if (parentComment && parentComment.userId !== actor.id) {
             createNotification({
                recipientId: parentComment.userId,
                actor,
                type: 'reply',
                message: `${actor.username} replied to your comment on "${post.title}"`,
                link: `#/blog/${post.id}`,
                read: false
            });
        }
    }

    return newComment;
  },
  
  reportComment: async (commentId: string, _reporterUserId: string): Promise<void> => {
    await delay(MOCK_API_DELAY / 2);
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        comment.reported = true;
    } else {
        throw new Error("Comment not found for reporting");
    }
  },

  getReportedComments: async(): Promise<Comment[]> => {
    await delay(MOCK_API_DELAY);
    return comments.filter(c => c.reported);
  },

  approveComment: async(commentId: string): Promise<void> => {
    await delay(MOCK_API_DELAY / 2);
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        comment.reported = false;
    } else {
        throw new Error("Comment not found for approving");
    }
  },

  deleteCommentAsAdmin: async(commentId: string): Promise<void> => {
    await delay(MOCK_API_DELAY);
    comments = comments.filter(c => c.id !== commentId);
  },


  getUserById: async (id: string): Promise<User | null> => {
    await delay(MOCK_API_DELAY / 2);
    const user = users.find(u => u.id === id);
    return user ? {...user} : null;
  },
  
  getAllUsers: async (): Promise<User[]> => {
    await delay(MOCK_API_DELAY);
    return [...users];
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    await delay(MOCK_API_DELAY);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found for update");
    
    // Prevent role/subscription/following change through this general update endpoint for safety in mock
    const { role, isSubscribed, following, ...safeUpdates } = updates; 

    users[userIndex] = { ...users[userIndex], ...safeUpdates };
    
    // Update session if current user is being updated
    const currentSession = await mockApiService.checkSession();
    if(currentSession && currentSession.id === userId) {
        sessions[userId] = users[userIndex];
    }
    return { ...users[userIndex] };
  },
  
  followAuthor: async (followerId: string, authorToFollowId: string): Promise<User> => {
    await delay(MOCK_API_DELAY/2);
    const follower = users.find(u => u.id === followerId);
    const authorToFollow = users.find(u => u.id === authorToFollowId);
    if (!follower || !authorToFollow) throw new Error("User not found for follow action");

    if (!follower.following.includes(authorToFollowId)) {
        follower.following.push(authorToFollowId);
    }
    
    // Create notification
    createNotification({
        recipientId: authorToFollowId,
        actor: { id: follower.id, username: follower.username, profilePictureUrl: follower.profilePictureUrl },
        type: 'follow',
        message: `${follower.username} started following you.`,
        link: `#/author/${follower.id}`,
        read: false
    });
    
    // Update session
    sessions[followerId] = follower;
    return {...follower};
  },
  
  unfollowAuthor: async (followerId: string, authorToUnfollowId: string): Promise<User> => {
    await delay(MOCK_API_DELAY/2);
    const follower = users.find(u => u.id === followerId);
    if (!follower) throw new Error("User not found for unfollow action");

    follower.following = follower.following.filter(id => id !== authorToUnfollowId);
    
     // Update session
    sessions[followerId] = follower;
    return {...follower};
  },

  updateUserRole: async (userId: string, newRole: UserRole): Promise<User> => {
    await delay(MOCK_API_DELAY);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found for role update");
    
    // Basic check: don't let the last admin be demoted in mock
    const admins = users.filter(u => u.role === UserRole.ADMIN);
    if (users[userIndex].role === UserRole.ADMIN && admins.length === 1 && newRole !== UserRole.ADMIN) {
        throw new Error("Cannot demote the last admin user.");
    }

    users[userIndex].role = newRole;
     // Update session if current user is being updated
    const currentSession = await mockApiService.checkSession();
    if(currentSession && currentSession.id === userId) {
        sessions[userId] = users[userIndex];
    }
    return { ...users[userIndex] };
  },

  subscribeUser: async (userId: string): Promise<User> => {
    await delay(MOCK_API_DELAY);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found for subscription");
    
    users[userIndex].isSubscribed = true;

    // Also update session
    const currentSession = await mockApiService.checkSession();
    if(currentSession && currentSession.id === userId) {
        sessions[userId] = users[userIndex];
    }
    return { ...users[userIndex] };
  },

  deleteUser: async (userId: string, adminId?: string): Promise<void> => {
    await delay(MOCK_API_DELAY);
    if (!adminId) throw new Error("Admin authorization required."); // Assume admin check is done in component
    const admin = users.find(u => u.id === adminId);
    if (!admin || admin.role !== UserRole.ADMIN) throw new Error("Not authorized to delete users.");
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found for deletion");

    if (users[userIndex].role === UserRole.ADMIN) {
        const admins = users.filter(u => u.role === UserRole.ADMIN);
        if (admins.length <= 1) {
             throw new Error("Cannot delete the last admin user.");
        }
    }
    
    users.splice(userIndex, 1);
    blogPosts = blogPosts.filter(p => p.authorId !== userId);
    comments = comments.filter(c => c.userId !== userId);
    bookmarks = bookmarks.filter(b => b.userId !== userId);
    reactions = reactions.filter(r => r.userId !== userId);
    delete sessions[userId];
  },
  
  addBookmark: async (userId: string, blogPostId: string): Promise<Bookmark> => {
    await delay(MOCK_API_DELAY / 2);
    if (!users.find(u => u.id === userId) || !blogPosts.find(p => p.id === blogPostId)) {
        throw new Error("User or Post not found for bookmarking");
    }
    if (bookmarks.find(b => b.userId === userId && b.blogPostId === blogPostId)) {
        return bookmarks.find(b => b.userId === userId && b.blogPostId === blogPostId)!;
    }
    const newBookmark: Bookmark = { userId, blogPostId, addedAt: new Date().toISOString() };
    bookmarks.push(newBookmark);
    return newBookmark;
  },

  removeBookmark: async (userId: string, blogPostId: string): Promise<void> => {
    await delay(MOCK_API_DELAY / 2);
    bookmarks = bookmarks.filter(b => !(b.userId === userId && b.blogPostId === blogPostId));
  },

  isBookmarked: async (userId: string, blogPostId: string): Promise<boolean> => {
    await delay(MOCK_API_DELAY / 4);
    return !!bookmarks.find(b => b.userId === userId && b.blogPostId === blogPostId);
  },
  
  getBookmarks: async (userId: string): Promise<Bookmark[]> => {
    await delay(MOCK_API_DELAY);
    return bookmarks.filter(b => b.userId === userId);
  },
  
  getFeedForUser: async (userId: string): Promise<BlogPost[]> => {
    await delay(MOCK_API_DELAY);
    const user = users.find(u => u.id === userId);
    if (!user) return [];
    
    const followedAuthorIds = user.following;
    return blogPosts
      .filter(p => p.status === 'published' && followedAuthorIds.includes(p.authorId))
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getNotifications: async(userId: string): Promise<Notification[]> => {
    await delay(MOCK_API_DELAY / 2);
    return notifications.filter(n => n.recipientId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markAllNotificationsAsRead: async(userId: string): Promise<Notification[]> => {
    await delay(MOCK_API_DELAY / 3);
    notifications.forEach(n => {
        if(n.recipientId === userId) {
            n.read = true;
        }
    });
    return notifications.filter(n => n.recipientId === userId);
  },

  getAnalyticsTotalStats: async(): Promise<TotalStats> => {
    await delay(MOCK_API_DELAY);
    const totalReactions = Object.values(blogPosts.map(p => p.reactions)).flat().length;
    return {
        totalUsers: users.length,
        totalBlogs: blogPosts.length,
        totalComments: comments.filter(c => !c.reported).length, // Count non-reported comments
    };
  },

  getAnalyticsTopPosts: async(): Promise<TopPostStat[]> => {
    await delay(MOCK_API_DELAY);
    const publishedPosts = blogPosts.filter(p => p.status === 'published');
    const sortedByReactions = [...publishedPosts].sort((a, b) => Object.values(b.reactions).flat().length - Object.values(a.reactions).flat().length);
    return sortedByReactions.slice(0, 5).map(post => ({
        postId: post.id,
        title: post.title,
        viewsOrLikes: Object.values(post.reactions).flat().length,
    }));
  },

  getPostAnalytics: async(postId: string): Promise<PostAnalyticsData> => {
      await delay(MOCK_API_DELAY);
      const post = blogPosts.find(p => p.id === postId);
      if (!post) throw new Error("Post not found for analytics");

      const reactionCount = Object.values(post.reactions).flat().length;
      const commentCount = comments.filter(c => c.blogPostId === postId).length;

      return {
          postId: post.id,
          viewsOverTime: [
              { date: 'Day 1', views: Math.floor(Math.random() * 50) },
              { date: 'Day 2', views: Math.floor(Math.random() * 80) },
              { date: 'Day 3', views: Math.floor(Math.random() * 120) },
              { date: 'Day 4', views: Math.floor(Math.random() * 100) },
              { date: 'Day 5', views: Math.floor(Math.random() * 200) },
              { date: 'Day 6', views: Math.floor(Math.random() * 180) },
              { date: 'Day 7', views: Math.floor(Math.random() * 250) },
          ],
          trafficSources: [
              { source: 'Direct', value: 40 },
              { source: 'Google', value: 30 },
              { source: 'Social', value: 20 },
              { source: 'Referral', value: 10 },
          ],
          engagementScore: {
              score: Math.round((reactionCount * 1.5 + commentCount * 3 + 15) * 1.2), // Mocked score calc
              breakdown: {
                  reactions: reactionCount,
                  comments: commentCount,
                  shares: 15, // Mocked
              }
          }
      }
  },

  // Category Management
  getManagedCategories: async (): Promise<string[]> => {
    await delay(MOCK_API_DELAY / 3);
    return [...managedCategories].sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  },

  getManagedCategoriesWithCount: async (): Promise<Array<{ name: string; count: number }>> => {
    await delay(MOCK_API_DELAY / 2);
    const publishedBlogPosts = blogPosts.filter(p => p.status === 'published');
    const categoryCounts: { [key: string]: number } = {};

    managedCategories.forEach(mc => {
        categoryCounts[mc] = 0; // Initialize count for all managed categories
    });
    
    publishedBlogPosts.forEach(post => {
      post.tags.forEach(tag => {
        // Only count if the tag is in the managedCategories list
        const managedCatMatch = managedCategories.find(mc => mc.toLowerCase() === tag.toLowerCase());
        if (managedCatMatch) {
            categoryCounts[managedCatMatch] = (categoryCounts[managedCatMatch] || 0) + 1;
        }
      });
    });

    return managedCategories
      .map(name => ({ name, count: categoryCounts[name] || 0 }))
      .sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  },

  addManagedCategory: async (categoryName: string): Promise<string> => {
    await delay(MOCK_API_DELAY / 2);
    const trimmedName = categoryName.trim();
    if (!trimmedName) throw new Error("Category name cannot be empty.");
    if (managedCategories.find(cat => cat.toLowerCase() === trimmedName.toLowerCase())) {
      throw new Error(`Category "${trimmedName}" already exists in the managed list.`);
    }
    managedCategories.push(trimmedName);
    managedCategories.sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return trimmedName;
  },

  deleteManagedCategory: async (categoryName: string): Promise<void> => {
    await delay(MOCK_API_DELAY / 2);
    const normalizedCategoryName = categoryName.toLowerCase();
    managedCategories = managedCategories.filter(cat => cat.toLowerCase() !== normalizedCategoryName);
    // Also remove this tag from all blog posts
    blogPosts = blogPosts.map(post => ({
      ...post,
      tags: post.tags.filter(tag => tag.toLowerCase() !== normalizedCategoryName)
    }));
  }
};

// Expose for debugging in console if needed
if (typeof window !== 'undefined') {
  (window as any).mockApiService = mockApiService;
  (window as any).mockDb = { users, blogPosts, comments, bookmarks, sessions, managedCategories, notifications, reactions };
}
