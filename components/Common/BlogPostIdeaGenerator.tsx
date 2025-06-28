import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { geminiService } from '../../services/geminiService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { useNotification } from '../../contexts/NotificationContext';
import { LightBulbIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const BlogPostIdeaGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleGenerateIdeas = async () => {
    if (!topic.trim()) {
      addToast({ message: 'Please enter a topic or keyword.', type: 'warning' });
      return;
    }
    setLoading(true);
    setIdeas([]); // Clear previous ideas
    try {
      const generatedIdeas = await geminiService.generateBlogPostIdeas(topic);
      if (generatedIdeas.length > 0 && (generatedIdeas[0].startsWith("Error:") || generatedIdeas[0].includes("unavailable") || generatedIdeas[0].includes("API Key not valid"))) {
        addToast({ message: generatedIdeas[0], type: 'error' });
        setIdeas([]);
      } else {
        setIdeas(generatedIdeas);
        if (generatedIdeas.length === 0) {
            addToast({ message: 'No ideas generated for this topic. Try being more specific or broader.', type: 'info' });
        }
      }
    } catch (error) {
      addToast({ message: 'Failed to generate blog post ideas.', type: 'error' });
    }
    setLoading(false);
  };

  const handleUseIdea = (idea: string) => {
    navigate(`/blog/create?title=${encodeURIComponent(idea)}`);
  };

  return (
    <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-xl space-y-4 border border-secondary-200 dark:border-primary-700">
      <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-200 flex items-center">
        <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
        Blog Post Idea Generator
      </h3>
      <p className="text-sm text-primary-600 dark:text-primary-300">
        Feeling stuck? Enter a topic or keyword below and let AI spark your creativity!
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Sustainable Living, AI in Art, Travel Tips"
          className="flex-grow mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm placeholder-primary-500 dark:placeholder-primary-400"
        />
        <Button onClick={handleGenerateIdeas} isLoading={loading} disabled={loading} className="sm:w-auto w-full justify-center">
          {loading ? 'Generating...' : 'Generate Ideas'}
        </Button>
      </div>

      {loading && <LoadingSpinner message="Thinking up some brilliant ideas..." size="sm" />}

      {!loading && ideas.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-md font-medium text-primary-700 dark:text-primary-200">Here are some ideas:</h4>
          <ul className="list-disc list-inside space-y-2 pl-2">
            {ideas.map((idea, index) => (
              <li key={index} className="text-primary-600 dark:text-primary-300 flex justify-between items-center group">
                <span>{idea}</span>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleUseIdea(idea)} 
                    className="opacity-0 group-hover:opacity-100 transition-opacity !text-accent-500 dark:!text-accent-400 hover:!text-accent-600 dark:hover:!text-accent-300"
                    title="Use this idea for a new post"
                >
                    <PencilSquareIcon className="h-4 w-4 mr-1"/> Use Idea
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BlogPostIdeaGenerator;
