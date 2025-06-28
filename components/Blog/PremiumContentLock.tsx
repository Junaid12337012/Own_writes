
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../Common/Button';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const PremiumContentLock: React.FC = () => {
  return (
    <div className="relative mt-8 py-10 rounded-lg overflow-hidden premium-content-lock">
      {/* Blurred background element */}
      <div className="absolute inset-0 bg-white/50 dark:bg-primary-800/50 backdrop-blur-lg z-10"></div>
      
      <div className="relative z-20 text-center p-6 flex flex-col items-center">
        <div className="bg-yellow-400 text-yellow-900 p-3 rounded-full mb-4 shadow-lg">
          <SparklesIcon className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold text-primary-800 dark:text-primary-100">This is a Premium Article</h3>
        <p className="text-primary-700 dark:text-primary-300 mt-2 max-w-md mx-auto">
          You've discovered exclusive content. Subscribe to unlock this full article and get access to all premium posts.
        </p>
        
        <ul className="text-left my-6 space-y-2 text-primary-700 dark:text-primary-200">
          <li className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-accent-500 dark:text-accent-400 mr-2" />
            <span>Read all premium articles</span>
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-accent-500 dark:text-accent-400 mr-2" />
            <span>Support your favorite creators</span>
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-accent-500 dark:text-accent-400 mr-2" />
            <span>Ad-free reading experience (mock)</span>
          </li>
        </ul>

        <Link to="/pricing">
          <Button variant="primary" size="lg">
            Subscribe to Read
          </Button>
        </Link>
        <p className="text-sm text-primary-600 dark:text-primary-400 mt-4">
          Already a member? <Link to="/login" className="font-semibold text-accent-600 dark:text-accent-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default PremiumContentLock;
