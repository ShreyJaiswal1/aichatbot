<<<<<<< Updated upstream
const webUrl = 'http://localhost:3000';
const socket = io(webUrl, {
=======
const socket = io({
>>>>>>> Stashed changes
  reconnection: true, // whether to reconnect automatically
  reconnectionAttempts: Infinity, // number of reconnection attempts before giving up
  reconnectionDelay: 1000, // how long to initially wait before attempting a new reconnection
  reconnectionDelayMax: 5000,
});
let username = null;

// Fetch username when page loads
window.addEventListener('load', async () => {
  try {
<<<<<<< Updated upstream
    const response = await fetch(`${webUrl}/user`);
=======
    const response = await fetch('/user');
>>>>>>> Stashed changes
    const data = await response.json();
    if (data.name) {
      username = data.name;
      socket.emit('user-joined', username);
<<<<<<< Updated upstream
      // Add welcome message
      const welcomeMsg = document.createElement('div');
      welcomeMsg.classList.add('bot-message');
      welcomeMsg.innerHTML = `<p>Welcome ${username}! kese ho aaj tum?</p>`;
=======
      
      // Update user profile in sidebar
      document.getElementById('userName').textContent = data.name;
      document.getElementById('userEmail').textContent = data.email || '';
      
      // Update profile image
      const profileImg = document.getElementById('userProfileImg');
      if (data.photo) {
        profileImg.src = data.photo;
      } else {
        profileImg.src = './assets/default-avatar.png';
      }
      
      // Add welcome message
      const welcomeMsg = document.createElement('div');
      welcomeMsg.classList.add('message', 'bot');
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      welcomeMsg.innerHTML = `
        <div class="message-content">
          <p>Hello ${username}! Kese ho aaj aap? </p>
          <p>Aap /imagine command use kar sakte ho image generate karne ke liye:</p>
          <p><em>For example:</em> <code>/imagine a cute panda eating bamboo</code></p>
        </div>
        <span class="timestamp">${timestamp}</span>
      `;
>>>>>>> Stashed changes
      document.getElementById('chatMessages').appendChild(welcomeMsg);
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    window.location.href = '/';
  }
});

// dynamically change the input area
<<<<<<< Updated upstream
document
  .getElementById('chatInput')
  .addEventListener('input', async function () {
    this.style.height = 'auto';
    const maxHeight = 100;
    this.style.height = Math.min(this.scrollHeight, maxHeight) + 'px';
  });
=======
const chatInput = document.getElementById('chatInput');
const autoResize = () => {
  chatInput.style.height = 'auto';
  const maxHeight = 150;
  chatInput.style.height = Math.min(chatInput.scrollHeight, maxHeight) + 'px';
};

chatInput.addEventListener('input', autoResize);
>>>>>>> Stashed changes

let isSending = false;

// fetch the response from the server
document.getElementById('sendButton').addEventListener('click', async function () {
<<<<<<< Updated upstream
  const chatInput = document.getElementById('chatInput');
  chatInput.style.height = 'auto';
  if (isSending) return; // If already sending, prevent further clicks

  isSending = true;

  // Get the value of the chatbox input
  const message = chatInput.value;
  if (message.trim() !== '') {
      const chatElement = document.createElement('div');
      chatElement.classList.add('message');
      chatElement.innerHTML = `<p>${message}</p>`;
      document.getElementById('chatMessages').appendChild(chatElement);
      chatInput.value = '';
      scrollToBottom();

      // Loading the chat
      const chatMessage = document.createElement('div');
      chatMessage.classList.add('bot-message');
      document.getElementById('chatMessages').appendChild(chatMessage);
      const loader = document.createElement('div');
      // Check if the message starts with /imagine
      if (message.startsWith('/imagine')) {
        loader.classList.add('typing');
        loader.textContent = 'Generating Image...';
        chatMessage.appendChild(loader);
          const prompt = message.substring(9).trim(); // Get the prompt without the prefix
          const response = await fetch(`${webUrl}/api/imagine`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: prompt, username: username }),
          });

          if (!response.ok) {
              chatMessage.innerHTML = `<p>Cannot Fetch image</p>`;
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const imageUrl = data.url; // Assuming the response contains the image URL in 'url'
          chatMessage.innerHTML = `<img src="${imageUrl}" alt="Generated Image" style="max-width: 40%; min-width: 200px; height: auto; border-radius: 5px;">`;
          scrollToBottom();
      } else {
        loader.classList.add('typing');
        loader.textContent = 'Typing...';
        chatMessage.appendChild(loader);
          // Fetching regular chat response
          const response = await fetch(`${webUrl}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: message, username: username }),
          });

          if (!response.ok) {
              chatMessage.innerHTML = `<p>Cannot Fetch message</p>`;
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          chatMessage.innerHTML = `<p>${data.reply}</p>`;
      }

      loader.remove();
      scrollToBottom();
  }
  isSending = false;
});

=======
  if (isSending) return; // If already sending, prevent further clicks

  isSending = true;
  try {
    // Get the value of the chatbox input
    const message = chatInput.value;
    if (message.trim() !== '') {
        const chatElement = document.createElement('div');
        chatElement.classList.add('message', 'user');
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        chatElement.innerHTML = `
          <div class="message-content">
            <p>${message}</p>
          </div>
          <span class="timestamp">
            <button class="copy-btn" onclick="copyToClipboard(this)" title="Copy message">
              <i class="fas fa-copy"></i>
            </button>
            ${timestamp}
          </span>
        `;
        document.getElementById('chatMessages').appendChild(chatElement);
        chatInput.value = '';
        chatInput.style.height = 'auto';  // Reset height after sending
        scrollToBottom();

        // Loading the chat
        const chatMessage = document.createElement('div');
        chatMessage.classList.add('message', 'bot');
        document.getElementById('chatMessages').appendChild(chatMessage);
        const loader = document.createElement('div');
        
        try {
          // Check if the message starts with /imagine
          if (message.startsWith('/imagine')) {
              // Create and append skeleton loader
              const skeletonLoader = document.createElement('div');
              skeletonLoader.classList.add('skeleton-loader');
              chatMessage.appendChild(skeletonLoader);

              loader.innerHTML = '<span style="color: #5e5e5e; font-style: italic; opacity: 0.8">Generating Image...</span>';
              chatMessage.appendChild(loader);
              const prompt = message.substring(9).trim(); // Get the prompt without the prefix
              const response = await fetch('/api/imagine', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: prompt, username: username }),
              });

              if (!response.ok) {
                  throw new Error('Failed to fetch image');
              }

              const data = await response.json();
              const imgContainer = document.createElement('div');
              imgContainer.className = 'image-container';

              // Remove skeleton loader
              if (skeletonLoader && skeletonLoader.parentNode) {
                  skeletonLoader.remove();
              }

              const img = document.createElement('img');
              img.src = data.url;
              img.alt = data.title || 'Generated Image';
              img.className = 'generated-image';
              imgContainer.appendChild(img);
              scrollToBottom();
              if (data.title) {
                const titleDiv = document.createElement('div');
                titleDiv.className = 'image-title';
                titleDiv.textContent = data.title;
                titleDiv.style.cursor = 'pointer';
                titleDiv.title = 'Click to download image';

                // Add click event listener
                titleDiv.addEventListener('click', () => {
                  downloadImage(data.url, data.title);
                });

                imgContainer.appendChild(titleDiv);
              }

              const timestampDiv = document.createElement('div');
              timestampDiv.className = 'timestamp';
              timestampDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              imgContainer.appendChild(timestampDiv);

              chatMessage.innerHTML = '';
              chatMessage.appendChild(imgContainer);
          } else {
            loader.innerHTML = '<span style="color: #5e5e5e; font-style: italic; opacity: 0.8">Typing...</span>';
              chatMessage.appendChild(loader);
              scrollToBottom();
              // Fetching regular chat response
              const response = await fetch('/api/chat', {
                  method: 'POST',
                  credentials: 'include', 
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: message, username: username }),
              });

              if (!response.ok) {
                  throw new Error('Failed to fetch message');
              }

              const data = await response.json();
              const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              chatMessage.innerHTML = `
                <div class="message-content">
                  <p>${formatMessage(data.reply)}</p>
                </div>
                <span class="timestamp">
                  ${timestamp}
                  <button class="copy-btn" onclick="copyToClipboard(this)" title="Copy message">
                    <i class="fas fa-copy"></i>
                  </button>
                </span>
              `;
          }
        } catch (error) {
            chatMessage.innerHTML = `<p>Error: ${error.message}</p>`;
        } finally {
            if (loader.parentNode) {
                loader.remove();
            }
        }
    }
  } catch (error) {
      console.error('Error in message handling:', error);
  } finally {
      isSending = false;
      scrollToBottom();
  }
});

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

// Format the message text with code blocks and basic markdown
function formatMessage(text) {
  // Replace code blocks (```code```)
  text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Replace inline code (`code`)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Replace bold (**text**)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Replace italic (*text*)
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Replace URLs
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Replace newlines with <br>
  text = text.replace(/\n/g, '<br>');
  
  return text;
}

socket.on('message', async (data) => {
  if (data.type === 'image') {
    const chatMessage = document.createElement('div');
    chatMessage.className = 'message bot-message';
    
    const imgContainer = document.createElement('div');
    imgContainer.className = 'image-container';

    const img = document.createElement('img');
    img.src = data.url;
    img.alt = data.title || 'Generated Image';
    img.className = 'generated-image';
    imgContainer.appendChild(img);

    if (data.title) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'image-title';
      titleDiv.textContent = data.title;
      titleDiv.style.cursor = 'pointer';
      titleDiv.title = 'Click to download image';
      
      // Add click event listener
      titleDiv.addEventListener('click', () => {
        downloadImage(data.url, data.title);
      });
      
      imgContainer.appendChild(titleDiv);
    }

    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'timestamp';
    timestampDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    imgContainer.appendChild(timestampDiv);

    chatMessage.appendChild(imgContainer);
    document.getElementById('chatMessages').appendChild(chatMessage);
    document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
  } else {
    // Handle other message types...
  }
});
>>>>>>> Stashed changes

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
function openNav() {
  document.getElementById('mySidenav').style.width = '300px';
  document.body.style.backgroundColor = 'rgba(0,0,0,0.4)';
}

function closeNav() {
  document.getElementById('mySidenav').style.width = '0';
  document.body.style.backgroundColor = 'white';
}

<<<<<<< Updated upstream
// toggle the dark and light mode when the user clicks the button
const toggleButton = document.getElementById('check-5');
const themeStylesheet = document.getElementById('theme-stylesheet');

toggleButton.addEventListener('click', () => {
  // Check current theme
  if (themeStylesheet.getAttribute('href') === 'light.css') {
    // Switch to dark mode
    themeStylesheet.setAttribute('href', 'dark.css');
  } else {
    // Switch to light mode
    themeStylesheet.setAttribute('href', 'light.css');
  }
});
=======
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

// Theme switching functionality
const themeToggle = document.getElementById('themeToggle');
const themeStylesheet = document.getElementById('theme-stylesheet');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
themeToggle.checked = savedTheme === 'dark';
themeStylesheet.href = `./css/${savedTheme}.css`;

// Handle theme toggle
themeToggle.addEventListener('change', function() {
  const theme = this.checked ? 'dark' : 'light';
  themeStylesheet.href = `./css/${theme}.css`;
  localStorage.setItem('theme', theme);
});

>>>>>>> Stashed changes
document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logOutBttn');
  if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
          try {
<<<<<<< Updated upstream
              const response = await fetch(`${webUrl}/logout`);
=======
              const response = await fetch('/logout');
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

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
>>>>>>> Stashed changes
