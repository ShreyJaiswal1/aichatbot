
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