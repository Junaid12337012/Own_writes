
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
import { SparklesIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../Common/LoadingSpinner';

interface AiEditorToolbarProps {
  position: { top: number; left: number };
  onAction: (newText: string) => void;
  selectedTextRange: Range | null;
}

type Tone = 'professional' | 'casual' | 'witty' | 'confident';

const AiEditorToolbar = React.forwardRef<HTMLDivElement, AiEditorToolbarProps>(
  ({ position, onAction, selectedTextRange }, ref) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showToneMenu, setShowToneMenu] = useState<boolean>(false);
    const toneMenuRef = useRef<HTMLDivElement>(null);

    const getSelectedText = (): string => {
        return selectedTextRange ? selectedTextRange.toString() : '';
    }

    const handleAction = async (action: 'improve' | { type: 'tone', tone: Tone } | 'summarize') => {
      const selectedText = getSelectedText();
      if (!selectedText) return;

      setIsLoading(true);
      setShowToneMenu(false); // Close menu after selection
      try {
        let result = '';
        if (action === 'improve') {
          result = await geminiService.improveWriting(selectedText);
        } else if (typeof action === 'object' && action.type === 'tone') {
          result = await geminiService.changeTone(selectedText, action.tone);
        } else if (action === 'summarize') {
          result = await geminiService.summarizeSelection(selectedText);
        }
        onAction(result);
      } catch (error) {
        console.error('AI Toolbar action failed', error);
        // Maybe show a toast notification here
      } finally {
        setIsLoading(false);
      }
    };
    
    // Close tone menu on outside click
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (toneMenuRef.current && !toneMenuRef.current.contains(event.target as Node)) {
                setShowToneMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isLoading) {
      return (
        <div ref={ref} style={{ top: `${position.top}px`, left: `${position.left}px`, transform: 'translateX(-50%)' }} className="fixed z-[95] bg-slate-800 text-white px-3 py-2 rounded-md shadow-lg flex items-center">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm">AI is working...</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        style={{ top: `${position.top}px`, left: `${position.left}px`, transform: 'translateX(-50%)' }}
        className="fixed z-[95] bg-slate-800 text-slate-100 rounded-md shadow-lg flex items-center"
      >
        <button className="px-3 py-1.5 hover:bg-slate-700 rounded-l-md text-sm flex items-center" onClick={() => handleAction('improve')}>
          <SparklesIcon className="h-4 w-4 mr-1.5 text-purple-400" />
          Improve
        </button>
        <div className="w-px h-5 bg-slate-600"></div>
        <div className="relative" ref={toneMenuRef}>
             <button className="px-3 py-1.5 hover:bg-slate-700 text-sm flex items-center" onClick={() => setShowToneMenu(!showToneMenu)}>
                Change Tone
                <ChevronDownIcon className="h-4 w-4 ml-1" />
            </button>
            {showToneMenu && (
                <div className="absolute bottom-full mb-1 left-0 bg-slate-700 rounded-md shadow-lg text-left overflow-hidden w-32">
                    {(['professional', 'casual', 'witty', 'confident'] as Tone[]).map(tone => (
                        <button key={tone} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-600" onClick={() => handleAction({ type: 'tone', tone })}>
                            {tone.charAt(0).toUpperCase() + tone.slice(1)}
                        </button>
                    ))}
                </div>
            )}
        </div>
        <div className="w-px h-5 bg-slate-600"></div>
        <button className="px-3 py-1.5 hover:bg-slate-700 rounded-r-md text-sm" onClick={() => handleAction('summarize')}>
          Summarize
        </button>
      </div>
    );
  }
);

export default AiEditorToolbar;
