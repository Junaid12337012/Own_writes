



import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BlogPost, AiContentSuggestion, GeneratedImage, AiFirstDraft, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { mockApiService } from '../../services/mockApiService';
import { geminiService } from '../../services/geminiService';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import { useNotification } from '../../contexts/NotificationContext';
import { 
    LightBulbIcon, PhotoIcon, SparklesIcon, ClockIcon, QueueListIcon,
    ChatBubbleBottomCenterTextIcon, CodeBracketIcon, MinusIcon, NoSymbolIcon, ListBulletIcon, ArrowPathIcon, TagIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import { DEFAULT_FEATURED_IMAGE } from '../../constants';
import AiPostOutlineGenerator from './AiPostOutlineGenerator';
import AiEditorToolbar from './AiEditorToolbar';

interface BlogEditorProps {
  blogId?: string; 
  initialData?: AiFirstDraft | null;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ blogId, initialData }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const location = useLocation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState(''); 
  const [postType, setPostType] = useState<'article' | 'blog'>('blog');
  const [isPremium, setIsPremium] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [adminManagedCategories, setAdminManagedCategories] = useState<string[]>([]);
  const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);

  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [scheduledPublishTime, setScheduledPublishTime] = useState('');

  const [loading, setLoading] = useState(false);
  const [isFetchingBlog, setIsFetchingBlog] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiContentSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(false);
  
  const [showOutlineGenerator, setShowOutlineGenerator] = useState(false);
  
  // State for AI Editor Toolbar
  const [showAiToolbar, setShowAiToolbar] = useState(false);
  const [aiToolbarPosition, setAiToolbarPosition] = useState({ top: 0, left: 0 });
  const [selectedTextRange, setSelectedTextRange] = useState<Range | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const aiToolbarRef = useRef<HTMLDivElement>(null);

  // Apply initial data from AI Kickstart or URL param
  useEffect(() => {
    if (initialData) {
        setTitle(initialData.title);
        setContent(initialData.content);
    } else {
        const queryParams = new URLSearchParams(location.search);
        const suggestedTitle = queryParams.get('title');
        if (suggestedTitle && !blogId) {
            setTitle(suggestedTitle);
        }
    }
  }, [initialData, blogId, location.search]);

  // Set editor content once after it's been loaded
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);


  const fetchAdminManagedCategoriesForChips = useCallback(async () => {
    try {
        const cats = await mockApiService.getManagedCategories();
        setAdminManagedCategories(cats);
    } catch (error) {
        addToast({ message: "Could not load managed categories for selection.", type: 'error' });
    }
  }, [addToast]);


  const loadBlogData = useCallback(async () => {
    fetchAdminManagedCategoriesForChips();
    if (blogId && user) {
      setIsFetchingBlog(true);
      try {
        const post = await mockApiService.getBlogById(blogId);
        if (post && (post.authorId === user.id || user.role === 'admin')) {
          setPostToEdit(post);
          setTitle(post.title);
          setContent(post.content); 
          setMetaDescription(post.metaDescription || '');
          setPostType(post.postType || 'blog');
          setIsPremium(post.isPremium || false);
          setSelectedTags(Array.isArray(post.tags) ? post.tags : []); 
          setStatus(post.status);
          setFeaturedImage(post.featuredImage || '');
          setScheduledPublishTime(post.scheduledPublishTime ? new Date(post.scheduledPublishTime).toISOString().slice(0, 16) : '');
        } else if (post) {
            addToast({ message: 'You are not authorized to edit this post.', type: 'error'});
            navigate('/dashboard');
        } else {
            addToast({ message: 'Blog post not found.', type: 'error'});
            navigate('/404');
        }
      } catch (error) {
        addToast({ message: 'Failed to load blog post for editing.', type: 'error' });
      }
      setIsFetchingBlog(false);
    }
  }, [blogId, user, navigate, addToast, fetchAdminManagedCategoriesForChips]);

  useEffect(() => {
    if (blogId) { // Only load if it's an edit page
        loadBlogData();
    } else { // For create page, still need categories
        fetchAdminManagedCategoriesForChips();
    }
  }, [loadBlogData, blogId, fetchAdminManagedCategoriesForChips]);

  const handleContentEditableInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newHtml = e.currentTarget.innerHTML;
    if (content !== newHtml) {
      setContent(newHtml);
    }
  };
  
  const applyEditorFormat = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      const newHtml = editorRef.current.innerHTML;
      if (content !== newHtml) {
        setContent(newHtml);
      }
    }
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
        const range = selection.getRangeAt(0);
        const text = range.toString().trim();
        if (text.length > 5) {
            setSelectedTextRange(range.cloneRange());
            const rect = range.getBoundingClientRect();
            if (editorRef.current) {
                 const editorRect = editorRef.current.getBoundingClientRect();
                 setAiToolbarPosition({ 
                    top: rect.top - editorRect.top - 45, 
                    left: rect.left - editorRect.left + (rect.width / 2)
                });
                setShowAiToolbar(true);
            }
        } else {
             setShowAiToolbar(false);
        }
    } else {
        setShowAiToolbar(false);
    }
  }, []);

   useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (showAiToolbar && aiToolbarRef.current && !aiToolbarRef.current.contains(event.target as Node)) {
                // A small delay to allow toolbar button clicks to register
                setTimeout(() => setShowAiToolbar(false), 100);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [showAiToolbar]);

  const handleInsertImageInEditor = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      applyEditorFormat('insertImage', url);
    }
  };

  const replaceSelectedText = (newText: string) => {
      if (selectedTextRange) {
          selectedTextRange.deleteContents();
          selectedTextRange.insertNode(document.createTextNode(newText));
          
          // Update main content state
          if(editorRef.current) {
              setContent(editorRef.current.innerHTML);
          }
      }
      setShowAiToolbar(false);
      setSelectedTextRange(null);
  };


  const handleGetAiSuggestions = async () => {
    const currentContentForAI = editorRef.current?.innerHTML || content;
    if (!currentContentForAI.trim() && !title.trim()) {
      addToast({ message: 'Please write some content or a title first.', type: 'warning' });
      return;
    }
    setLoadingSuggestions(true);
    try {
      const suggestions = await geminiService.getContentSuggestions(title, currentContentForAI);
      setAiSuggestions(suggestions);
      if(suggestions.length === 0 || suggestions[0].suggestion.startsWith("Error:") || suggestions[0].suggestion.startsWith("AI suggestions currently unavailable.")){
        addToast({message: suggestions[0]?.suggestion || "No suggestions returned.", type: 'warning'});
      }
    } catch (error) {
      addToast({ message: 'Failed to get AI suggestions.', type: 'error' });
    }
    setLoadingSuggestions(false);
  };

  const applySuggestion = (suggestionText: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, `<p>${suggestionText}</p>`);
      const newHtml = editorRef.current.innerHTML;
      if (content !== newHtml) {
          setContent(newHtml);
      }
      setAiSuggestions([]);
    }
  };

  const handleGenerateMetaDescription = async () => {
    const currentContentForAI = editorRef.current?.innerHTML || content;
    if (!currentContentForAI.trim() || !title.trim()) {
        addToast({ message: 'A title and content are needed to generate a meta description.', type: 'warning' });
        return;
    }
    setLoadingMeta(true);
    try {
        const description = await geminiService.generateMetaDescription(title, currentContentForAI);
        setMetaDescription(description);
        addToast({ message: 'Meta description generated!', type: 'success' });
    } catch (error) {
        addToast({ message: 'Failed to generate meta description.', type: 'error' });
    }
    setLoadingMeta(false);
  };

  const handleGenerateFeaturedImage = async () => {
    if (!title.trim()) {
      addToast({ message: 'Please provide a title to generate an image.', type: 'warning' });
      return;
    }
    setLoadingImage(true);
    try {
      const currentContentForPrompt = editorRef.current?.innerText || "";
      const promptText = title + (currentContentForPrompt ? (": " + currentContentForPrompt.substring(0,100)) : "");
      const generated: GeneratedImage | null = await geminiService.generateFeaturedImage(promptText);
      if (generated && generated.base64Image && !generated.base64Image.startsWith("error_")) {
        setFeaturedImage(generated.base64Image);
        setFeaturedImageFile(null); 
        addToast({ message: 'Featured image generated!', type: 'success' });
      } else if (generated && generated.base64Image.startsWith("error_")) {
        addToast({message: generated.promptUsed, type: 'error'});
        setFeaturedImage(DEFAULT_FEATURED_IMAGE);
      } else {
        addToast({ message: 'Could not generate featured image. Using default.', type: 'warning' });
        setFeaturedImage(DEFAULT_FEATURED_IMAGE);
      }
    } catch (error) {
      addToast({ message: 'Error generating image.', type: 'error' });
      setFeaturedImage(DEFAULT_FEATURED_IMAGE);
    }
    setLoadingImage(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setLoadingImage(true);
        setFeaturedImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFeaturedImage(reader.result as string);
            setLoadingImage(false);
        };
        reader.readAsDataURL(file);
        addToast({ message: 'Image selected for upload.', type: 'info' });
    }
  };

  const handleApplyOutlineToContent = (outlineHtml: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const separator = editorRef.current.innerHTML && editorRef.current.innerHTML !== '<p><br></p>' ? '<br>' : ''; 
      document.execCommand('insertHTML', false, separator + outlineHtml);
      const newHtml = editorRef.current.innerHTML;
       if (content !== newHtml) {
          setContent(newHtml);
      }
      setShowOutlineGenerator(false);
      addToast({ message: 'Outline added to content editor!', type: 'success' });
    }
  };

  const toggleTagSelection = (tagToToggle: string) => {
    setSelectedTags(prevTags =>
      prevTags.includes(tagToToggle)
        ? prevTags.filter(t => t !== tagToToggle)
        : [...prevTags, tagToToggle]
    );
  };

  const handleAddCustomTag = () => {
    const newTagName = customTagInput.trim();
    if (newTagName && !selectedTags.find(t => t.toLowerCase() === newTagName.toLowerCase())) {
      setSelectedTags(prevTags => [...prevTags, newTagName]);
    }
    setCustomTagInput('');
  };

  const handleRemoveSelectedTag = (tagToRemove: string) => {
    setSelectedTags(prevTags => prevTags.filter(t => t !== tagToRemove));
  };


  const handleSubmit = async (e: React.FormEvent, newStatus?: 'draft' | 'published' | 'scheduled') => {
    e.preventDefault();
    if (!user) {
      addToast({ message: 'You must be logged in.', type: 'error' });
      return;
    }
    const currentContent = editorRef.current?.innerHTML || content;
    const isContentEmpty = !currentContent || currentContent === '<p><br></p>' || currentContent.trim() === '';

    if (!title.trim() || isContentEmpty) {
      addToast({ message: 'Title and content are required.', type: 'warning' });
      return;
    }
    if (selectedTags.length === 0) {
        addToast({ message: 'Please select or add at least one category/tag.', type: 'warning'});
        return;
    }

    setLoading(true);
    
    const finalStatus = newStatus || status;
    let finalScheduledPublishTime = scheduledPublishTime;

    if (finalStatus === 'scheduled' && !scheduledPublishTime) {
        addToast({ message: 'Please set a publish time for scheduled posts.', type: 'warning'});
        setLoading(false);
        return;
    }
    if (finalStatus !== 'scheduled') {
        finalScheduledPublishTime = '';
    }

    let imageUrlToSave = featuredImage;
    if (featuredImageFile) {
        addToast({ message: 'Image will be "uploaded" with the post (mock).', type: 'info' });
    }


    const postData: Partial<BlogPost> = {
      title,
      content: currentContent, 
      metaDescription,
      postType: postType,
      isPremium,
      tags: selectedTags,
      status: finalStatus,
      authorId: user.id,
      authorName: user.username,
      featuredImage: imageUrlToSave || DEFAULT_FEATURED_IMAGE,
      publishedAt: finalStatus === 'published' && !blogId ? new Date().toISOString() : (blogId ? (await mockApiService.getBlogById(blogId))?.publishedAt : undefined),
      scheduledPublishTime: finalStatus === 'scheduled' && finalScheduledPublishTime ? new Date(finalScheduledPublishTime).toISOString() : undefined,
    };

    try {
      let savedPost;
      if (blogId) {
        savedPost = await mockApiService.updateBlog(blogId, postData, user.id);
      } else {
        savedPost = await mockApiService.createBlog(postData as Partial<BlogPost>);
      }
      addToast({ message: `Post ${blogId ? 'updated' : 'created'} successfully as ${finalStatus}!`, type: 'success' });
      navigate(`/blog/${savedPost.id}`);
    } catch (error) {
      addToast({ message: `Failed to ${blogId ? 'update' : 'create'} post.`, type: 'error' });
    }
    setLoading(false);
  };


  if (isFetchingBlog && blogId) return <LoadingSpinner message="Loading blog data..." />;
  if (!user && !isFetchingBlog) return <p>Please log in to create or edit posts.</p>;


  const EditorToolbar: React.FC = () => (
    <div className="flex flex-wrap items-center gap-1 mb-2 p-2 border border-secondary-200 dark:border-primary-700 rounded-t-lg bg-secondary-100 dark:bg-primary-700">
      <Button type="button" onClick={() => applyEditorFormat('bold')} size="sm" variant="ghost" className="font-bold w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Bold">B</Button>
      <Button type="button" onClick={() => applyEditorFormat('italic')} size="sm" variant="ghost" className="italic w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Italic">I</Button>
      <Button type="button" onClick={() => applyEditorFormat('underline')} size="sm" variant="ghost" className="underline w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Underline">U</Button>
      <Button type="button" onClick={() => applyEditorFormat('formatBlock', '<h2>')} size="sm" variant="ghost" className="w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Heading 2">H2</Button>
      <Button type="button" onClick={() => applyEditorFormat('formatBlock', '<h3>')} size="sm" variant="ghost" className="w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Heading 3">H3</Button>
      <Button type="button" onClick={() => applyEditorFormat('formatBlock', '<h4>')} size="sm" variant="ghost" className="w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Heading 4">H4</Button>
      <Button type="button" onClick={() => applyEditorFormat('formatBlock', '<blockquote>')} size="sm" variant="ghost" className="w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Blockquote"> <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> </Button>
      <Button type="button" onClick={() => applyEditorFormat('formatBlock', '<pre>')} size="sm" variant="ghost" className="w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Code Block"> <CodeBracketIcon className="h-5 w-5" /> </Button>
      <Button type="button" onClick={() => applyEditorFormat('insertUnorderedList')} size="sm" variant="ghost" className="w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Bulleted List"> <ListBulletIcon className="h-5 w-5" /> </Button>
      <Button type="button" onClick={() => applyEditorFormat('insertOrderedList')} size="sm" variant="ghost" className="w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Numbered List"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"> <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12M4.5 6.75V6.75A2.25 2.25 0 0 0 2.25 9v.75m0 3.75V13.5A2.25 2.25 0 0 0 4.5 15.75m0 0v-.75A2.25 2.25 0 0 0 2.25 12.75M2.25 9.75A2.25 2.25 0 0 0 4.5 12m0 0V9.75m0 3.75A2.25 2.25 0 0 0 6.75 12.75m0 0V12m6.75 0h.008v.008H13.5V12Zm2.25 0h.008v.008H15.75V12Zm2.25 0h.008v.008H18V12Zm2.25 0h.008v.008H20.25V12Z" /> </svg> </Button>
      <Button type="button" onClick={() => applyEditorFormat('insertHorizontalRule')} size="sm" variant="ghost" className="w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Horizontal Rule"> <MinusIcon className="h-5 w-5" /> </Button>
      <Button type="button" onClick={() => applyEditorFormat('removeFormat')} size="sm" variant="ghost" className="w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Clear Formatting"> <NoSymbolIcon className="h-5 w-5" /> </Button>
      <Button type="button" onClick={handleInsertImageInEditor} size="sm" variant="ghost" className="w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Insert Image from URL"> <PhotoIcon className="h-5 w-5" /> </Button>
      <Button type="button" onClick={() => applyEditorFormat('hiliteColor', 'yellow')} size="sm" variant="ghost" className="w-8 h-8 p-0 !text-primary-600 dark:!text-primary-300 hover:!bg-secondary-200 dark:hover:!bg-primary-600 !rounded-lg" title="Highlight Text"> <SparklesIcon className="h-5 w-5 text-yellow-500" /> </Button>
    </div>
  );

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6 bg-white dark:bg-primary-800 p-6 sm:p-8 rounded-xl shadow-lg dark:shadow-primary-700/50 border border-secondary-200 dark:border-primary-700">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-primary-600 dark:text-primary-300">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-lg"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div>
          <label className="block text-sm font-medium text-primary-600 dark:text-primary-300">Post Type</label>
          <div className="mt-1 flex rounded-lg shadow-sm w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setPostType('blog')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border border-secondary-300 dark:border-primary-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent-400 dark:focus:ring-accent-500 transition-colors w-1/2 sm:w-auto
                ${postType === 'blog'
                  ? 'bg-accent-500 text-white border-accent-500'
                  : 'bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-200 hover:bg-secondary-50 dark:hover:bg-primary-600'
                }`}
            >
              Blog Post
            </button>
            <button
              type="button"
              onClick={() => setPostType('article')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r border-secondary-300 dark:border-primary-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent-400 dark:focus:ring-accent-500 transition-colors w-1/2 sm:w-auto
                ${postType === 'article'
                  ? 'bg-accent-500 text-white border-accent-500'
                  : 'bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-200 hover:bg-secondary-50 dark:hover:bg-primary-600'
                }`}
            >
              Article
            </button>
          </div>
        </div>
        <div>
           <label className="block text-sm font-medium text-primary-600 dark:text-primary-300">Monetization</label>
           <div className="mt-1 flex items-center">
            <button
                type="button"
                onClick={() => setIsPremium(!isPremium)}
                className={`${
                isPremium ? 'bg-yellow-500' : 'bg-gray-200 dark:bg-primary-600'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-primary-800`}
                role="switch"
                aria-checked={isPremium}
            >
                <span
                aria-hidden="true"
                className={`${
                    isPremium ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
            <span className="ml-3 text-sm text-primary-700 dark:text-primary-200">
                {isPremium ? 'Premium Post' : 'Standard Post'}
            </span>
            </div>
        </div>
      </div>

      <div className="space-y-2">
        <Button 
            type="button" 
            onClick={() => setShowOutlineGenerator(!showOutlineGenerator)} 
            variant="ghost" 
            leftIcon={<QueueListIcon className="h-5 w-5"/>}
            className="!text-purple-600 dark:!text-purple-400 hover:!bg-purple-100 dark:hover:!bg-purple-800/50 !rounded-lg"
            aria-expanded={showOutlineGenerator}
        >
          {showOutlineGenerator ? 'Hide' : 'Show'} AI Post Outline Generator
        </Button>
        {showOutlineGenerator && (
          <AiPostOutlineGenerator 
            onApplyOutline={handleApplyOutlineToContent}
            initialTitle={title}
          />
        )}
      </div>

      <div className="relative">
        <label htmlFor="content-editor" className="block text-sm font-medium text-primary-600 dark:text-primary-300 mb-1">Content</label>
        {showAiToolbar && <AiEditorToolbar ref={aiToolbarRef} position={aiToolbarPosition} onAction={replaceSelectedText} selectedTextRange={selectedTextRange} />}
        <EditorToolbar />
        <div
          ref={editorRef}
          id="content-editor"
          contentEditable={true}
          onInput={handleContentEditableInput}
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
          className="prose prose-base dark:prose-invert max-w-none w-full min-h-[300px] p-3 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 rounded-b-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 overflow-y-auto"
          aria-label="Blog content editor"
          role="textbox"
          aria-multiline="true"
        />
      </div>

      {/* Meta Description */}
      <div className="space-y-2 p-4 border border-secondary-200 dark:border-primary-700 rounded-lg">
        <label htmlFor="metaDescription" className="block text-sm font-medium text-primary-600 dark:text-primary-300">Meta Description (for SEO)</label>
        <textarea
          id="metaDescription"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          maxLength={160}
          className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm"
          placeholder="A short, catchy summary for search engines..."
        />
        <div className="flex justify-between items-center">
            <Button type="button" onClick={handleGenerateMetaDescription} isLoading={loadingMeta} disabled={loadingMeta} variant="ghost" size="sm" leftIcon={<SparklesIcon className="h-4 w-4"/>} className="!text-accent-600 dark:!text-accent-300 hover:!bg-accent-100 dark:hover:!bg-primary-600 !rounded-lg">
                Generate with AI
            </Button>
            <p className="text-xs text-primary-500 dark:text-primary-400">{metaDescription.length} / 160</p>
        </div>
      </div>
      
      <div className="p-4 border border-accent-200 dark:border-accent-700 rounded-lg bg-accent-50 dark:bg-primary-700">
        <Button type="button" onClick={handleGetAiSuggestions} isLoading={loadingSuggestions} disabled={loadingSuggestions} variant="ghost" leftIcon={<LightBulbIcon className="h-5 w-5"/>} className="!text-accent-600 dark:!text-accent-300 hover:!bg-accent-100 dark:hover:!bg-primary-600 !rounded-lg">
          Get AI Content Suggestions
        </Button>
        {loadingSuggestions && <p className="text-sm text-accent-500 dark:text-accent-400 mt-2">Fetching suggestions...</p>}
        {aiSuggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            <h4 className="text-sm font-medium text-primary-600 dark:text-primary-300">Suggestions:</h4>
            {aiSuggestions.map((s, index) => (
              <div key={index} className="p-2 bg-white dark:bg-primary-600 rounded-lg shadow-sm text-sm text-primary-600 dark:text-primary-200 flex justify-between items-center border border-secondary-200 dark:border-primary-500">
                <span>{s.suggestion}</span>
                <Button size="sm" variant="secondary" onClick={() => applySuggestion(s.suggestion)}>Apply</Button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Categories/Tags Section */}
      <div className="space-y-3 p-4 border border-secondary-200 dark:border-primary-700 rounded-lg">
        <label className="block text-sm font-medium text-primary-600 dark:text-primary-300">Categories / Tags</label>
        
        {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent-100 dark:bg-accent-700 text-accent-700 dark:text-accent-100">
                {tag}
                <button type="button" onClick={() => handleRemoveSelectedTag(tag)} className="ml-1.5 flex-shrink-0 text-accent-500 dark:text-accent-300 hover:text-accent-700 dark:hover:text-accent-100 focus:outline-none" aria-label={`Remove ${tag}`}>
                    <XMarkIcon className="h-3.5 w-3.5" />
                </button>
                </span>
            ))}
            </div>
        )}

        {adminManagedCategories.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-primary-500 dark:text-primary-400 mb-1.5">Select from managed categories:</p>
            <div className="flex flex-wrap gap-2">
              {adminManagedCategories.map(cat => {
                const isSelected = selectedTags.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleTagSelection(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm hover:shadow-md border
                      ${isSelected
                        ? 'bg-accent-500 text-white border-accent-500'
                        : 'bg-secondary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-200 hover:bg-secondary-200 dark:hover:bg-primary-600 hover:text-accent-600 dark:hover:text-accent-300 border-secondary-200 dark:border-primary-600'
                      }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-grow">
                <label htmlFor="customTagInput" className="text-xs text-primary-500 dark:text-primary-400 mb-1.5">Add a custom tag:</label>
                <input
                    type="text"
                    id="customTagInput"
                    value={customTagInput}
                    onChange={e => setCustomTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(); } }}
                    placeholder="e.g., Productivity"
                    className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm"
                />
            </div>
            <Button type="button" onClick={handleAddCustomTag} variant="secondary" size="md" className="sm:w-auto w-full justify-center">Add Tag</Button>
        </div>
      </div>
      
      {/* Featured Image Section */}
      <div className="space-y-3 p-4 border border-secondary-200 dark:border-primary-700 rounded-lg">
        <label className="block text-sm font-medium text-primary-600 dark:text-primary-300">Featured Image</label>
        {loadingImage ? (
            <div className="flex justify-center items-center h-48 bg-secondary-100 dark:bg-primary-700 rounded-lg">
                <LoadingSpinner message="Generating/Loading Image..." />
            </div>
        ) : (
            featuredImage && <img src={featuredImage} alt="Featured" className="w-full max-h-64 object-cover rounded-lg shadow-sm" onError={(e) => e.currentTarget.src=DEFAULT_FEATURED_IMAGE}/>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="button" onClick={handleGenerateFeaturedImage} isLoading={loadingImage} disabled={loadingImage} variant="ghost" size="sm" leftIcon={<SparklesIcon className="h-4 w-4"/>} className="!text-accent-600 dark:!text-accent-300 hover:!bg-accent-100 dark:hover:!bg-primary-600 !rounded-lg flex-1 justify-center">
            Generate with AI
          </Button>
          <label htmlFor="image-upload" className="w-full flex-1">
            <span className="flex items-center justify-center w-full h-full px-3 py-1.5 text-sm font-medium text-accent-500 bg-accent-50 hover:bg-accent-100 focus-visible:ring-accent-400 border border-secondary-300 dark:bg-primary-700 dark:text-accent-300 dark:hover:bg-primary-600 dark:border-primary-600 dark:focus-visible:ring-accent-400 active:scale-95 rounded-lg shadow-sm cursor-pointer">
                <PhotoIcon className="h-4 w-4 mr-2"/>
                Upload Image
            </span>
            <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Scheduling Section */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-primary-600 dark:text-primary-300">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'scheduled')}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm rounded-lg"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>
        {status === 'scheduled' && (
          <div className="mt-2">
            <label htmlFor="scheduledPublishTime" className="block text-sm font-medium text-primary-600 dark:text-primary-300">Publish Date & Time</label>
            <input
              type="datetime-local"
              id="scheduledPublishTime"
              value={scheduledPublishTime}
              onChange={(e) => setScheduledPublishTime(e.target.value)}
              className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-5 border-t border-secondary-200 dark:border-primary-700">
        <Button type="submit" onClick={(e) => handleSubmit(e, 'draft')} isLoading={loading} disabled={loading} variant="secondary">
          Save as Draft
        </Button>
        {status !== 'scheduled' && (
            <Button type="submit" onClick={(e) => handleSubmit(e, 'published')} isLoading={loading} disabled={loading} variant="primary">
                {blogId && postToEdit?.status === 'published' ? 'Update Post' : 'Publish Now'}
            </Button>
        )}
         {status === 'scheduled' && (
            <Button type="submit" onClick={(e) => handleSubmit(e, 'scheduled')} isLoading={loading} disabled={loading} variant="primary" leftIcon={<ClockIcon className="h-5 w-5"/>}>
                Schedule Post
            </Button>
        )}
      </div>
    </form>
  );
};

export default BlogEditor;
