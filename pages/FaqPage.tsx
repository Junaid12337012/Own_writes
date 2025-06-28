
import React, { useState } from 'react';
import { APP_NAME } from '../constants';
import { QuestionMarkCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQItemProps {
  question: string;
  children: React.ReactNode; // Answer
  isOpenInitially?: boolean;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children, isOpenInitially = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenInitially);

  return (
    <div className="border-b border-secondary-200 dark:border-primary-700">
      <dt>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between text-left text-primary-700 dark:text-primary-300 group p-6"
          aria-expanded={isOpen}
        >
          <span className="text-lg font-medium text-primary-800 dark:text-primary-100">{question}</span>
          <span className="ml-6 flex h-7 items-center">
            <ChevronDownIcon 
              className={`h-6 w-6 text-primary-500 dark:text-primary-400 group-hover:text-accent-500 dark:group-hover:text-accent-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
              aria-hidden="true" 
            />
          </span>
        </button>
      </dt>
      <dd className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="px-6 pb-6">
          <div className="prose prose-base dark:prose-invert max-w-none text-primary-700 dark:text-primary-300 leading-relaxed">
            {children}
          </div>
        </div>
      </dd>
    </div>
  );
};

const FaqPage: React.FC = () => {
  return (
    <div className="bg-secondary-50 dark:bg-primary-950 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto py-10">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-accent-100 dark:bg-primary-700 rounded-full mb-4">
            <QuestionMarkCircleIcon className="h-12 w-12 text-accent-500 dark:text-accent-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary-900 dark:text-primary-100">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-lg text-primary-700 dark:text-primary-300 max-w-2xl mx-auto">
            Find answers to common questions about {APP_NAME}. If you can't find what you're looking for, feel free to contact us.
          </p>
        </header>

        <div className="bg-white dark:bg-primary-800 rounded-xl shadow-xl dark:shadow-primary-700/30 overflow-hidden border border-secondary-200 dark:border-primary-700">
          <dl className="divide-y-0">
            <FAQItem question={`What is ${APP_NAME}?`} isOpenInitially={true}>
              <p>{APP_NAME} is a modern blogging platform designed to help you create, share, and discover amazing content. We leverage AI tools to enhance your writing experience.</p>
            </FAQItem>

            <FAQItem question="How do I create an account?">
              <p>You can create an account by clicking the "Sign Up" button in the navigation bar. You'll need to provide a username, email address, and password. Alternatively, you can use mock Google Sign-In for a quicker setup.</p>
            </FAQItem>

            <FAQItem question="Can I use AI to help write my blog posts?">
              <p>Yes! {APP_NAME} integrates with Google's Gemini models to offer several AI-powered features, including:</p>
              <ul>
                <li>Content suggestions to help you overcome writer's block.</li>
                <li>Generating featured images based on your post title or content.</li>
                <li>Creating blog post outlines based on a topic.</li>
                <li>Generating blog post ideas if you're looking for inspiration.</li>
              </ul>
              <p>Look for the AI-related buttons and features within the blog editor and dashboard.</p>
            </FAQItem>

            <FAQItem question="Is this platform free to use?">
              <p>Currently, {APP_NAME} is a mock application and is completely free to use for demonstration purposes. In a real-world scenario, there might be different pricing tiers or features.</p>
            </FAQItem>

            <FAQItem question="How is my data handled?">
              <p>Please refer to our <a href="#/privacy" className="text-accent-600 dark:text-accent-400 hover:underline">Privacy Policy</a> for detailed information on how we collect, use, and protect your data. Since this is a mock application, data is primarily stored in your browser's local storage for persistence during your session and for demo purposes.</p>
            </FAQItem>
            
            <FAQItem question="What kind of content can I post?">
              <p>You can post a wide variety of content, from personal stories and technical articles to tutorials and opinion pieces. Please ensure your content adheres to our <a href="#/terms" className="text-accent-600 dark:text-accent-400 hover:underline">Terms of Service</a> and community guidelines (which would be more detailed in a real application).</p>
            </FAQItem>
          </dl>
        </div>
        
        <div className="mt-12 text-center p-8 bg-white dark:bg-primary-800 rounded-xl shadow-lg border border-secondary-200 dark:border-primary-700">
          <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100">Still have questions?</h3>
          <p className="mt-2 text-primary-600 dark:text-primary-300">
            If you can't find the answer you're looking for, please don't hesitate to reach out to our support team.
          </p>
          <a
            href="#/contact"
            className="mt-4 inline-block text-accent-600 dark:text-accent-400 font-semibold hover:underline"
          >
            Contact Support &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
