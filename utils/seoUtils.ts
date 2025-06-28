import { APP_NAME, DEFAULT_FEATURED_IMAGE } from '../constants';

const BASE_URL = window.location.origin; // Or your specific app domain
const DEFAULT_OG_IMAGE = `${BASE_URL}${DEFAULT_FEATURED_IMAGE.startsWith('/') ? DEFAULT_FEATURED_IMAGE : '/' + DEFAULT_FEATURED_IMAGE}`; // Ensure it's an absolute URL

interface PageMeta {
  title?: string;
  description?: string;
  imageUrl?: string | null;
  url?: string; // Full URL of the current page
  keywords?: string;
  author?: string;
}

const getOrCreateMetaTag = (nameOrProperty: string, value: string, isProperty: boolean = false): HTMLMetaElement => {
  const selector = isProperty ? `meta[property="${value}"]` : `meta[name="${value}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement;
  if (!element) {
    element = document.createElement('meta');
    if (isProperty) {
      element.setAttribute('property', value);
    } else {
      element.setAttribute('name', value);
    }
    document.head.appendChild(element);
  }
  return element;
};

const getOrCreateLinkTag = (rel: string, hrefAttribute: string = 'href'): HTMLLinkElement => {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  return element;
};


export const setDocumentTitle = (title: string) => {
  document.title = `${title} | ${APP_NAME}`;
};

export const updatePageMeta = ({
  title,
  description,
  imageUrl,
  url,
  keywords,
  author,
}: PageMeta) => {
  if (title) {
    setDocumentTitle(title);
    getOrCreateMetaTag('og:title', 'og:title', true).content = `${title} | ${APP_NAME}`;
    getOrCreateMetaTag('twitter:title', 'twitter:title').content = `${title} | ${APP_NAME}`;
  }

  if (description) {
    getOrCreateMetaTag('description', 'description').content = description;
    getOrCreateMetaTag('og:description', 'og:description', true).content = description;
    getOrCreateMetaTag('twitter:description', 'twitter:description').content = description;
  }

  const effectiveImageUrl = imageUrl || DEFAULT_OG_IMAGE;
  if (effectiveImageUrl) {
    getOrCreateMetaTag('og:image', 'og:image', true).content = effectiveImageUrl.startsWith('http') ? effectiveImageUrl : `${BASE_URL}${effectiveImageUrl.startsWith('/') ? '' : '/'}${effectiveImageUrl}`;
    getOrCreateMetaTag('twitter:image', 'twitter:image').content = effectiveImageUrl.startsWith('http') ? effectiveImageUrl : `${BASE_URL}${effectiveImageUrl.startsWith('/') ? '' : '/'}${effectiveImageUrl}`;
  }
  
  const currentUrl = url ? (url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`) : window.location.href;
  getOrCreateMetaTag('og:url', 'og:url', true).content = currentUrl;
  getOrCreateLinkTag('canonical').href = currentUrl;


  if (keywords) {
    getOrCreateMetaTag('keywords', 'keywords').content = keywords;
  }
  if (author) {
     getOrCreateMetaTag('author', 'author').content = author;
  }
};

export const injectJSONLD = (schema: object) => {
  removeJSONLD(); // Remove old one first
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'json-ld-structured-data';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
};

export const removeJSONLD = () => {
  const existingScript = document.getElementById('json-ld-structured-data');
  if (existingScript) {
    document.head.removeChild(existingScript);
  }
};

export const updateThemeColorMeta = (color: string) => {
    const metaThemeColor = document.getElementById('theme-color-meta') as HTMLMetaElement;
    if (metaThemeColor) {
        metaThemeColor.content = color;
    } else {
        const newMeta = document.createElement('meta');
        newMeta.id = 'theme-color-meta';
        newMeta.name = 'theme-color';
        newMeta.content = color;
        document.head.appendChild(newMeta);
    }
};

// Site defaults - can be called on initial load or from HomePage
export const setSiteDefaults = () => {
  updatePageMeta({
    title: APP_NAME,
    description: "A full-featured blogging platform with AI-powered content tools. Discover, create, and share your stories.",
    imageUrl: DEFAULT_OG_IMAGE, // Use a site-wide logo or banner if available
    url: BASE_URL + '/',
    keywords: `blog, blogging, articles, ${APP_NAME}, ai content, writing platform, content creation, technology, community`,
    author: `${APP_NAME} Team`
  });
  injectJSONLD({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": BASE_URL + '/',
    "name": APP_NAME,
    "description": "A full-featured blogging platform with AI-powered content tools. Discover, create, and share your stories.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
    // "publisher": { // Add if you have a clear publisher/organization
    //   "@type": "Organization",
    //   "name": APP_NAME,
    //   "logo": {
    //     "@type": "ImageObject",
    //     "url": `${BASE_URL}/path-to-your-logo.png` 
    //   }
    // }
  });
};