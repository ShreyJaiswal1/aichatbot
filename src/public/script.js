const webUrl = 'http://localhost:3000';
const socket = io(webUrl, {
  reconnection: true, // whether to reconnect automatically
  reconnectionAttempts: Infinity, // number of reconnection attempts before giving up
  reconnectionDelay: 1000, // how long to initially wait before attempting a new reconnection
  reconnectionDelayMax: 5000,
});
let username = null;

// Fetch username when page loads
window.addEventListener('load', async () => {
  try {
    const response = await fetch(`${webUrl}/user`);
    const data = await response.json();
    if (data.name) {
      username = data.name;
      socket.emit('user-joined', username);
      // Add welcome message
      const welcomeMsg = document.createElement('div');
      welcomeMsg.classList.add('bot-message');
      welcomeMsg.innerHTML = `<p>Welcome ${username}! kese ho aaj tum?</p>`;
      document.getElementById('chatMessages').appendChild(welcomeMsg);
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    window.location.href = '/';
  }
});

// dynamically change the input area
document
  .getElementById('chatInput')
  .addEventListener('input', async function () {
    this.style.height = 'auto';
    const maxHeight = 100;
    this.style.height = Math.min(this.scrollHeight, maxHeight) + 'px';
  });

let isSending = false;

// fetch the response from the server
document.getElementById('sendButton').addEventListener('click', async function () {
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
  document.getElementById('mySidenav').style.width = '250px';
  document.body.style.backgroundColor = 'rgba(0,0,0,0.4)';
}

function closeNav() {
  document.getElementById('mySidenav').style.width = '0';
  document.body.style.backgroundColor = 'white';
}

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
document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logOutBttn');
  if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
          try {
              const response = await fetch(`${webUrl}/logout`);
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
