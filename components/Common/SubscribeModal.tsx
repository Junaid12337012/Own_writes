import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { useNotification } from '../../contexts/NotificationContext';

interface SubscribeModalProps {
  onClose: () => void;
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotification();
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      addToast({ message: 'Please enter a valid email address.', type: 'warning' });
      return;
    }
    setLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    addToast({ message: `Successfully subscribed ${email}! (Mock)`, type: 'success' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-primary-800 dark:bg-black bg-opacity-75 dark:bg-opacity-75 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-primary-800 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md relative transform transition-all duration-300 ease-out scale-100 border border-secondary-200 dark:border-primary-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 transition-colors"
          aria-label="Close subscribe modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-100 mb-2 text-center">Subscribe to Our Newsletter!</h2>
        <p className="text-primary-600 dark:text-primary-300 mb-6 text-center text-sm">Get the latest posts and updates delivered straight to your inbox.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subscribe-email" className="sr-only">Email address</label>
            <input
              ref={inputRef}
              id="subscribe-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="appearance-none block w-full px-3.5 py-2.5 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 placeholder-primary-500 dark:placeholder-primary-400 text-primary-800 dark:text-primary-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm"
            />
          </div>
          <Button type="submit" className="w-full" isLoading={loading} disabled={loading} size="md">
            {loading ? 'Subscribing...' : 'Subscribe Now'}
          </Button>
        </form>
        <p className="text-xs text-primary-600 dark:text-primary-400 text-center mt-4">We respect your privacy. Unsubscribe at any time (mock).</p>
      </div>
    </div>
  );
};

export default SubscribeModal;
