

import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import BlogDetailPageWrapper from './pages/BlogDetailPageWrapper';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import CreateBlogPage from './pages/CreateBlogPage';
import EditBlogPageWrapper from './pages/EditBlogPageWrapper';
import AuthorPageWrapper from './pages/AuthorPageWrapper';
import CategoryPageWrapper from './pages/CategoryPageWrapper';
import AllCategoriesPage from './pages/AllCategoriesPage'; // New Import
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './contexts/AuthContext';
import NotificationsDisplay from './components/Common/NotificationsDisplay';
import { UserRole } from './types';
import AboutPage from './pages/AboutPage';
import AllBlogsPage from './pages/AllBlogsPage';
import TermsOfServicePage from './pages/TermsOfServicePage'; 
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'; 
import FaqPage from './pages/FaqPage'; 
import ContactUsPage from './pages/ContactUsPage'; 
import PricingPage from './pages/PricingPage';
import ScrollToTop from './components/Common/ScrollToTop';
import BackToTopButton from './components/Common/BackToTopButton'; // New Import
import PostAnalyticsPage from './pages/PostAnalyticsPage';
import { useNotification } from './contexts/NotificationContext';


const App: React.FC = () => {
  const { user, loadingAuth } = useAuth();
  const { fetchNotificationsForUser } = useNotification();

  useEffect(() => {
    fetchNotificationsForUser(user?.id ?? null);
  }, [user, fetchNotificationsForUser]);


  if (loadingAuth) {
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-primary-900"><div className="text-xl text-accent-500 dark:text-accent-400">Loading application...</div></div>;
  }

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-secondary-50 dark:bg-primary-900"> 
        <Navbar />
        <NotificationsDisplay />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:pb-12">
          <div className="page-content-enter">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:categoryName" element={<CategoryPageWrapper />} />
              <Route path="/categories" element={<AllCategoriesPage />} /> 
              <Route path="/blogs" element={<AllBlogsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/blog/:id" element={<BlogDetailPageWrapper />} />
              <Route path="/author/:authorId" element={<AuthorPageWrapper />} />
              
              <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
              <Route path="/blog/create" element={user ? (user.role !== UserRole.USER ? <CreateBlogPage /> : <Navigate to="/" />) : <Navigate to="/login" />} />
              <Route path="/blog/edit/:id" element={user ? <EditBlogPageWrapper /> : <Navigate to="/login" />} />
              <Route path="/dashboard/posts/:id/analytics" element={user ? <PostAnalyticsPage /> : <Navigate to="/login" />} />
              
              <Route 
                path="/admin/*" 
                element={user && user.role === UserRole.ADMIN ? <AdminPage /> : <Navigate to="/" />} 
              />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>
        <Footer />
        <BackToTopButton /> {/* Added BackToTopButton */}
      </div>
    </HashRouter>
  );
};

export default App;