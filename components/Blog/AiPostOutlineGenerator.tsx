import React, { useState } from 'react';
import { OutlineItem } from '../../types';
import { geminiService } from '../../services/geminiService';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import { useNotification } from '../../contexts/NotificationContext';
import { QueueListIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

interface AiPostOutlineGeneratorProps {
  onApplyOutline: (outlineHtml: string) => void;
  initialTitle?: string;
}

const AiPostOutlineGenerator: React.FC<AiPostOutlineGeneratorProps> = ({ onApplyOutline, initialTitle = '' }) => {
  const [topic, setTopic] = useState(initialTitle);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotification();

  const handleGenerateOutline = async () => {
    if (!topic.trim()) {
      addToast({ message: 'Please enter a topic or title for the outline.', type: 'warning' });
      return;
    }
    setLoading(true);
    setOutline([]);
    try {
      const generatedOutline = await geminiService.generatePostOutline(topic);
      if (generatedOutline.length > 0 && generatedOutline[0].text.toLowerCase().includes("error")) {
        addToast({ message: generatedOutline[0].text, type: 'error' });
        setOutline([]);
      } else if (generatedOutline.length === 0) {
        addToast({ message: 'AI did not return an outline. Try a different topic.', type: 'info'});
      }
      else {
        setOutline(generatedOutline);
      }
    } catch (error) {
      addToast({ message: 'Failed to generate post outline.', type: 'error' });
    }
    setLoading(false);
  };

  const convertOutlineItemToHtml = (item: OutlineItem): string => {
    let html = '';
    switch (item.type) {
      case 'h2':
        html += `<h2>${item.text}</h2>\n`;
        break;
      case 'h3':
        html += `<h3>${item.text}</h3>\n`;
        break;
      case 'h4':
        html += `<h4>${item.text}</h4>\n`;
        break;
      case 'point':
        html += `<li>${item.text}</li>\n`;
        break;
      default:
        html += `<p>${item.text}</p>\n`;
    }
    if (item.children && item.children.length > 0) {
      if (item.type !== 'point' && item.children.every(child => child.type === 'point')) {
        html += "<ul>\n";
        item.children.forEach(child => {
          html += convertOutlineItemToHtml(child);
        });
        html += "</ul>\n";
      } else {
         item.children.forEach(child => {
          html += convertOutlineItemToHtml(child);
        });
      }
    }
    return html;
  };
  
  const handleApplyFullOutline = () => {
    if (outline.length === 0) return;
    let fullHtml = "";
    outline.forEach(item => {
        fullHtml += convertOutlineItemToHtml(item);
    });
    onApplyOutline(fullHtml);
    addToast({ message: 'Outline added to content editor!', type: 'success' });
  };

  const renderOutlineItem = (item: OutlineItem, level: number = 0): React.ReactNode => {
    const indentClass = `ml-${level * 4}`; // Tailwind class for indentation: ml-0, ml-4, ml-8 etc.
    let content;
    switch (item.type) {
      case 'h2':
        content = <h2 className={`text-xl font-semibold text-primary-700 dark:text-primary-100 mt-3 mb-1 ${indentClass}`}>{item.text}</h2>;
        break;
      case 'h3':
        content = <h3 className={`text-lg font-semibold text-primary-600 dark:text-primary-200 mt-2 mb-1 ${indentClass}`}>{item.text}</h3>;
        break;
      case 'h4':
        content = <h4 className={`text-md font-semibold text-primary-600 dark:text-primary-300 mt-1 mb-1 ${indentClass}`}>{item.text}</h4>;
        break;
      case 'point':
        content = <li className={`text-primary-600 dark:text-primary-300 list-disc list-inside ${indentClass}`}>{item.text}</li>;
        break;
      default:
        content = <p className={`text-primary-600 dark:text-primary-300 ${indentClass}`}>{item.text}</p>;
    }

    return (
      <div key={Math.random()} className="py-1"> {/* Using random key for simplicity in display only */}
        {content}
        {item.children && item.children.length > 0 && (
          <div className={`${item.children.every(child => child.type === 'point') ? '' : 'pl-4'}`}>
            {item.children.map(child => renderOutlineItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 border border-purple-200 dark:border-primary-700 rounded-lg bg-purple-50 dark:bg-primary-700 space-y-3">
      <h4 className="text-md font-medium text-primary-700 dark:text-primary-100 flex items-center">
        <QueueListIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
        AI Blog Post Outline Generator
      </h4>
      <p className="text-xs text-primary-600 dark:text-primary-300">
        Enter your main topic or blog post title. The AI will generate a structured outline to help you start writing.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter blog post topic or title..."
          className="flex-grow mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-600 text-primary-700 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-600 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm placeholder-primary-500 dark:placeholder-primary-400"
        />
        <Button onClick={handleGenerateOutline} isLoading={loading} disabled={loading} variant="secondary" className="!bg-purple-600 hover:!bg-purple-700 !text-white dark:!bg-purple-500 dark:hover:!bg-purple-600 sm:w-auto w-full justify-center">
          {loading ? 'Generating...' : 'Generate Outline'}
        </Button>
      </div>

      {loading && <LoadingSpinner message="Crafting your outline..." size="sm" />}

      {!loading && outline.length > 0 && (
        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto p-3 bg-white dark:bg-primary-600 rounded-lg shadow">
          <h5 className="text-sm font-semibold text-primary-700 dark:text-primary-100 mb-2">Generated Outline:</h5>
          {outline.map(item => renderOutlineItem(item))}
          <div className="mt-4 pt-3 border-t border-secondary-200 dark:border-primary-500">
            <Button onClick={handleApplyFullOutline} variant="primary" size="sm" leftIcon={<PlusCircleIcon className="h-5 w-5"/>}>
              Add Full Outline to Content
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiPostOutlineGenerator;
