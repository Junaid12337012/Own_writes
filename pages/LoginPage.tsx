import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Common/Button';
import { APP_NAME, GOOGLE_CLIENT_ID } from '../constants';
import { useNotification } from '../contexts/NotificationContext';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = () => {
    addToast({ message: 'Mock Google Sign-In: In a real app, this would redirect to Google.', type: 'info' });
    setTimeout(async () => {
        const success = await login('googleuser@example.com', 'fakepassword'); 
        if (success) {
            navigate('/dashboard');
        } else {
            addToast({ message: 'Mock Google Sign-In failed. Ensure mock user exists.', type: 'error' });
        }
    }, 1000);
  };


  return (
    <div className="min-h-[calc(100vh-15rem)] flex items-center justify-center bg-white dark:bg-primary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-primary-800 p-8 sm:p-10 rounded-xl shadow-xl dark:shadow-primary-700/50 border border-secondary-200 dark:border-primary-700">
        <div className="text-center">
          <LockClosedIcon className="mx-auto h-10 w-10 text-accent-400 dark:text-accent-500" />
          <h2 className="mt-5 text-center text-3xl font-heading font-bold text-primary-800 dark:text-primary-100">
            Sign in to {APP_NAME}
          </h2>
          <p className="mt-2 text-center text-sm text-primary-600 dark:text-primary-400">
            Or{' '}
            <Link to="/signup" className="font-medium text-accent-500 dark:text-accent-400 hover:text-accent-600 dark:hover:text-accent-300 hover:underline">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 placeholder-primary-500 dark:placeholder-primary-400 text-primary-800 dark:text-primary-100 rounded-t-lg focus:outline-none focus:ring-1 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password_DO_NOT_USE" className="sr-only">Password</label>
              <input
                id="password_DO_NOT_USE"
                name="password_DO_NOT_USE"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 placeholder-primary-500 dark:placeholder-primary-400 text-primary-800 dark:text-primary-100 rounded-b-lg focus:outline-none focus:ring-1 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              {/* <a href="#" className="font-medium text-accent-500 hover:text-accent-600">
                Forgot your password? (Not implemented)
              </a> */}
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={loading} disabled={loading} size="md">
              Sign in
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-300 dark:border-primary-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-primary-800 text-primary-600 dark:text-primary-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              onClick={handleGoogleSignIn}
              variant="secondary" 
              className="w-full"
              size="md"
              leftIcon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56,12.25C22.56,11.47 22.49,10.72 22.35,10H12V14.5H18.36C18.04,16.03 17.27,17.31 16.07,18.1V20.65H19.83C21.66,19 22.56,16.83 22.56,14.25V12.25Z" />
                  <path d="M12,23C14.97,23 17.45,22.04 19.83,20.65L16.07,18.1C15.05,18.81 13.66,19.25 12,19.25C9.05,19.25 6.56,17.32 5.53,14.75H1.69V17.31C3.47,20.72 7.42,23 12,23Z" />
                  <path d="M5.53,14.75C5.32,14.15 5.22,13.5 5.22,12.88C5.22,12.25 5.32,11.63 5.53,11.03V8.47H1.69C0.96,9.87 0.5,11.34 0.5,12.88C0.5,14.41 0.96,15.89 1.69,17.31L5.53,14.75Z" />
                  <path d="M12,5.25C13.79,5.25 15.32,5.87 16.5,7L19.92,3.58C17.45,1.53 14.97,0.5 12,0.5C7.42,0.5 3.47,2.78 1.69,6.19L5.53,8.75C6.56,6.18 9.05,4.25 12,4.25V5.25Z" />
                </svg>
              }
            >
              Sign in with Google (Mock)
            </Button>
            <p className="mt-2 text-xs text-primary-600 dark:text-primary-500 text-center">
              Client ID: {GOOGLE_CLIENT_ID.substring(0,15)}... (Mock Implementation)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
