// Platform configurations
const PLATFORMS = [
  { 
    id: 'youtube',
    name: 'YouTube',
    color: '#424242',
    url: (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  },
  {
    id: 'reddit',
    name: 'Reddit',
    color: '#424242',
    url: (query) => `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: '#424242',
    url: (query) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    color: '#424242',
    url: (query) => `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query`
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#424242',
    url: (query) => `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#424242',
    url: (query) => `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}`
  },
  {
    id: 'amazon',
    name: 'Amazon',
    color: '#424242',
    url: (query) => `https://www.amazon.com/s?k=${encodeURIComponent(query)}`
  },
  {
    id: 'github',
    name: 'GitHub',
    color: '#424242',
    url: (query) => `https://github.com/search?q=${encodeURIComponent(query)}`
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    color: '#424242',
    url: (query) => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
  },
  {
    id: 'bing',
    name: 'Bing',
    color: '#424242',
    url: (query) => `https://www.bing.com/search?q=${encodeURIComponent(query)}`
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    color: '#424242',
    url: (query) => `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    color: '#424242',
    url: (query) => `https://chat.openai.com/?q=${encodeURIComponent(query)}`
  },
  {
    id: 'googleai',
    name: 'Ai Mode',
    color: '#424242',
    url: (query) => `https://www.google.com/search?udm=50&q=${encodeURIComponent(query)}`
  }
];

let enabledPlatforms = [];
let openInNewTab = true; // Default to true
let customCSS = ''; // Custom CSS storage

// Get search query from URL
function getSearchQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('q') || ''; 
}

// Check if we're on Google Images
function isGoogleImages() {
  const urlParams = new URLSearchParams(window.location.search);
  // Check for both tbm=isch (old format) and udm=2 (new format)
  return urlParams.get('tbm') === 'isch' || urlParams.get('udm') === '2';
}

// Check if we're on AI Mode
function isAIMode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('udm') === '50';
}

// Load settings with error handling
async function loadSettings() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get(['enabledPlatforms', 'openInNewTab', 'customCSS'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error loading settings:', chrome.runtime.lastError);
          enabledPlatforms = ['youtube']; // fallback
          openInNewTab = true; // fallback
          customCSS = ''; // fallback
        } else {
          enabledPlatforms = result.enabledPlatforms || ['youtube'];
          openInNewTab = result.openInNewTab !== undefined ? result.openInNewTab : true;
          customCSS = result.customCSS || '';
        }
        resolve();
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      enabledPlatforms = ['youtube']; // fallback
      openInNewTab = true; // fallback
      customCSS = ''; // fallback
      resolve();
    }
  });
}

// Create platform button
function createPlatformButton(platform, query) {
  const button = document.createElement('button');
  button.className = 'platform-search-btn';
  button.style.backgroundColor = platform.color;
  
  // Create icon container with background image
  const iconDiv = document.createElement('div');
  iconDiv.className = 'platform-icon-bg';
  iconDiv.style.backgroundImage = `url('${chrome.runtime.getURL(`icons/${platform.id}.png`)}')`;
  
  // Create text span
  const textSpan = document.createElement('span');
  textSpan.textContent = `${platform.name}`;
  //textSpan.textContent = `Search ${platform.name}`;
  
  button.appendChild(iconDiv);
  button.appendChild(textSpan);
  
  button.addEventListener('click', (e) => {
    e.preventDefault();
    if (openInNewTab) {
      window.open(platform.url(query), '_blank');
    } else {
      window.location.href = platform.url(query);
    }
  });
  
  return button;
}

// Apply custom CSS
function applyCustomCSS() {
  // Remove existing custom CSS if any
  const existingStyle = document.getElementById('platform-search-custom-css');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // If there's custom CSS, inject it
  if (customCSS && customCSS.trim() !== '') {
    const styleElement = document.createElement('style');
    styleElement.id = 'platform-search-custom-css';
    styleElement.textContent = customCSS;
    document.head.appendChild(styleElement);
  }
}

// Initialize extension
async function initExtension() {
  try {
    // Remove existing container
    const existingContainer = document.getElementById('platform-search-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // Don't show buttons on Google Images
    if (isGoogleImages()) {
      console.log('Google Images detected - not showing platform buttons');
      return;
    }
    
    await loadSettings();
    
    // Apply custom CSS
    applyCustomCSS();
    
    const query = getSearchQuery();
    if (!query || enabledPlatforms.length === 0) {
      console.log('No query or no enabled platforms');
      return;
    }
    
    // Create main container
    const container = document.createElement('div');
    container.id = 'platform-search-container';
    
    // Add title
    const title = document.createElement('div');
    title.className = 'platform-search-title';
    title.textContent = ''; // NAME ON TOPGG
    container.appendChild(title);
    
    // Add platform buttons
    enabledPlatforms.forEach(platformId => {
      const platform = PLATFORMS.find(p => p.id === platformId);
      if (platform) {
        container.appendChild(createPlatformButton(platform, query));
      }
    });
    
    // Find the main search container
    const searchContainer = document.querySelector('#rcnt') || 
                           document.querySelector('#main') ||
                           document.querySelector('#center_col')?.parentElement;
    
    if (searchContainer) {
      // Create a fixed left sidebar that scrolls with page
      container.style.position = 'fixed';
      
      // Adjust positioning for AI Mode to avoid Google's sidebar
      if (isAIMode()) {
        container.style.left = '100px'; // Move further right to avoid AI sidebar
      } else {
        container.style.left = '20px';
      }
      
      container.style.top = '180px';
      container.style.zIndex = '100';
      container.style.maxHeight = 'calc(100vh - 200px)';
      container.style.overflowY = 'auto';
      
      // Insert into body to avoid layout conflicts
      document.body.appendChild(container);
      console.log('Platform buttons inserted successfully as fixed sidebar');
    } else {
      console.error('Could not find search container for platform buttons');
    }
  } catch (error) {
    console.error('Error initializing extension:', error);
  }
}

// Better initialization
function init() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtension);
  } else {
    // Small delay to ensure Google's page is fully loaded
    setTimeout(initExtension, 500);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateButtons') {
    initExtension();
  }
});

// Initialize
init();

// Watch for URL changes (for single-page navigation)
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    // Small delay to let Google's page stabilize
    setTimeout(initExtension, 500);
  }
});

// Observe with more specific options
observer.observe(document.body, {
  childList: true,
  subtree: true
});