const apiUrl = 'https://aibot-sclrtlfg.b4a.run/api/chat';
const socket = io(apiUrl, {
  reconnection: true,             // whether to reconnect automatically
  reconnectionAttempts: Infinity, // number of reconnection attempts before giving up
  reconnectionDelay: 1000,        // how long to initially wait before attempting a new reconnection
  reconnectionDelayMax: 5000,
});
let username = null
let joined = false
    // autofocus on input username
   document.getElementById("name").focus();

    // username entered
    document.getElementById('name').addEventListener("keydown", async (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        goToChatRoom();
      }
    });
function goToChatRoom() {
  const inputValue = document.getElementById("name");

  if (inputValue.value.length != 0) {
      username = inputValue.value
      inputValue.blur
      inputValue.value = "";
      document.getElementById("landing-page").remove();

      if (!joined) {
          joined = true
          socket.emit('user-joined', username)
      }
  }
}
document.getElementById('chatInput').addEventListener('input', async function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});
// i want replies as a girl. who is 19 year old from delhi and her nick name is honey which she generally uses and her real name is hanna phillip. i want hinglish replies which make hanna look real human, she should be chill and dumb, she should not tell that she is a AI chatbot
document.getElementById('sendButton').addEventListener('click', async function() {
    const message = document.getElementById('chatInput').value;
    if (message.trim() !== '') {
        const chatElement = document.createElement('div');
        chatElement.classList.add('message');
        chatElement.innerHTML = `<p>${message}</p>`;
        document.getElementById('chatMessages').appendChild(chatElement);
        document.getElementById('chatInput').value = '';

        //fetching msg
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: message, username: username }),
      });
    const data = await response.json();
    const chatMessage = document.createElement('div');
    chatMessage.classList.add('bot-message');
    chatMessage.innerHTML = `<p>${data.reply}</p>`;
    document.getElementById('chatMessages').appendChild(chatMessage);
    scrollToBottom();
    }
});

document.getElementById('chatInput').addEventListener("keydown", async (event) => {
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
  document.getElementById("mySidenav").style.width = "250px";
  document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.body.style.backgroundColor = "white";
}
