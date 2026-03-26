/**
 * Image Utility Module
 * Handles image URL generation with multiple fallback strategies
 * Supports: user avatars, project images, placeholder assets
 */

// Public placeholder image services (reliable fallbacks)
const AVATAR_SERVICES = {
  // UI-Avatars: generates avatar from initials/name
  uiavatars: (name, size = 160) => {
    const encName = encodeURIComponent((name || 'User').trim());
    return `https://ui-avatars.com/api/?name=${encName}&size=${size}&background=random&color=fff&bold=true`;
  },
  
  // DiceBear: generates avatar from seed (more unique)
  dicebear: (name, _size = 160) => {
    const seed = encodeURIComponent((name || 'user').replace(/\s+/g, '-').toLowerCase());
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&scale=80`;
  },
  
  // Gravatar: based on email hash (if email available)
  gravatar: (email, _size = 160) => {
    if (!email) return null;
    // Note: Gravatar usage removed - requires server-side email hashing
    return null;
  },
};

const PROJECT_IMAGE_SERVICES = {
  // Placeholder.co: simple colored placeholder
  placeholder: (text = 'Project', width = 400, height = 300) => {
    return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`;
  },
  
  // Lorem Picsum: random photo from Unsplash
  picsum: (seed = Math.random(), width = 400, height = 300) => {
    return `https://picsum.photos/${width}/${height}?random=${Math.floor(seed * 10000)}`;
  },
  
  // Placeholder image from local assets
  local: (_path) => {
    return `/default-project.png`; // fallback to local file
  },
};

/**
 * Generate avatar URL with intelligent fallback chain
 * @param {Object} portfolio - Portfolio data object
 * @param {string} portfolio.name - User name (for initials generation)
 * @param {string} portfolio.avatar_url - Direct avatar URL (priority)
 * @param {string} portrait - Optional portrait URL
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (portfolio, portrait = null) => {
  // Priority 1: Direct avatar_url from portfolio
  if (portfolio?.avatar_url) {
    return portfolio.avatar_url;
  }

  // Priority 2: Portrait image if provided
  if (portrait) {
    return portrait;
  }

  // Priority 3: Local default avatar
  if (typeof window !== 'undefined' && document.querySelector('img[src="/default-avatar.png"]')) {
    return '/default-avatar.png';
  }

  // Priority 4: Generate from name using DiceBear
  const name = portfolio?.name || 'Portfolio';
  return AVATAR_SERVICES.dicebear(name);
};

/**
 * Generate project image URL with intelligent fallback chain
 * @param {Object} project - Project object with image_url or title
 * @param {number} index - Project index (for unique seeding)
 * @returns {string} Project image URL
 */
export const getProjectImageUrl = (project, index = 0) => {
  // Priority 1: Direct image_url from project
  if (project?.image_url) {
    return project.image_url;
  }

  // Priority 2: Local default project image
  if (typeof window !== 'undefined') {
    return '/default-project.png';
  }

  // Priority 3: Generate placeholder with text
  const projectTitle = project?.name || project?.title || `Project ${index + 1}`;
  return PROJECT_IMAGE_SERVICES.placeholder(projectTitle, 400, 300);
};

/**
 * Generate skill icon URLs using icon service
 * @param {string} skillName - Name of skill/technology
 * @returns {string} Icon URL
 */
export const getSkillIconUrl = (skillName) => {
  if (!skillName) return '/default-skill-icon.png';
  
  // Use shields.io for tech badges
  const encoded = encodeURIComponent(skillName);
  return `https://img.shields.io/badge/-${encoded}-05122A?style=flat&logo=${encoded.toLowerCase()}`;
};

/**
 * Generate hero/home background image URL
 * @param {string} preferredBg - Preferred background image URL
 * @returns {string} Background image URL
 */
export const getHeroBackgroundUrl = (preferredBg = null) => {
  // Priority 1: Preferred background
  if (preferredBg) {
    return preferredBg;
  }

  // Priority 2: Local hero background
  return '/hero-background.png';
};

/**
 * Validate if URL can be loaded (non-throwing check)
 * Useful for dynamic image loading
 * @param {string} url - Image URL to validate
 * @returns {Promise<boolean>} True if image loads successfully
 */
export const validateImageUrl = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * Batch validate multiple image URLs
 * @param {string[]} urls - Array of image URLs
 * @returns {Promise<Map>} Map of URL -> validity
 */
export const validateImageUrls = async (urls) => {
  const results = new Map();
  const promises = urls.map(url =>
    validateImageUrl(url).then(valid => results.set(url, valid))
  );
  await Promise.all(promises);
  return results;
};

/**
 * Build optimized image URL with caching and CDN
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized URL
 */
export const optimizeImageUrl = (url, options = {}) => {
  if (!url) return '/default-avatar.png';

  const {
    _width = 400,
    _height = 300,
    _quality = 80,
    _format = 'auto',
  } = options;

  // If URL is already optimized or is local, return as-is
  if (url.startsWith('/') || url.includes('ui-avatars') || url.includes('dicebear')) {
    return url;
  }

  // TODO: Add CDN optimization service integration
  // e.g., Cloudinary, Imgix, etc.
  
  return url;
};

/**
 * Get all available fallback avatars for a portfolio
 * Useful for showing options or pre-loading fallbacks
 * @param {Object} portfolio - Portfolio data
 * @returns {string[]} Array of avatar URLs in priority order
 */
export const getAvatarFallbackChain = (portfolio) => {
  const chain = [];
  
  if (portfolio?.avatar_url) chain.push(portfolio.avatar_url);
  chain.push('/default-avatar.png');
  
  if (portfolio?.name) {
    chain.push(AVATAR_SERVICES.dicebear(portfolio.name));
    chain.push(AVATAR_SERVICES.uiavatars(portfolio.name));
  }
  
  return chain;
};

export default {
  getAvatarUrl,
  getProjectImageUrl,
  getSkillIconUrl,
  getHeroBackgroundUrl,
  validateImageUrl,
  validateImageUrls,
  optimizeImageUrl,
  getAvatarFallbackChain,
};
