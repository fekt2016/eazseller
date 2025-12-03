import { useEffect } from 'react';

/**
 * Dynamic SEO and Meta Tag Management Hook for EazSeller
 * Automatically manages document title, meta tags, Open Graph, and Twitter Cards
 * Updates dynamically when data becomes available
 * 
 * @param {Object} config - SEO configuration
 * @param {string} config.title - Static title (used as fallback)
 * @param {string} config.dynamicTitle - Dynamic title (used when data is available)
 * @param {string} config.description - Static description (used as fallback)
 * @param {string} config.defaultTitle - Default title when no data is available
 * @param {string} config.defaultDescription - Default description when no data is available
 */
export const useDynamicPageTitle = (config = {}) => {
  useEffect(() => {
    // Safety check for SSR
    if (typeof document === 'undefined') return;

    const {
      title = '',
      dynamicTitle = '',
      description = '',
      defaultTitle = 'EazSeller Dashboard',
      defaultDescription = 'Manage your products and orders',
    } = config;

    // Determine final title: dynamicTitle > title > defaultTitle
    const finalTitle = dynamicTitle || title || defaultTitle;
    
    // Determine final description: description > defaultDescription
    const finalDescription = description || defaultDescription;

    // Set document title
    if (finalTitle) {
      document.title = finalTitle;
    }

    // Helper function to update or create meta tags
    const updateOrCreateMeta = (selector, content, attr = 'name') => {
      if (!content) return;
      
      // Try to find existing meta tag
      const existingTag = document.querySelector(
        attr === 'property' 
          ? `meta[property="${selector}"]` 
          : `meta[name="${selector}"]`
      );

      if (existingTag) {
        // Update existing tag
        existingTag.setAttribute('content', content);
      } else {
        // Create new tag
        const tag = document.createElement('meta');
        if (attr === 'property') {
          tag.setAttribute('property', selector);
        } else {
          tag.setAttribute('name', selector);
        }
        tag.setAttribute('content', content);
        tag.setAttribute('data-dynamic', 'true');
        document.head.appendChild(tag);
      }
    };

    // Update meta description
    updateOrCreateMeta('description', finalDescription);

    // Open Graph tags
    updateOrCreateMeta('og:title', finalTitle, 'property');
    updateOrCreateMeta('og:description', finalDescription, 'property');

    // Twitter Card tags
    updateOrCreateMeta('twitter:title', finalTitle);
    updateOrCreateMeta('twitter:description', finalDescription);

    // Cleanup function to remove dynamic tags when component unmounts
    return () => {
      const dynamicTags = document.querySelectorAll('[data-dynamic="true"]');
      dynamicTags.forEach((tag) => tag.remove());
    };
  }, [config]);
};

export default useDynamicPageTitle;

