
import React from 'react';
import { APP_NAME } from '../constants';
import { ShieldExclamationIcon, VariableIcon, ServerIcon, UserCircleIcon, NoSymbolIcon, SparklesIcon } from '@heroicons/react/24/outline';

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

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-secondary-50 dark:bg-primary-950 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto py-10">
        <header className="text-center mb-12">
          <ShieldExclamationIcon className="h-16 w-16 text-accent-500 dark:text-accent-400 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary-900 dark:text-primary-100">
            Privacy Policy
          </h1>
          <p className="mt-3 text-lg text-primary-700 dark:text-primary-300">
            Your privacy is important to us.
          </p>
          <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="bg-white dark:bg-primary-800 p-8 sm:p-12 rounded-2xl shadow-xl dark:shadow-primary-700/30 border border-secondary-200 dark:border-primary-700">
          <Section title="1. Introduction" icon={UserCircleIcon}>
            <p>{APP_NAME} ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services (collectively, the "Service").</p>
            <p>Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.</p>
            <p>This is a placeholder document. The actual policy would be much more detailed and legally reviewed.</p>
          </Section>

          <Section title="2. Information We Collect" icon={VariableIcon}>
            <p>We may collect information about you in a variety of ways. The information we may collect on the Service includes:</p>
            <p><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and demographic information that you voluntarily give to us when you register with the Service.</p>
            <p><strong>Content Data:</strong> Any content you create, upload, or share on the platform, including blog posts, comments, and images.</p>
            <p><strong>Derivative Data (Mock):</strong> In a real app, information servers automatically collect like IP address, browser type, etc. We do not collect this in the demo.</p>
          </Section>

          <Section title="3. How We Use Your Information" icon={VariableIcon}>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to create and manage your account, enable user-to-user communications, and monitor usage to improve the Service.</p>
          </Section>
          
          <Section title="4. AI-Powered Features and Data" icon={SparklesIcon}>
              <p>When you use AI-powered features, such as those utilizing Google's Gemini models, certain data may be processed by these AI models.</p>
              <p>The text prompts you provide and the content you input will be sent to the respective AI service providers (e.g., Google) to generate the requested output. We recommend reviewing the privacy policies of these third-party AI service providers to understand how they handle your data.</p>
          </Section>

          <Section title="5. Data Security" icon={ServerIcon}>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. In this mock application, data is stored in-browser and is not representative of a production security environment.</p>
          </Section>
          
          <Section title="6. Policy for Children" icon={NoSymbolIcon}>
            <p>We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us.</p>
          </Section>

          <Section title="7. Contact Us" icon={UserCircleIcon}>
            <p>If you have questions or comments about this Privacy Policy, please contact us through our <a href="#/contact" className="text-accent-500 dark:text-accent-400 hover:underline">Contact Page</a>.</p>
          </Section>
        </div>
        
        <div className="mt-12 text-center text-sm text-primary-600 dark:text-primary-400">
          This is a template Privacy Policy. Please consult with a legal professional.
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
