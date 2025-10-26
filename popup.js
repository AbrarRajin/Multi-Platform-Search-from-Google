const PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#ff0000'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    color: '#ff4500'
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: '#e60023'
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    color: '#000000'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#000000'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0077b5'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    color: '#ff9900'
  },
  {
    id: 'github',
    name: 'GitHub',
    color: '#181717'
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    color: '#de5833'
  },
  {
    id: 'bing',
    name: 'Bing',
    color: '#008373'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    color: '#20808d'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    color: '#10a37f'
  },
  {
    id: 'googleai',
    name: 'Google Ai Mode',
    color: '#29db52ff'
  }
];

let enabledPlatforms = [];

// Load settings with error handling
chrome.storage.sync.get(['enabledPlatforms'], (result) => {
  if (chrome.runtime.lastError) {
    console.error('Error loading settings:', chrome.runtime.lastError);
    enabledPlatforms = ['youtube'];
  } else {
    enabledPlatforms = result.enabledPlatforms || ['youtube'];
  }
  renderPlatforms();
});

// Render platform list
function renderPlatforms() {
  const container = document.getElementById('platforms');
  container.innerHTML = '';

  PLATFORMS.forEach(platform => {
    const isActive = enabledPlatforms.includes(platform.id);
    
    const item = document.createElement('div');
    item.className = `platform-item ${isActive ? 'active' : ''}`;
    
    // Create icon with background image
    const iconDiv = document.createElement('div');
    iconDiv.className = 'platform-icon';
    iconDiv.style.backgroundColor = `${platform.color}20`;
    iconDiv.style.backgroundImage = `url('${chrome.runtime.getURL(`icons/${platform.id}.png`)}')`;
    iconDiv.style.backgroundSize = '20px 20px';
    iconDiv.style.backgroundPosition = 'center';
    iconDiv.style.backgroundRepeat = 'no-repeat';
    
    // Create info div
    const infoDiv = document.createElement('div');
    infoDiv.className = 'platform-info';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'platform-name';
    nameDiv.textContent = platform.name;
    
    const statusDiv = document.createElement('div');
    statusDiv.className = 'platform-status';
    statusDiv.textContent = isActive ? 'Enabled' : 'Disabled';
    
    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(statusDiv);
    
    // Create toggle switch
    const toggleDiv = document.createElement('div');
    toggleDiv.className = `toggle-switch ${isActive ? 'active' : ''}`;
    
    const sliderDiv = document.createElement('div');
    sliderDiv.className = 'toggle-slider';
    
    toggleDiv.appendChild(sliderDiv);
    
    // Assemble item
    item.appendChild(iconDiv);
    item.appendChild(infoDiv);
    item.appendChild(toggleDiv);
    
    item.addEventListener('click', () => {
      togglePlatform(platform.id);
    });

    container.appendChild(item);
  });
}

// Toggle platform with error handling
function togglePlatform(platformId) {
  const index = enabledPlatforms.indexOf(platformId);
  
  if (index > -1) {
    enabledPlatforms.splice(index, 1);
  } else {
    enabledPlatforms.push(platformId);
  }

  chrome.storage.sync.set({ enabledPlatforms }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving settings:', chrome.runtime.lastError);
      return;
    }
    
    renderPlatforms();
    
    // Notify content script to update
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'updateButtons' }, (response) => {
          // Ignore errors - tab might not have content script loaded
          if (chrome.runtime.lastError) {
            console.log('Could not update current tab:', chrome.runtime.lastError.message);
          }
        });
      }
    });
  });
}