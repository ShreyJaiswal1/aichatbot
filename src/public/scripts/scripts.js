const socket = io({
  reconnection: true, // whether to reconnect automatically
  reconnectionAttempts: Infinity, // number of reconnection attempts before giving up
  reconnectionDelay: 1000, // how long to initially wait before attempting a new reconnection
  reconnectionDelayMax: 5000,
});
let username = null;
// dynamically change the input area
const chatInput = document.getElementById('chatInput');
const autoResize = () => {
  chatInput.style.height = 'auto';
  const maxHeight = 150;
  chatInput.style.height = Math.min(chatInput.scrollHeight, maxHeight) + 'px';
};

chatInput.addEventListener('input', autoResize);



async function downloadImage(imageUrl, title) {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Create object URL
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    
    // Add to document, click, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup object URL
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('Error downloading image:', error);
    alert('Failed to download image. Please try again.');
  }
}


document
  .getElementById('chatInput')
  .addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('sendButton').click();
      scrollToBottom();
    }
  });
async function scrollToBottom() {
  const content = document.getElementById('chatMessages');
  content.scrollTop = content.scrollHeight;
}

// Create modal element
const imageModal = document.createElement('div');
imageModal.className = 'image-modal';
const modalImage = document.createElement('img');
modalImage.className = 'modal-content';
imageModal.appendChild(modalImage);
document.body.appendChild(imageModal);

// Function to handle image click
function handleImageClick(event) {
  if (event.target.classList.contains('generated-image')) {
    modalImage.src = event.target.src;
    imageModal.classList.add('active');
  }
}

// Function to close modal
function closeModal() {
  imageModal.classList.remove('active');
}

// Add click event listeners
document.addEventListener('click', handleImageClick);
imageModal.addEventListener('click', closeModal);

function openNav() {
  document.getElementById('mySidenav').style.width = '300px';
  document.body.style.backgroundColor = 'rgba(0,0,0,0.4)';
}

function closeNav() {
  document.getElementById('mySidenav').style.width = '0';
  document.body.style.backgroundColor = 'white';
}

// Close sidenav when clicking outside
document.addEventListener('click', function(event) {
  const sidenav = document.getElementById('mySidenav');
  const menuBtn = document.querySelector('.menu-btn');
  
  // If click is outside sidenav and not on menu button, and sidenav is open
  if (!sidenav.contains(event.target) && 
      !menuBtn.contains(event.target) && 
      sidenav.style.width === '300px') {
    closeNav();
  }
});

// Theme handling
function toggleTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const themeStylesheet = document.getElementById('theme-stylesheet');
  const theme = themeToggle.checked ? 'dark' : 'light';
  
  // Update stylesheet href
  themeStylesheet.href = `../css/${theme}.css`;
  
  // Save theme preference
  localStorage.setItem('theme', theme);
}

// Set initial theme based on user preference
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const themeStylesheet = document.getElementById('theme-stylesheet');
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  // Set initial state
  themeToggle.checked = savedTheme === 'dark';
  themeStylesheet.href = `./css/${savedTheme}.css`;
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logOutBttn');
  if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
          try {
              const response = await fetch('/logout');
              if (response.ok) {
                  window.location.href = '/';
              } else {
                  console.error('Logout failed');
              }
          } catch (error) {
              console.error('Error logging out:', error);
          }
      });
  }
});
// Excape Html
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add copy to clipboard function
async function copyToClipboard(button) {
  try {
    const messageContent = button.closest('.message').querySelector('.message-content p').textContent;
    await navigator.clipboard.writeText(messageContent);
    
    // Show feedback
    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i>';
    button.style.color = '#4CAF50';
    
    setTimeout(() => {
      button.innerHTML = originalIcon;
      button.style.color = '';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text:', err);
  }
}
