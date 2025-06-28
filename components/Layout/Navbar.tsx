

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { APP_NAME, DEFAULT_PROFILE_PICTURE } from '../../constants';
import { UserRole } from '../../types';
import { mockApiService } from '../../services/mockApiService';
import {
  UserCircleIcon, ArrowLeftOnRectangleIcon, Cog6ToothIcon,
  DocumentPlusIcon, HomeIcon, Bars3Icon, XMarkIcon, ChevronDownIcon, TagIcon, MagnifyingGlassIcon, BookOpenIcon, InformationCircleIcon, SparklesIcon, BellIcon
} from '@heroicons/react/24/outline';
import Button from '../Common/Button';
import SearchOverlay from '../Common/SearchOverlay';
import ThemeToggle from './ThemeToggle';
import NotificationsPanel from '../Common/NotificationsPanel';
import { useNotification } from '../../contexts/NotificationContext';


const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [navCategories, setNavCategories] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); 
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNavCategories = async () => {
      try {
        const allPosts = await mockApiService.getBlogs();
        const publishedPosts = allPosts.filter(p => p.status === 'published');
        const allTags = new Set(publishedPosts.flatMap(post => post.tags));
        setNavCategories(Array.from(allTags).sort().slice(0, 4)); 
      } catch (error) {
        console.error("Failed to fetch categories for navbar:", error);
      }
    };
    fetchNavCategories();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoriesOpen(false);
    setIsProfileOpen(false);
    setIsSearchOpen(false);
    setIsNotificationsOpen(false);
  }, [location]);

   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
       if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    navigate('/');
  };

  const NavLinkItem: React.FC<{ to: string; children: React.ReactNode; className?: string, onClick?: () => void, exact?: boolean }> =
  ({ to, children, className = '', onClick, exact = false }) => {
    const isActive = exact
      ? location.pathname === to
      : (to === '/' ? location.pathname === to : location.pathname.startsWith(to) && location.pathname !== '/');

    const baseClasses = `px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150`;
    const activeClasses = `text-accent-500 dark:text-accent-400 font-semibold`; 
    const inactiveClasses = `text-primary-700 dark:text-primary-300 hover:text-accent-400 dark:hover:text-accent-300`; 

    return (
      <Link
        to={to}
        onClick={() => { setIsMobileMenuOpen(false); if (onClick) onClick(); }}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${className}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {children}
      </Link>
    );
  };

  const DropdownLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={() => {
        if (onClick) onClick();
        setIsCategoriesOpen(false);
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }}
      className="block px-4 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-accent-50 dark:hover:bg-primary-700 hover:text-accent-500 dark:hover:text-accent-300 transition-colors"
    >
      {children}
    </Link>
  );


  const renderDesktopNavLinks = () => (
    <>
      <NavLinkItem to="/" exact={true}>Home</NavLinkItem>
      <NavLinkItem to="/blogs">Blogs</NavLinkItem>
      <NavLinkItem to="/about">About</NavLinkItem>
      <NavLinkItem to="/pricing">Pricing</NavLinkItem>
      {navCategories.length > 0 && (
        <div className="relative" ref={categoriesDropdownRef}>
          <button
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none text-primary-700 dark:text-primary-300 hover:text-accent-400 dark:hover:text-accent-300`}
          >
            <span>Categories</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
          </button>
          {isCategoriesOpen && (
            <div className="absolute left-0 mt-2 w-56 origin-top-left bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-200 rounded-lg shadow-xl py-1 ring-1 ring-black dark:ring-primary-700 ring-opacity-5 z-[55]">
              {navCategories.map(category => (
                <DropdownLink key={category} to={`/category/${encodeURIComponent(category)}`}>
                  {category}
                </DropdownLink>
              ))}
              <div className="border-t border-secondary-200 dark:border-primary-700 my-1"></div>
              <DropdownLink to="/categories">All Categories</DropdownLink>
            </div>
          )}
        </div>
      )}
       {user && user.role !== UserRole.USER && <NavLinkItem to="/blog/create">New Post</NavLinkItem>}
    </>
  );

  const renderMobileNavLinks = () => (
     <>
      <NavLinkItem to="/" className="block !text-base" exact={true}>Home</NavLinkItem>
      <NavLinkItem to="/blogs" className="block !text-base">Blogs</NavLinkItem>
      <NavLinkItem to="/about" className="block !text-base">About</NavLinkItem>
      <NavLinkItem to="/pricing" className="block !text-base">Pricing</NavLinkItem>
      {user && (
        <>
          {user.role !== UserRole.USER && <NavLinkItem to="/blog/create" className="block !text-base">New Post</NavLinkItem>}
          <NavLinkItem to="/dashboard" className="block !text-base">Dashboard</NavLinkItem>
          {user.role === UserRole.ADMIN && (
            <NavLinkItem to="/admin" className="block !text-base">Admin</NavLinkItem>
          )}
        </>
      )}
      {navCategories.length > 0 && (
        <div className="pt-2 mt-2 border-t border-secondary-200 dark:border-primary-700">
          <h3 className="px-3 text-xs font-semibold uppercase text-primary-600 dark:text-primary-400 tracking-wider mb-1">Categories</h3>
          {navCategories.map(category => (
            <NavLinkItem
              key={category}
              to={`/category/${encodeURIComponent(category)}`}
              className="block !text-base"
            >
              {category}
            </NavLinkItem>
          ))}
           <NavLinkItem
              to="/categories" 
              className="block !text-base"
            >
              All Categories
            </NavLinkItem>
        </div>
      )}
      <div className="border-t border-secondary-200 dark:border-primary-700 mt-4 pt-4">
        {user ? (
            <button
            onClick={handleLogout}
            className={`w-full text-left flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-primary-700 dark:text-primary-300 hover:text-accent-500 dark:hover:text-accent-400 hover:bg-accent-100 dark:hover:bg-primary-700`}
            >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
            </button>
        ) : (
            <>
            <NavLinkItem to="/login" className="block !text-base">Login</NavLinkItem>
            <NavLinkItem to="/signup" className="block !text-base">Sign Up</NavLinkItem>
            </>
        )}
      </div>
    </>
  );


  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-primary-800/95 shadow-sm border-b border-secondary-200 dark:border-primary-700' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20"> 
          <Link to="/" className={`text-2xl md:text-3xl font-heading font-bold transition-colors ${isScrolled ? 'text-primary-800 dark:text-primary-100 hover:text-accent-400 dark:hover:text-accent-300' : 'text-primary-800 dark:text-primary-100 hover:text-accent-400 dark:hover:text-accent-300'}`}>
            {APP_NAME}
          </Link>

          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {renderDesktopNavLinks()}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-full transition-colors text-primary-600 dark:text-primary-400 hover:text-accent-400 dark:hover:text-accent-300`}
                aria-label="Search"
            >
                <MagnifyingGlassIcon className="h-5 w-5"/>
            </button>
            {user && !user.isSubscribed && (
              <Button onClick={() => navigate('/pricing')} variant="secondary" size="sm" className="!bg-yellow-400 hover:!bg-yellow-500 !text-yellow-900 !border-yellow-500 dark:!bg-yellow-500 dark:hover:!bg-yellow-400 dark:!text-yellow-900">
                Go Premium ✨
              </Button>
            )}
            {user ? (
              <>
              <div className="relative" ref={notificationsDropdownRef}>
                  <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-2 rounded-full text-primary-600 dark:text-primary-400 hover:text-accent-400 dark:hover:text-accent-300 transition-colors" aria-label="Notifications">
                      <BellIcon className="h-5 w-5" />
                      {unreadCount > 0 && (
                          <span className="absolute top-0.5 right-0.5 flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                          </span>
                      )}
                  </button>
                  {isNotificationsOpen && <NotificationsPanel onClose={() => setIsNotificationsOpen(false)} />}
              </div>

              <div className="relative" ref={profileDropdownRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-400 dark:focus:ring-accent-500">
                  <img src={user.profilePictureUrl || DEFAULT_PROFILE_PICTURE} alt="Profile" className="h-9 w-9 md:h-10 md:w-10 rounded-full object-cover border-2 border-transparent hover:border-accent-300 dark:hover:border-accent-500 transition-colors" onError={(e) => e.currentTarget.src = DEFAULT_PROFILE_PICTURE }/>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-primary-800 rounded-lg shadow-xl py-1 ring-1 ring-black dark:ring-primary-700 ring-opacity-5 z-[55]">
                    <div className="px-4 py-3 border-b border-secondary-200 dark:border-primary-700">
                        <p className="text-sm font-semibold text-primary-700 dark:text-primary-100">{user.username}</p>
                        <p className="text-xs text-primary-600 dark:text-primary-300">{user.email}</p>
                    </div>
                    <DropdownLink to="/dashboard">Dashboard</DropdownLink>
                    {user.role === UserRole.ADMIN && <DropdownLink to="/admin">Admin Panel</DropdownLink>}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-accent-50 dark:hover:bg-primary-700 hover:text-accent-500 dark:hover:text-accent-300 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
                <NavLinkItem to="/login">Login</NavLinkItem>
            )}
          </div>

          <div className="md:hidden flex items-center">
             <ThemeToggle />
             <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-lg transition-colors text-primary-700 dark:text-primary-300 hover:text-accent-500 dark:hover:text-accent-400 mr-1`}
                aria-label="Search"
            >
                <MagnifyingGlassIcon className="h-6 w-6"/>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors focus:outline-none text-primary-700 dark:text-primary-300 hover:text-accent-500 dark:hover:text-accent-400`}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`md:hidden absolute top-16 md:top-20 inset-x-0 bg-white dark:bg-primary-800 shadow-xl z-40 transition-all duration-300 ease-in-out overflow-y-auto max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] p-5 border-t border-secondary-200 dark:border-primary-700 rounded-b-lg`}>
          {renderMobileNavLinks()}
           <div className="mt-6 flex flex-col space-y-3">
             {user && !user.isSubscribed && (
              <Button onClick={() => {navigate('/pricing'); setIsMobileMenuOpen(false);}} variant="secondary" size="md" className="!bg-yellow-400 hover:!bg-yellow-500 !text-yellow-900 !border-yellow-500 dark:!bg-yellow-500 dark:hover:!bg-yellow-400 dark:!text-yellow-900 w-full justify-center">
                Go Premium ✨
              </Button>
            )}
           </div>
        </div>
      )}
    </nav>

    {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
    </>
  );
};

export default Navbar;