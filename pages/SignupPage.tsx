import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Common/Button';
import { APP_NAME } from '../constants';
import { useNotification } from '../contexts/NotificationContext';
import { UserPlusIcon } from '@heroicons/react/24/outline';


const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast({ message: "Passwords do not match!", type: 'error' });
      return;
    }
    setLoading(true);
    const success = await signup(username, email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-15rem)] flex items-center justify-center bg-white dark:bg-primary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-primary-800 p-8 sm:p-10 rounded-xl shadow-xl dark:shadow-primary-700/50 border border-secondary-200 dark:border-primary-700">
        <div className="text-center">
          <UserPlusIcon className="mx-auto h-10 w-10 text-accent-400 dark:text-accent-500" />
          <h2 className="mt-5 text-center text-3xl font-heading font-bold text-primary-800 dark:text-primary-100">
            Create your account for {APP_NAME}
          </h2>
          <p className="mt-2 text-center text-sm text-primary-600 dark:text-primary-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent-500 dark:text-accent-400 hover:text-accent-600 dark:hover:text-accent-300 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 placeholder-primary-500 dark:placeholder-primary-400 text-primary-800 dark:text-primary-100 rounded-t-lg focus:outline-none focus:ring-1 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 placeholder-primary-500 dark:placeholder-primary-400 text-primary-800 dark:text-primary-100 focus:outline-none focus:ring-1 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 focus:z-10 sm:text-sm"
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
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 placeholder-primary-500 dark:placeholder-primary-400 text-primary-800 dark:text-primary-100 focus:outline-none focus:ring-1 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 placeholder-primary-500 dark:placeholder-primary-400 text-primary-800 dark:text-primary-100 rounded-b-lg focus:outline-none focus:ring-1 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={loading} disabled={loading} size="md">
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
