window.addEventListener('load', async () => {
  try {
    const response = await fetch('/user');
    const data = await response.json();
    if (data.name) {
      username = data.name;
      socket.emit('user-joined', username);

      //chat history
      const chatHistoryResponse = await fetch(`/api/chatHistory`);
      const chatHistory = await chatHistoryResponse.json();
        chatHistory.forEach(chat => {
          
        const timestamp = new Date(chat.timestamp.seconds * 1000);
        const formattedTimestamp = `${String(timestamp.getDate()).padStart(2, '0')}/${String(timestamp.getMonth() + 1).padStart(2, '0')}/${String(timestamp.getFullYear()).slice(-2)} - ${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}`;

        // Append user message
        const userMessageElement = document.createElement('div');
        userMessageElement.classList.add('message', 'user');
        userMessageElement.innerHTML = `
          <div class="message-content">
            <p>${escapeHTML(chat.userMsg || `/imagine ${chat.prompt}`)}</p>
          </div>
         <span class="timestamp">
            <button class="copy-btn" onclick="copyToClipboard(this)" title="Copy message">
              <i class="fas fa-copy"></i>
            </button>
            ${formattedTimestamp}
          </span>
        `;
        document.getElementById('chatMessages').appendChild(userMessageElement);

        // Append bot response
        const botMessageElement = document.createElement('div');
        botMessageElement.classList.add('message', 'bot');
        if (chat.imageUrl) {
              const imgContainer = document.createElement('div');
              imgContainer.className = 'image-container';
              const img = document.createElement('img');
              img.src = chat.imageUrl;
              img.alt = chat.imageTitle || 'Generated_Image';
              img.className = 'generated-image';
            imgContainer.appendChild(img);
            if (chat.imageTitle) {
                const titleDiv = document.createElement('div');
                titleDiv.className = 'image-title';
                titleDiv.textContent = chat.imageTitle;
                titleDiv.style.cursor = 'pointer';
                titleDiv.title = 'Click to download image';

                titleDiv.addEventListener('click', () => {
                  downloadImage(chat.imageUrl, chat.imageTitle);
                });

                imgContainer.appendChild(titleDiv);
              }
                const titleDiv = document.createElement('div');
                titleDiv.className = 'image-title';
                titleDiv.style.cursor = 'pointer';
                titleDiv.title = 'Click to download image';

              const timestampDiv = document.createElement('div');
              timestampDiv.className = 'timestamp';
            timestampDiv.textContent = formattedTimestamp;  
            imgContainer.appendChild(timestampDiv);
            
              document.getElementById('chatMessages').appendChild(botMessageElement).appendChild(imgContainer);
        } else {
          botMessageElement.innerHTML = `
            <div class="message-content">
              <p>${formatMessage(chat.botResponse)}</p>
            </div>
            <span class="timestamp">
              ${formattedTimestamp}
              <button class="copy-btn" onclick="copyToClipboard(this)" title="Copy message">
                <i class="fas fa-copy"></i>
              </button>
            </span>
          `;
        }
          document.getElementById('chatMessages').appendChild(botMessageElement);
          
      });

      document.getElementById('userName').textContent = data.name;
      document.getElementById('userEmail').textContent = data.email || '';

      // Update profile image
      const profileImg = document.getElementById('userProfileImg');
      if (data.photo) {
        profileImg.src = data.photo;
      } else {
        profileImg.src = './assets/default-avatar.png';
      }
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const divider = document.createElement('div');
      divider.className = 'divider';
      divider.innerHTML = `Today ${timestamp}`;
      divider.classList.add('divider');
      document.getElementById('chatMessages').appendChild(divider);

      // welcome message
      const welcomeMsg = document.createElement('div');
      welcomeMsg.classList.add('message', 'bot');
      
      welcomeMsg.innerHTML = `
        <div class="message-content">
          <p>Hello ${username}! Kese ho aaj aap? </p>
          <p>Aap /imagine command use kar sakte ho image generate karne ke liye:</p>
          <p><em>For example:</em> <code>/imagine a cute panda eating bamboo</code></p>
        </div>
        <span class="timestamp">${timestamp}</span>
      `;
      document.getElementById('chatMessages').appendChild(welcomeMsg);
      scrollToBottom();
    }
  } catch (error) {
    console.log('Error fetching user:', error);
   // window.location.href = '/';
  }
});