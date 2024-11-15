const webUrl = "http://localhost:3000";
const socket = io(webUrl, {
  reconnection: true, // whether to reconnect automatically
  reconnectionAttempts: Infinity, // number of reconnection attempts before giving up
  reconnectionDelay: 1000, // how long to initially wait before attempting a new reconnection
  reconnectionDelayMax: 5000,
});
let username = null;
let joined = false;
// autofocus on input username
// document.getElementById("name").focus();

// username entered

document.getElementById('name').addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    goToChatRoom();
  }
});

function goToChatRoom() {
  const inputValue = document.getElementById('name');

  if (inputValue.value.length != 0) {
    username = inputValue.value;
    inputValue.blur;
    inputValue.value = '';
    document.getElementById('landing-page').remove();

    if (!joined) {
      joined = true;
      socket.emit('user-joined', username);
    }
  } else {
    alert('Please provide a username');
  }
}
document.getElementById('chatInput').addEventListener('input', async function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  });
  let isSending = false;
  document.getElementById('sendButton').addEventListener('click', async function () {
  if (isSending) return;  // If already sending, prevent further clicks

  isSending = true

    // get the value of the chatbox input
    const message = document.getElementById('chatInput').value;
    if (message.trim() !== '') {
      const chatElement = document.createElement('div');
      chatElement.classList.add('message'); 
      chatElement.innerHTML = `<p>${message}</p>`;
      document.getElementById('chatMessages').appendChild(chatElement);
      document.getElementById('chatInput').value = '';
      scrollToBottom();
      // loading the chat
      const chatMessage = document.createElement('div');
      chatMessage.classList.add('bot-message');
      const loader = document.createElement('div');
      loader.classList.add('loader');
      chatMessage.appendChild(loader);

      document.getElementById('chatMessages').appendChild(chatMessage);
  
      //fetching msg
      const response = await fetch(`${webUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message, username: username })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      chatMessage.innerHTML = `<p>${data.reply}</p>`;
      scrollToBottom();
    }
    isSending = false; 
  });
document.getElementById('chatInput').addEventListener('keydown', async (event) => {
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
const toggleButton = document.getElementById("check-5");
const themeStylesheet = document.getElementById("theme-stylesheet");

toggleButton.addEventListener("click", () => {
    // Check current theme
    if (themeStylesheet.getAttribute("href") === "light.css") {
        // Switch to dark mode
        themeStylesheet.setAttribute("href", "dark.css");
    } else {
        // Switch to light mode
        themeStylesheet.setAttribute("href", "light.css");
    }
});
