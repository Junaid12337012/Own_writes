import React from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
  active: boolean;
}

interface TableOfContentsProps {
  items: TocItem[];
  isMobile?: boolean;
  onLinkClick?: () => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ items, isMobile = false, onLinkClick }) => {
  if (items.length === 0) {
    return null;
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const baseLinkClasses = 'block hover:text-accent-600 dark:hover:text-accent-400 transition-colors duration-200 py-1';
  const activeLinkClasses = 'text-accent-500 dark:text-accent-400 font-semibold';
  const inactiveLinkClasses = 'text-primary-600 dark:text-primary-400';

  const renderItem = (item: TocItem) => {
    let paddingClass = '';
    if (item.level === 3) paddingClass = 'pl-4';
    if (item.level === 4) paddingClass = 'pl-8';

    return (
      <a
        key={item.id}
        href={`#${item.id}`}
        onClick={(e) => handleLinkClick(e, item.id)}
        className={`${baseLinkClasses} ${item.active ? activeLinkClasses : inactiveLinkClasses} ${paddingClass}`}
      >
        {item.text}
      </a>
    );
  };
  
  if (isMobile) {
    return (
        <nav className="space-y-1 text-sm">
            {items.map(renderItem)}
        </nav>
    );
  }

  return (
    <div className="sticky top-24">
      <h3 className="text-sm font-semibold uppercase text-primary-700 dark:text-primary-200 tracking-wider mb-3">
        On this page
      </h3>
      <nav className="space-y-1 text-sm border-l-2 border-secondary-200 dark:border-primary-700">
        {items.map(item => {
           let paddingClass = 'pl-4';
           if (item.level === 3) paddingClass = 'pl-8';
           if (item.level === 4) paddingClass = 'pl-12';

           return (
            <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleLinkClick(e, item.id)}
                className={`${baseLinkClasses} ${paddingClass} border-l-2 transition-colors duration-200
                    ${item.active 
                        ? 'border-accent-500 dark:border-accent-400 text-accent-500 dark:text-accent-400 font-semibold' 
                        : 'border-transparent hover:border-secondary-300 dark:hover:border-primary-600 text-primary-600 dark:text-primary-400'}`}
              >
                {item.text}
              </a>
           )
        })}
      </nav>
    </div>
  );
};

export default TableOfContents;
