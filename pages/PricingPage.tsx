

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Common/Button';
import { APP_NAME } from '../constants';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../contexts/NotificationContext';

const PricingPage: React.FC = () => {
  const { user, subscribeUser, loadingAuth } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubscribeClick = async () => {
    if (!user) {
      addToast({ message: 'Please log in or sign up to subscribe.', type: 'info' });
      navigate('/login');
      return;
    }
    if (user.isSubscribed) {
      addToast({ message: 'You are already a premium subscriber.', type: 'info' });
      return;
    }
    // Simulate payment processing before calling subscribe
    addToast({ message: 'Processing your subscription...', type: 'info'});
    await new Promise(res => setTimeout(res, 1500)); // Mock payment delay
    await subscribeUser();
    navigate('/dashboard'); // Redirect to dashboard to see new status
  };

  const freeTierFeatures = [
    { text: 'Read all free articles', included: true },
    { text: 'Comment on posts', included: true },
    { text: 'Bookmark your favorite reads', included: true },
    { text: 'Access exclusive premium content', included: false },
    { text: 'Support your favorite creators directly', included: false },
    { text: 'Ad-free reading experience (mock)', included: false },
  ];

  const premiumTierFeatures = [
    { text: 'Read all free articles', included: true },
    { text: 'Comment on posts', included: true },
    { text: 'Bookmark your favorite reads', included: true },
    { text: 'Access exclusive premium content', included: true },
    { text: 'Support your favorite creators directly', included: true },
    { text: 'Ad-free reading experience (mock)', included: true },
  ];
  
  const FeatureListItem: React.FC<{ text: string, included: boolean }> = ({ text, included }) => (
    <li className="flex items-center">
      {included ? 
        <CheckCircleIcon className="h-5 w-5 text-accent-500 dark:text-accent-400 mr-2 flex-shrink-0" /> :
        <XCircleIcon className="h-5 w-5 text-red-400 dark:text-red-500 mr-2 flex-shrink-0" />
      }
      <span className={!included ? 'text-primary-600 dark:text-primary-400 line-through' : ''}>{text}</span>
    </li>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-primary-900 dark:text-primary-100">
          Choose Your Plan
        </h1>
        <p className="mt-3 text-lg text-primary-700 dark:text-primary-300">
          Unlock the full potential of {APP_NAME} with our Premium subscription.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan */}
        <div className="bg-white dark:bg-primary-800 p-8 rounded-lg shadow-lg border-2 border-secondary-200 dark:border-primary-700 flex flex-col">
          <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-100 mb-2">Free Reader</h2>
          <p className="text-4xl font-extrabold text-primary-800 dark:text-primary-100 mb-2">$0<span className="text-lg font-medium text-primary-600 dark:text-primary-400">/month</span></p>
          <p className="text-primary-600 dark:text-primary-400 mb-6 flex-grow">For casual readers who want to explore public content.</p>
          <ul className="space-y-3 mb-8">
            {freeTierFeatures.map(feature => <FeatureListItem key={feature.text} {...feature} />)}
          </ul>
          {user && !user.isSubscribed ? (
             <Button variant="secondary" size="lg" disabled className="w-full mt-auto cursor-default">Your Current Plan</Button>
          ) : user && user.isSubscribed ? (
             <Button variant="secondary" size="lg" disabled className="w-full mt-auto cursor-default">Not Active</Button>
          ) : (
            <Link to="/signup" className="w-full mt-auto">
              <Button variant="secondary" size="lg" className="w-full">Sign Up for Free</Button>
            </Link>
          )}
        </div>

        {/* Premium Plan */}
        <div className="bg-white dark:bg-primary-800 p-8 rounded-lg shadow-2xl border-2 border-accent-500 dark:border-accent-400 relative flex flex-col">
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-accent-500 dark:bg-accent-400 text-white dark:text-primary-800 px-4 py-1 rounded-full text-sm font-semibold shadow-md">Most Popular</div>
          <h2 className="text-2xl font-bold text-accent-500 dark:text-accent-400 mb-2 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6"/> Premium Subscriber
          </h2>
          <p className="text-4xl font-extrabold text-primary-800 dark:text-primary-100 mb-2">$9.99<span className="text-lg font-medium text-primary-600 dark:text-primary-400">/month</span></p>
          <p className="text-primary-600 dark:text-primary-400 mb-6 flex-grow">For dedicated readers who want full access and to support creators.</p>
          <ul className="space-y-3 mb-8">
            {premiumTierFeatures.map(feature => <FeatureListItem key={feature.text} {...feature} />)}
          </ul>
          {user && user.isSubscribed ? (
             <Button variant="primary" size="lg" disabled className="w-full mt-auto cursor-default">Your Current Plan</Button>
          ) : (
            <Button onClick={handleSubscribeClick} isLoading={loadingAuth} variant="primary" size="lg" className="w-full mt-auto">
                {user ? 'Upgrade to Premium' : 'Subscribe Now'}
            </Button>
          )}
        </div>
      </div>
      
      <div className="text-center mt-12 text-sm text-primary-600 dark:text-primary-400">
        <p>This is a mock pricing page. No real payment will be processed.</p>
        <p>Subscriptions are for demonstration purposes only.</p>
      </div>
    </div>
  );
};

export default PricingPage;
