// fetch the response from the server
let isSending = false;
document.getElementById('sendButton').addEventListener('click', async function () {
  if (isSending) return; 

  isSending = true;
  try {

    const message = chatInput.value;
    if (message.trim() !== '') {
        const chatElement = document.createElement('div');
        chatElement.classList.add('message', 'user');
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        chatElement.innerHTML = `
          <div class="message-content">
            <p>${escapeHTML(message)}</p>
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
        chatInput.style.height = 'auto';
        scrollToBottom();

        // Loading the chat
        const chatMessage = document.createElement('div');
        chatMessage.classList.add('message', 'bot');
        document.getElementById('chatMessages').appendChild(chatMessage);
        const loader = document.createElement('div');
        
        try {
          // Check if the message starts with /imagine
          if (message.startsWith('/imagine')) {
              // skeleton loader
              const skeletonLoader = document.createElement('div');
              skeletonLoader.classList.add('skeleton-loader');
              chatMessage.appendChild(skeletonLoader);

              loader.innerHTML = '<span style="color: #5e5e5e; font-style: italic; opacity: 0.8">Generating Image...</span>';
            chatMessage.appendChild(loader);
            scrollToBottom();
              const prompt = message.substring(9).trim(); //remove /imagine command
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
              img.alt = data.title || 'Generated_Image';
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

              chatMessage.innerHTML = '';
              chatMessage.appendChild(imgContainer);
          } else {
            loader.innerHTML = '<span style="color: #5e5e5e; font-style: italic; opacity: 0.8">Typing...</span>';
              chatMessage.appendChild(loader);
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
                scrollToBottom();
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

