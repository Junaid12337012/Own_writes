import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../constants';
// Using a generic ShareIcon as specific brand icons for Twitter, Facebook, Instagram are not in heroicons/outline.
// In a real app, you'd use dedicated SVG icons for each brand.
import { ShareIcon } from '@heroicons/react/24/outline'; // Placeholder for social icons

const Footer: React.FC = () => {
  // Mock social links
  const socialLinks = [
    { name: 'Twitter', href: '#', icon: ShareIcon }, 
    { name: 'Facebook', href: '#', icon: ShareIcon },
    { name: 'Instagram', href: '#', icon: ShareIcon },
  ];

  return (
    <footer className="bg-primary-900 dark:bg-primary-950 text-secondary-300 dark:text-primary-400 border-t border-primary-800 dark:border-primary-700 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Column 1: App Info & Social */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-heading font-bold text-white dark:text-primary-100 mb-4">
              {APP_NAME}
            </h3>
            <p className="text-sm text-secondary-400 dark:text-primary-400 mb-6 pr-4">
              Modern Blogging. Powered by AI. Discover, create, and share your stories with the world.
            </p>
            <div className="mt-4">
                <p className="text-xs text-secondary-500 dark:text-primary-500 mb-2 uppercase tracking-wider">Follow us:</p>
                <div className="flex space-x-4">
                    {socialLinks.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        aria-label={item.name}
                        className="text-secondary-400 dark:text-primary-400 hover:text-accent-300 dark:hover:text-accent-400 transition-colors"
                      >
                        <item.icon className="h-6 w-6" aria-hidden="true" />
                      </a>
                    ))}
                </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-200 dark:text-primary-200 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-secondary-300 dark:text-primary-300 hover:text-accent-300 dark:hover:text-accent-400 transition-colors">Home</Link></li>
              <li><Link to="/blogs" className="text-sm text-secondary-300 dark:text-primary-300 hover:text-accent-300 dark:hover:text-accent-400 transition-colors">All Blogs</Link></li>
              <li><Link to="/about" className="text-sm text-secondary-300 dark:text-primary-300 hover:text-accent-300 dark:hover:text-accent-400 transition-colors">About Us</Link></li>
              <li><Link to="/categories" className="text-sm text-secondary-300 dark:text-primary-300 hover:text-accent-300 dark:hover:text-accent-400 transition-colors">Categories</Link></li> 
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-200 dark:text-primary-200 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-sm text-secondary-300 dark:text-primary-300 hover:text-accent-300 dark:hover:text-accent-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-secondary-300 dark:text-primary-300 hover:text-accent-300 dark:hover:text-accent-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/faq" className="text-sm text-secondary-300 dark:text-primary-300 hover:text-accent-300 dark:hover:text-accent-400 transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-sm text-secondary-300 dark:text-primary-300 hover:text-accent-300 dark:hover:text-accent-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Column 4: Stay Connected / Newsletter Teaser */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-200 dark:text-primary-200 uppercase tracking-wider mb-4">Stay Updated</h4>
            <p className="text-sm text-secondary-300 dark:text-primary-300 mb-3">
              Get the latest news and articles directly in your inbox.
            </p>
            <p className="text-sm text-secondary-400 dark:text-primary-400">
                Use the "Subscribe" button in the navigation bar.
            </p>
          </div>

        </div>

        <div className="border-t border-primary-800 dark:border-primary-700 pt-8 text-center">
          <p className="text-xs text-secondary-500 dark:text-primary-500">
            &copy; {new Date().getFullYear()} {APP_NAME}. All Rights Reserved. Crafted with care.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;