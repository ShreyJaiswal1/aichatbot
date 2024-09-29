const apiUrl = 'http://localhost:3000/api/chat';
document.getElementById('chatInput').addEventListener('input', function() {
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
          body: JSON.stringify({ message: message })
      });
    const data = await response.json();
    const chatMessage = document.createElement('div');
    chatMessage.classList.add('bot-message');
    chatMessage.innerHTML = `<p>${data.reply}</p>`;
    document.getElementById('chatMessages').appendChild(chatMessage);

    }
});
document.getElementById('chatInput').addEventListener("keypress", async (event) => {
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