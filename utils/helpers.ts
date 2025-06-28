
// Utility function to simulate delay
export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Generate a simple unique ID (for mock data)
export const generateId = (): string => Math.random().toString(36).substr(2, 9);

// Format date string (example)
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return "Invalid Date";
  }
};

// Sanitize HTML content (basic example, use a robust library in production)
export const sanitizeHTML = (htmlString: string): string => {
  const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  // Remove script tags
  let sanitized = htmlString.replace(SCRIPT_REGEX, "");
  // Add more sanitization rules as needed
  // e.g. for on* attributes: sanitized = sanitized.replace(/on\w+="[^"]*"/g, "");
  return sanitized;
};

// Create an excerpt from text
export const createExcerpt = (text: string, maxLength: number = 150): string => {
  if (!text) return '';
  // Remove HTML tags for excerpt
  const plainText = text.replace(/<[^>]+>/g, '');
  if (plainText.length <= maxLength) {
    return plainText;
  }
  return plainText.substring(0, maxLength).trim() + '...';
};

// Estimate reading time from HTML content
export const estimateReadingTime = (htmlContent: string): string => {
  if (!htmlContent) return '1 min read'; // Default for empty content
  // Strip HTML tags and normalize multiple spaces to single, then trim.
  const plainText = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s\s+/g, ' ').trim();
  const words = plainText.split(' ').filter(word => word !== '').length;
  const WPM = 225; // Average words per minute
  if (words === 0) return '1 min read';
  const minutes = Math.ceil(words / WPM);
  return `${minutes} min read`;
};
