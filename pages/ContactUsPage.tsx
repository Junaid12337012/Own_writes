
import React, { useState } from 'react';
import { APP_NAME } from '../constants';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Button from '../components/Common/Button';
import { useNotification } from '../contexts/NotificationContext';

const ContactUsPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useNotification();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    addToast({ message: "Thank you for your message! (This is a mock submission)", type: 'success' });
    setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
  };

  return (
    <div className="bg-secondary-50 dark:bg-primary-950 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto py-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary-900 dark:text-primary-100">
            Get in Touch
          </h1>
          <p className="mt-3 text-lg text-primary-700 dark:text-primary-300 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have a question, feedback, or just want to say hello, our team is here for you.
          </p>
        </header>

        <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-2xl dark:shadow-primary-700/30 overflow-hidden border border-secondary-200 dark:border-primary-700">
          <div className="grid md:grid-cols-2">
            {/* Contact Form Section */}
            <section className="p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-100 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-primary-700 dark:text-primary-300">Full Name</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required 
                         className="mt-1 block w-full px-3 py-2.5 border border-secondary-300 dark:border-primary-600 bg-secondary-50 dark:bg-primary-700/50 text-primary-800 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm placeholder-primary-500 dark:placeholder-primary-400" placeholder="John Doe"/>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary-700 dark:text-primary-300">Email Address</label>
                  <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required
                         className="mt-1 block w-full px-3 py-2.5 border border-secondary-300 dark:border-primary-600 bg-secondary-50 dark:bg-primary-700/50 text-primary-800 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm placeholder-primary-500 dark:placeholder-primary-400" placeholder="you@example.com"/>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-primary-700 dark:text-primary-300">Subject</label>
                  <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleInputChange} required
                         className="mt-1 block w-full px-3 py-2.5 border border-secondary-300 dark:border-primary-600 bg-secondary-50 dark:bg-primary-700/50 text-primary-800 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm placeholder-primary-500 dark:placeholder-primary-400" placeholder="Question about..."/>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-primary-700 dark:text-primary-300">Message</label>
                  <textarea name="message" id="message" rows={4} value={formData.message} onChange={handleInputChange} required
                            className="mt-1 block w-full px-3 py-2.5 border border-secondary-300 dark:border-primary-600 bg-secondary-50 dark:bg-primary-700/50 text-primary-800 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm placeholder-primary-500 dark:placeholder-primary-400" placeholder="Your message here..."></textarea>
                </div>
                <div>
                  <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className="w-full" size="lg">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </section>
            
            {/* Contact Information Section */}
            <section className="bg-gradient-to-br from-primary-700 to-primary-800 dark:from-primary-800 dark:to-primary-900 text-white p-8 sm:p-10 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <p className="text-primary-300 leading-relaxed mb-8">
                Find us at our office, drop us an email, or give us a call. We're here to help.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPinIcon className="h-6 w-6 text-accent-400 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold">Our Office (Placeholder)</h3>
                    <p className="text-primary-300">123 Blogger Lane, Suite 100<br />Innovation City, WEB 54321</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <EnvelopeIcon className="h-6 w-6 text-accent-400 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold">Email Us</h3>
                    <a href="mailto:support@example.com" className="text-accent-300 hover:text-white hover:underline transition-colors">support@example-geminiblogger.com</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <PhoneIcon className="h-6 w-6 text-accent-400 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold">Call Us (Placeholder)</h3>
                    <p className="text-primary-300">(555) 123-4567</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
