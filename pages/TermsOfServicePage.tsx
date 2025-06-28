
import React from 'react';
import { APP_NAME } from '../constants';
import { ShieldCheckIcon, UserGroupIcon, PencilSquareIcon, NoSymbolIcon, InformationCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold text-primary-800 dark:text-primary-100 mb-4 flex items-start">
      <Icon className="h-7 w-7 text-accent-500 dark:text-accent-400 mr-4 mt-1 flex-shrink-0" />
      <span>{title}</span>
    </h2>
    <div className="prose prose-lg dark:prose-invert max-w-none text-primary-700 dark:text-primary-300 pl-11">
      {children}
    </div>
  </section>
);

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="bg-secondary-50 dark:bg-primary-950 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto py-10">
        <header className="text-center mb-12">
          <ShieldCheckIcon className="h-16 w-16 text-accent-500 dark:text-accent-400 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary-900 dark:text-primary-100">
            Terms of Service
          </h1>
          <p className="mt-3 text-lg text-primary-700 dark:text-primary-300">
            The rules for using our platform.
          </p>
           <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="bg-white dark:bg-primary-800 p-8 sm:p-12 rounded-2xl shadow-xl dark:shadow-primary-700/30 border border-secondary-200 dark:border-primary-700">
          <Section title="1. Acceptance of Terms" icon={InformationCircleIcon}>
            <p>By accessing or using {APP_NAME} (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.</p>
            <p>This is a placeholder document. The actual terms would be much more detailed and legally reviewed.</p>
          </Section>

          <Section title="2. User Accounts" icon={UserGroupIcon}>
            <p>When you create an account, you must provide accurate information. You are responsible for safeguarding your password and for any activities or actions under your account.</p>
          </Section>

          <Section title="3. Content Ownership and Responsibility" icon={PencilSquareIcon}>
            <p>Our Service allows you to post content. You are responsible for the Content that you post, including its legality, reliability, and appropriateness. By posting, you grant us the license to use and distribute it on the Service. You retain all of your rights to your Content.</p>
          </Section>
          
          <Section title="4. AI-Powered Features" icon={SparklesIcon}>
            <p>The Service may include features powered by artificial intelligence ("AI Features"). These are for assistance only. You are solely responsible for reviewing and verifying any content generated or suggested by AI Features before publishing. We make no warranties regarding the accuracy or reliability of AI-generated content.</p>
          </Section>

          <Section title="5. Prohibited Uses" icon={NoSymbolIcon}>
            <p>You agree not to use the Service for any unlawful purpose, to solicit others to perform or participate in any unlawful acts, to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances.</p>
          </Section>

          <Section title="6. Termination" icon={NoSymbolIcon}>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </Section>
        </div>
        <div className="mt-12 text-center text-sm text-primary-600 dark:text-primary-400">
          This is a template Terms of Service. Please consult with a legal professional.
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
