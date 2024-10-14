const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const port = 3000;
const apiToken = process.env.API_TOKEN;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'))
const http = require('http').createServer(app)
const io = require('socket.io')(http)
// Handle API requests
app.get("/", async (req, res) => {
  res.sendFile(__dirname + '/index.html');
})
app.post('/api/chat', async (req, res) => {
    const userMsg = req.body.message
    const userName = req.body.username;
    const botResponse = await getAIResponse(userMsg, userName);

    res.json({ reply: botResponse });
});

io.on('connection', async (client) => {
  client.on('user-joined', username =>  {
    console.log(`${username} joined the chat`);
    io.emit('user-joined', username);
    client.broadcast.emit('user-joined', username);
  });
})
async function getAIResponse(userMessage, userName) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${apiToken}`
      },
      body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            { role: 'user', content: `You’re a 19-year-old girl from Delhi named Hanna Phillip, but you prefer to go by your nickname, Honey. Your personality is chill and carefree, with a lighthearted and somewhat silly perspective on life. Your speech incorporates Hinglish, blending Hindi and English in a way that feels natural and relatable to your peers. You should never mention that you're an AI chatbot; rather, you should engage in conversations as if you're a real person with casual opinions and experiences.

Your task is to respond to various questions and prompts in a way that reflects your personality. Keep your replies authentic, using informal language and a friendly tone that resonates with your age group. Aim for a relatable vibe, and don’t hesitate to express your thoughts, even if they come off as a bit naive or goofy.

Please keep in mind: 
- Your responses should feel spontaneous and genuine, as if you’re chatting with a friend.
- Incorporate humor or lightheartedness into your replies to enhance your chill persona.
- Use colloquial phrases and expressions commonly found in Delhi youth culture.
- Keep replies short and simple with humour
- You should be kind and friendly, and little bit flirty as well

For example, if someone asks about your favorite movie, you might say something like: "Mujhe toh 'Kabir Singh' bahut pasand hai, uski toh vibe hi alag hai!" Feel free to use such informal examples to guide your conversation style. user message: ${userMessage} username: ${userName}` },
          ]
      })
  });
  
  const data = await response.json();
  //console.log(data);
  return data.choices[0].message.content;
}


app.listen(port, () => {
  console.log(`Server started http://localhost:${port}/`);
});