

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BlogPost, User, GeneratedImage } from '../../types';
import { mockApiService } from '../../services/mockApiService';
import { geminiService } from '../../services/geminiService';
import LoadingSpinner from '../Common/LoadingSpinner';
import CommentSection from './CommentSection';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { ttsService } from '../../services/ttsService';
import { DEFAULT_FEATURED_IMAGE, DEFAULT_PROFILE_PICTURE, APP_NAME } from '../../constants';
import { 
    CalendarDaysIcon, UserCircleIcon, TagIcon, HeartIcon, PencilIcon, TrashIcon, 
    SpeakerWaveIcon, SpeakerXMarkIcon, BookmarkIcon as BookmarkSolidIcon, ArrowUturnLeftIcon, SparklesIcon,
    LinkIcon, ShareIcon as ShareOutlineIcon, Bars3BottomLeftIcon, XMarkIcon as XMarkIconOutline, EnvelopeIcon,
    ClipboardIcon, CameraIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline';
import { updatePageMeta, injectJSONLD, removeJSONLD } from '../../utils/seoUtils';
import { createExcerpt } from '../../utils/helpers';
import ReactionsControl from './ReactionsControl';


import Button from '../Common/Button';
import TextShotModal from './TextShotModal';
import PremiumContentLock from './PremiumContentLock';
import TableOfContents from './TableOfContents';
import AiEditorToolbar from './AiEditorToolbar';

interface BlogDetailProps {
  blogId: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number; 
  active: boolean;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blogId }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [showTextActionToolbar, setShowTextActionToolbar] = useState(false);
  const [textActionToolbarPosition, setTextActionToolbarPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  
  const [isTextShotModalOpen, setIsTextShotModalOpen] = useState(false);
  const [textShotImage, setTextShotImage] = useState<GeneratedImage | null>(null);
  const [loadingTextShot, setLoadingTextShot] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [isTocVisibleMobile, setIsTocVisibleMobile] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);


  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const textActionToolbarRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const headingRefs = useRef<{[id: string]: IntersectionObserverEntry}>({});


  useEffect(() => {
    if (post && author) {
      const pageUrl = `${window.location.origin}/#/blog/${post.id}`;
      updatePageMeta({
        title: post.title,
        description: post.metaDescription || post.excerpt || createExcerpt(post.content, 160),
        imageUrl: post.featuredImage || DEFAULT_FEATURED_IMAGE,
        url: pageUrl,
        author: author.username,
        keywords: post.tags.join(', ')
      });

      const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": pageUrl
        },
        "headline": post.title,
        "description": post.metaDescription || post.excerpt || createExcerpt(post.content, 160),
        "image": post.featuredImage || DEFAULT_FEATURED_IMAGE,
        "datePublished": post.publishedAt || post.createdAt,
        "dateModified": post.updatedAt,
        "author": {
          "@type": "Person",
          "name": author.username,
          "url": `${window.location.origin}/#/author/${author.id}`
        },
        "publisher": {
          "@type": "Organization",
          "name": APP_NAME,
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/assets/logo_placeholder_512.png` // Replace with actual logo URL
          }
        },
        "keywords": post.tags.join(', '),
        "isAccessibleForFree": post.isPremium ? "False" : "True",
         ...(post.isPremium && {
            "hasPart": {
                "@type": "WebPageElement",
                "isAccessibleForFree": "False",
                "cssSelector": ".premium-content-lock"
            }
        })
      };
      injectJSONLD(schema);
    }
    return () => {
        removeJSONLD();
    };
  }, [post, author]);


  const fetchBlogDetails = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPost = await mockApiService.getBlogById(blogId);
      if (fetchedPost) {
        setPost(fetchedPost);
        const fetchedAuthor = await mockApiService.getUserById(fetchedPost.authorId);
        setAuthor(fetchedAuthor);
        const allPosts = await mockApiService.getBlogs();
        const related = allPosts.filter(p => 
            p.id !== fetchedPost.id && 
            p.status === 'published' &&
            p.tags.some(tag => fetchedPost.tags.includes(tag))
        ).slice(0, 3);
        setRelatedPosts(related);

        if (user) {
            const bookmarked = await mockApiService.isBookmarked(user.id, fetchedPost.id);
            setIsBookmarked(bookmarked);
        }

      } else {
        addToast({ message: 'Blog post not found.', type: 'error' });
        navigate('/404');
      }
    } catch (error) {
      console.error("Failed to fetch blog details:", error);
      addToast({ message: 'Could not load blog post.', type: 'error' });
    }
    setLoading(false);
  }, [blogId, user, addToast, navigate]);

  useEffect(() => {
    fetchBlogDetails();
    return () => { 
      if (ttsService.isSpeaking()) {
        ttsService.stop();
      }
    };
  }, [fetchBlogDetails]);

  // Handle Scroll Progress Bar
  const handleScroll = useCallback(() => {
    const mainElement = document.documentElement; 
    const windowHeight = mainElement.clientHeight;
    const documentHeight = mainElement.scrollHeight; 
    
    let progress = (mainElement.scrollTop / (documentHeight - windowHeight)) * 100;
    progress = Math.min(100, Math.max(0, progress)); 
    setScrollProgress(progress);
  }, []);

   // Handle click outside for menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
      if (contentRef.current && !contentRef.current.contains(event.target as Node) &&
          textActionToolbarRef.current && !textActionToolbarRef.current.contains(event.target as Node) &&
          !(event.target instanceof HTMLElement && event.target.closest('.text-shot-modal')) && 
           showTextActionToolbar) {
        setShowTextActionToolbar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, showTextActionToolbar]);


  // Setup TOC and IntersectionObserver for active heading
  useEffect(() => {
    if (post && contentRef.current) {
      const headings = Array.from(contentRef.current.querySelectorAll('h2, h3, h4'));
      const items: TocItem[] = [];
      headings.forEach((heading, index) => {
        const text = heading.textContent || `Section ${index + 1}`;
        let id = heading.id;
        if (!id) {
          id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + `-${index}`;
          heading.id = id;
        }
        let level = 2;
        if (heading.tagName === 'H3') level = 3;
        if (heading.tagName === 'H4') level = 4;
        items.push({ id, text, level, active: false });
      });
      setTocItems(items);
      
      const observerCallback: IntersectionObserverCallback = (entries) => {
        entries.forEach(entry => {
          headingRefs.current[entry.target.id] = entry;
        });

        const visibleHeadings = Object.values(headingRefs.current).filter(entry => entry.isIntersecting);
        if (visibleHeadings.length > 0) {
            const topMostVisible = visibleHeadings.sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
            setTocItems(prevItems => prevItems.map(item => ({...item, active: item.id === topMostVisible.target.id})));
        }
      };
      
      const observer = new IntersectionObserver(observerCallback, { rootMargin: "-10% 0px -65% 0px" });
      headings.forEach(h => observer.observe(h));

      return () => observer.disconnect();
    }
  }, [post, loading]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
      const text = selection.toString().trim();
      if (text.length > 5 && text.length <= 300) { 
        setSelectedText(text);
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setTextActionToolbarPosition({ 
          top: rect.top + window.scrollY - 45, 
          left: rect.left + window.scrollX + (rect.width / 2) 
        });
        setShowTextActionToolbar(true);
      } else {
        setShowTextActionToolbar(false);
        if (text.length > 300) addToast({message: "Selected text is too long for actions (max 300 chars).", type: "info"})
      }
    } else {
      setShowTextActionToolbar(false);
    }
  }, [addToast]);

  useEffect(() => {
    const mainContentArea = contentRef.current;
    if (mainContentArea) {
      mainContentArea.addEventListener('mouseup', handleTextSelection);
      mainContentArea.addEventListener('touchend', handleTextSelection);
    }

    return () => {
      if (mainContentArea) {
        mainContentArea.removeEventListener('mouseup', handleTextSelection);
        mainContentArea.removeEventListener('touchend', handleTextSelection);
      }
    };
  }, [handleTextSelection, showTextActionToolbar]);


  const handleCreateTextShot = async () => {
    if (!selectedText) return;
    setShowTextActionToolbar(false);
    setIsTextShotModalOpen(true);
    setLoadingTextShot(true);
    setTextShotImage(null);
    try {
      const result = await geminiService.generateTextShotImage(selectedText);
       if (result && result.base64Image && !result.base64Image.startsWith("error_")) {
        setTextShotImage(result);
      } else if (result && result.base64Image.startsWith("error_")) {
        addToast({message: result.promptUsed, type: 'error'});
        setIsTextShotModalOpen(false);
      } else {
        addToast({ message: 'Could not generate Text Shot image.', type: 'warning' });
        setIsTextShotModalOpen(false);
      }
    } catch (error) {
      addToast({ message: 'Error generating Text Shot.', type: 'error' });
      setIsTextShotModalOpen(false);
    }
    setLoadingTextShot(false);
  };

  const handleCopySelectedText = () => {
    if (!selectedText) return;
    navigator.clipboard.writeText(selectedText)
      .then(() => {
        addToast({ message: 'Text copied to clipboard!', type: 'success' });
        setShowTextActionToolbar(false);
      })
      .catch(err => {
        addToast({ message: 'Failed to copy text.', type: 'error' });
        console.error('Failed to copy text: ', err);
      });
  };


  const handleToggleTTS = async () => {
    if (!post) return;
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else {
      try {
        setIsSpeaking(true);
        const textToSpeak = post.title + ". " + (contentRef.current?.innerText || post.content.replace(/<[^>]+>/g, ''));
        await ttsService.speak(textToSpeak);
        setIsSpeaking(false); 
      } catch (error) {
        addToast({ message: (error as Error).message || 'Text-to-speech failed.', type: 'error' });
        setIsSpeaking(false);
      }
    }
  };

  const handleToggleBookmark = async () => {
    if (!post || !user) {
        addToast({ message: 'You need to be logged in to bookmark posts.', type: 'warning'});
        return;
    }
    try {
        if (isBookmarked) {
            await mockApiService.removeBookmark(user.id, post.id);
            setIsBookmarked(false);
            addToast({ message: 'Bookmark removed.', type: 'info'});
        } else {
            await mockApiService.addBookmark(user.id, post.id);
            setIsBookmarked(true);
            addToast({ message: 'Post bookmarked!', type: 'success'});
        }
    } catch (error) {
        addToast({ message: 'Failed to update bookmark.', type: 'error'});
    }
  };

  const handleDeletePost = async () => {
    if (!post || !user || (user.id !== post.authorId && user.role !== 'admin')) {
        addToast({ message: 'You are not authorized to delete this post.', type: 'error' });
        return;
    }
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        try {
            await mockApiService.deleteBlog(post.id, user.id);
            addToast({ message: 'Post deleted successfully.', type: 'success' });
            navigate(user.role === 'admin' ? '/admin/blogs' : '/dashboard');
        } catch (error) {
            addToast({ message: 'Failed to delete post.', type: 'error' });
        }
    }
  };
  
  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy') => {
    if (!post) return;
    const url = `${window.location.origin}/#/blog/${post.id}`;
    const title = post.title;
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(post.excerpt || '')}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        window.location.href = shareUrl; 
        setIsShareMenuOpen(false);
        return;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          addToast({ message: 'Link copied to clipboard!', type: 'success' });
        }).catch(() => {
          addToast({ message: 'Failed to copy link.', type: 'error' });
        });
        setIsShareMenuOpen(false);
        return;
    }
    if(shareUrl) window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setIsShareMenuOpen(false);
  };


  if (loading) {
    return <LoadingSpinner message="Loading post..." className="py-20 min-h-screen" />;
  }

  if (!post) {
    return <div className="text-center py-10 text-xl text-primary-700 dark:text-primary-300">Blog post not found. <Link to="/" className="text-accent-600 dark:text-accent-400 hover:underline">Go Home</Link></div>;
  }

  const displayImage = post.featuredImage || DEFAULT_FEATURED_IMAGE;
  const authorImage = author?.profilePictureUrl || DEFAULT_PROFILE_PICTURE;
  const showPaywall = post.isPremium && !user?.isSubscribed;
  

  return (
    <div className="bg-white dark:bg-primary-900 selection:bg-accent-200 selection:text-accent-800">
      <div className="fixed top-16 md:top-20 left-0 h-1 bg-accent-500 dark:bg-accent-400 z-[90] transition-all duration-100" style={{ width: `${scrollProgress}%` }} />
        
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"> 
         <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-2 !text-primary-700 dark:!text-primary-300 hover:!text-accent-600 dark:hover:!text-accent-400" leftIcon={<ArrowUturnLeftIcon className="h-5 w-5"/>}>
            Back
         </Button>
       </div>

      <header className="relative w-full h-[35vh] sm:h-[45vh] lg:h-[55vh] group">
        <img 
            src={displayImage} 
            alt={post.title} 
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12 text-white z-10 max-w-4xl mx-auto w-full">
            <div className="mb-3 flex flex-wrap gap-x-3 gap-y-2 items-center">
                {post.isPremium && (
                     <span className="inline-flex items-center gap-x-1.5 bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M9.69 2.69a.75.75 0 01.62 0l1.653 1.14.918-1.423a.75.75 0 011.29.832l-.42 1.84a.75.75 0 01-.282.49L15.3 7.04a.75.75 0 01-.2 1.284l-1.83.421a.75.75 0 01-.489.282l-1.14 1.652a.75.75 0 01-1.298-.832l.42-1.84a.75.75 0 01.282-.49l-1.54-1.54a.75.75 0 01-.2-1.284l1.83-.421a.75.75 0 01.49-.282l1.14-1.653zM4.69 2.69a.75.75 0 01.62 0l1.653 1.14.918-1.423a.75.75 0 011.29.832l-.42 1.84a.75.75 0 01-.282.49L10.3 7.04a.75.75 0 01-.2 1.284l-1.83.421a.75.75 0 01-.489.282l-1.14 1.652a.75.75 0 01-1.298-.832l.42-1.84a.75.75 0 01.282-.49l-1.54-1.54a.75.75 0 01-.2-1.284l1.83-.421a.75.75 0 01.49-.282L4.69 2.69z" clipRule="evenodd" />
                            <path d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.06 4.75a.75.75 0 01.12.52l-.42 1.84a.75.75 0 01-1.47-.33l.42-1.84a.75.75 0 011.35-.19zM14.94 4.75a.75.75 0 011.35.19l.42 1.84a.75.75 0 01-1.47.33l-.42-1.84a.75.75 0 01.12-.52zM10 18a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H10a.75.75 0 01-.75-.75zM3.25 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM18.25 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM14.94 15.25a.75.75 0 01.12-.52l.42-1.84a.75.75 0 011.47.33l-.42 1.84a.75.75 0 01-1.35.19zM5.06 15.25a.75.75 0 011.35-.19l.42 1.84a.75.75 0 01-1.47.33l-.42-1.84a.75.75 0 01.12-.52z" />
                        </svg>
                        Premium
                    </span>
                )}
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider capitalize">
                    {post.postType || 'blog'}
                </span>
                {post.tags.map(tag => (
                <Link 
                    to={`/category/${encodeURIComponent(tag)}`}
                    key={tag} 
                    className="inline-block bg-accent-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-accent-600 transition-colors uppercase tracking-wider"
                    aria-label={`View posts in category ${tag}`}
                >
                    {tag}
                </Link>
                ))}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading mb-4 leading-tight shadow-text">{post.title}</h1>
            <div className="flex flex-wrap items-center text-sm text-gray-200 space-x-4">
                <div className="flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-1.5" />
                <span>Published on {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {author && (
                <div className="flex items-center">
                    <img src={authorImage} alt={author.username} className="h-7 w-7 rounded-full mr-2 object-cover border border-accent-400" onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)} />
                    <Link to={`/author/${author.id}`} className="font-medium hover:underline">{author.username}</Link>
                </div>
                )}
            </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            
            {/* Desktop Table of Contents */}
            <aside className="hidden lg:block lg:col-span-3">
              <TableOfContents items={tocItems} />
            </aside>

            {/* Main Content Column */}
            <div className="lg:col-span-9">
              {/* This container adds the background and padding for the main content block */}
              <div className="bg-white dark:bg-primary-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-secondary-100 dark:border-primary-700">
                  <div className="mb-8 pb-6 border-b border-secondary-200 dark:border-primary-700 flex flex-wrap items-center justify-start gap-x-2 gap-y-2 sm:gap-y-3">
                      <ReactionsControl post={post} setPost={setPost} />
                      <Button onClick={handleToggleTTS} variant="ghost" size="sm" className="text-primary-700 dark:text-primary-300 hover:!text-accent-600 dark:hover:!text-accent-300 hover:!bg-accent-100 dark:hover:!bg-primary-700 focus:!ring-accent-400 dark:focus:!ring-accent-500" leftIcon={isSpeaking ? <SpeakerXMarkIcon className="h-5 w-5"/> : <SpeakerWaveIcon className="h-5 w-5"/>}> {isSpeaking ? 'Stop' : 'Read'} </Button>
                      <Button onClick={handleToggleBookmark} variant="ghost" size="sm" className="text-primary-700 dark:text-primary-300 hover:!text-yellow-500 dark:hover:!text-yellow-400 hover:!bg-yellow-100 dark:hover:!bg-primary-700 focus:!ring-yellow-400 dark:focus:!ring-yellow-500" leftIcon={isBookmarked ? <BookmarkSolidIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400"/> : <BookmarkOutlineIcon className="h-5 w-5"/>} aria-pressed={isBookmarked}> {isBookmarked ? 'Bookmarked' : 'Bookmark'} </Button>
                      <div ref={shareMenuRef} className="relative">
                          <Button onClick={() => setIsShareMenuOpen(!isShareMenuOpen)} variant="ghost" size="sm" className="text-primary-700 dark:text-primary-300 hover:!text-accent-600 dark:hover:!text-accent-300 hover:!bg-accent-100 dark:hover:!bg-primary-700 focus:!ring-accent-400 dark:focus:!ring-accent-500" leftIcon={<ShareOutlineIcon className="h-5 w-5"/>} rightIcon={<ChevronDownIcon className="h-4 w-4"/>}>Share</Button>
                          {isShareMenuOpen && (
                              <div className="absolute left-0 mt-2 w-48 origin-top-left bg-white dark:bg-primary-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
                                  <div className="py-1">
                                      <button onClick={() => handleShare('copy')} className="flex items-center w-full text-left px-4 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-secondary-100 dark:hover:bg-primary-600"><LinkIcon className="h-4 w-4 mr-2"/>Copy Link</button>
                                      <button onClick={() => handleShare('twitter')} className="flex items-center w-full text-left px-4 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-secondary-100 dark:hover:bg-primary-600">Twitter</button>
                                      <button onClick={() => handleShare('facebook')} className="flex items-center w-full text-left px-4 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-secondary-100 dark:hover:bg-primary-600">Facebook</button>
                                      <button onClick={() => handleShare('linkedin')} className="flex items-center w-full text-left px-4 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-secondary-100 dark:hover:bg-primary-600">LinkedIn</button>
                                      <button onClick={() => handleShare('email')} className="flex items-center w-full text-left px-4 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-secondary-100 dark:hover:bg-primary-600"><EnvelopeIcon className="h-4 w-4 mr-2"/>Email</button>
                                  </div>
                              </div>
                          )}
                      </div>
                      {(user?.id === post.authorId || user?.role === 'admin') && (
                      <>
                          <Button onClick={() => navigate(`/blog/edit/${post.id}`)} variant="ghost" size="sm" className="text-primary-700 dark:text-primary-300 hover:!text-yellow-500 dark:hover:!text-yellow-400 hover:!bg-yellow-100 dark:hover:!bg-primary-700 focus:!ring-yellow-400 dark:focus:!ring-yellow-500" leftIcon={<PencilIcon className="h-5 w-5"/>}> Edit </Button>
                          <Button onClick={handleDeletePost} variant="ghost" size="sm" className="text-primary-700 dark:text-primary-300 hover:!text-red-600 dark:hover:!text-red-500 hover:!bg-red-100 dark:hover:!bg-primary-700 focus:!ring-red-500" leftIcon={<TrashIcon className="h-5 w-5"/>}> Delete </Button>
                      </>
                      )}
                  </div>
                  
                  {tocItems.length > 0 && (
                      <div className="lg:hidden mb-10 p-4 bg-secondary-100 dark:bg-primary-700 rounded-lg shadow-sm border border-secondary-200 dark:border-primary-600">
                          <button onClick={() => setIsTocVisibleMobile(!isTocVisibleMobile)} className="flex justify-between items-center w-full font-semibold text-primary-700 dark:text-primary-200 hover:text-accent-600 dark:hover:text-accent-400">
                              Table of Contents
                              {isTocVisibleMobile ? <XMarkIconOutline className="h-5 w-5"/> : <Bars3BottomLeftIcon className="h-5 w-5"/>}
                          </button>
                          {isTocVisibleMobile && (
                              <div className="mt-4">
                                <TableOfContents items={tocItems} isMobile={true} onLinkClick={() => setIsTocVisibleMobile(false)} />
                              </div>
                          )}
                      </div>
                  )}

                  <article ref={contentRef} className="prose prose-base sm:prose-lg dark:prose-invert max-w-none leading-relaxed blog-content-area" id="blog-content-main" onMouseUp={showPaywall ? undefined : handleTextSelection} onTouchEnd={showPaywall ? undefined : handleTextSelection}>
                    {!showPaywall && <div dangerouslySetInnerHTML={{ __html: post.content }} />}
                    {showPaywall && (
                        <>
                            <div dangerouslySetInnerHTML={{ __html: post.excerpt || createExcerpt(post.content, 500) }} />
                            <PremiumContentLock />
                        </>
                    )}
                  </article>

                  {author && (
                      <section className="mt-16 pt-10 border-t border-secondary-200 dark:border-primary-700">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start bg-secondary-100 dark:bg-primary-700 p-6 sm:p-8 rounded-lg shadow-md border border-secondary-200 dark:border-primary-600">
                              <Link to={`/author/${author.id}`} className="flex-shrink-0 mb-5 sm:mb-0 sm:mr-6">
                                  <img src={authorImage} alt={author.username} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white dark:border-primary-600 shadow-sm transition-transform hover:scale-105" onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)}/>
                              </Link>
                              <div className="text-center sm:text-left">
                                  <p className="text-xs text-primary-600 dark:text-primary-400 uppercase tracking-wider font-semibold">Written By</p>
                                  <Link to={`/author/${author.id}`}> <h3 className="text-2xl lg:text-3xl font-heading font-semibold text-primary-800 dark:text-primary-100 hover:text-accent-600 dark:hover:text-accent-400 transition-colors mt-1">{author.username}</h3> </Link>
                                  {author.bio && <p className="text-primary-700 dark:text-primary-300 mt-2.5 text-sm leading-relaxed max-w-md">{author.bio}</p>}
                                  <div className="mt-4 flex justify-center sm:justify-start space-x-3">
                                      <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-accent-500 dark:hover:text-accent-400 transition-colors" aria-label={`${author.username} on Twitter (mock)`}><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg></a>
                                      <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-accent-500 dark:hover:text-accent-400 transition-colors" aria-label={`${author.username} on LinkedIn (mock)`}><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path></svg></a>
                                  </div>
                              </div>
                          </div>
                      </section>
                  )}

                  {!showPaywall && <CommentSection blogPostId={blogId} />}
              </div>
            </div>
        </div>
      </div>

      {showTextActionToolbar && (
          <div ref={textActionToolbarRef} style={{ top: `${textActionToolbarPosition.top}px`, left: `${textActionToolbarPosition.left}px`, transform: 'translateX(-50%)' }} className="fixed z-[95] bg-slate-800 text-slate-100 px-2 py-1.5 rounded-md shadow-lg flex items-center space-x-1">
              <button onClick={handleCopySelectedText} className="p-1.5 hover:bg-slate-700 rounded" title="Copy selected text" aria-label="Copy selected text"> <ClipboardIcon className="h-5 w-5"/> </button>
              <div className="w-px h-5 bg-slate-600"></div> 
              <button onClick={handleCreateTextShot} className="p-1.5 hover:bg-slate-700 rounded" title="Create Text Shot image from selection" aria-label="Create Text Shot image from selection"> <CameraIcon className="h-5 w-5"/> </button>
          </div>
      )}

      {isTextShotModalOpen && <TextShotModal isOpen={isTextShotModalOpen} onClose={() => setIsTextShotModalOpen(false)} imageData={textShotImage} isLoading={loadingTextShot} originalText={selectedText}/>}

      {relatedPosts.length > 0 && (
        <section className="bg-secondary-100 dark:bg-primary-950 py-12 md:py-16"> 
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-primary-800 dark:text-primary-100 mb-8 text-center">You Might Also Like</h3>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {relatedPosts.map(relatedPost => (
                   <div key={relatedPost.id} className="bg-white dark:bg-primary-800 p-4 rounded-lg shadow-md hover:shadow-xl dark:hover:shadow-primary-700/50 transition-all duration-300 transform hover:-translate-y-1.5 border border-secondary-200 dark:border-primary-700">
                      <Link to={`/blog/${relatedPost.id}`} className="group">
                          <div className="overflow-hidden rounded-md mb-3">
                            <img 
                                src={relatedPost.featuredImage || DEFAULT_FEATURED_IMAGE} 
                                alt={relatedPost.title} 
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)}
                            />
                          </div>
                          <h4 className="text-md font-semibold font-heading text-primary-800 dark:text-primary-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors line-clamp-2 mb-1">{relatedPost.title}</h4>
                          <p className="text-xs text-primary-600 dark:text-primary-400">By {relatedPost.authorName}</p>
                      </Link>
                   </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetail;
