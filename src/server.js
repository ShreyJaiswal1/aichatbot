const express = require('express'); 
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const getAIResponse = require('./getAiresponse.js');
const app = express();
const server = http.createServer(app);
const colors = require('colors');
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const port = 3000;
const apiToken = process.env.API_TOKEN;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Rate limiting: 5 requests per minute per IP for chat API
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // limit each IP to 5 requests per window
  message: "Too many requests from this IP, please try again later.",
});

app.use('/api/chat', apiLimiter); // Apply rate limit to /api/chat endpoint

const conversationHistory = {};

// Handle API requests
app.get('/*', async (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
var userName = "";
app.post('/api/chat', async (req, res) => {
  const userMsg = req.body.message;
  userName = req.body.username;

  // Initialize conversation history for the user if it doesn't exist
  if (!conversationHistory[userName]) {
    conversationHistory[userName] = [];
  }

  // Add user message to conversation history
  conversationHistory[userName].push({ role: 'user', content: userMsg });

  try {
    const botResponse = await getAIResponse(
      userMsg,
      userName,
      conversationHistory[userName]
    );

    // Add bot response to conversation history
    conversationHistory[userName].push({
      role: 'assistant',
      content: botResponse,
    });

    // Limit conversation history to last 10 messages (adjust as needed)
    if (conversationHistory[userName].length > 20) {
      conversationHistory[userName] = conversationHistory[userName].slice(-20);
    }

    // console.log(conversationHistory[userName]);
    res.json({ reply: botResponse });
  } catch (error) {
    console.error('Error in AI response:', error);
    res.status(500).json({ error: 'Something went wrong with the AI response' });
  }
});

io.on('connection', (socket) => {
  // console.log('New client connected'.yellow);
  
  socket.once('user-joined', (username) => {
    console.log(`${username} joined the chat`.blue);
    io.emit('user-joined', username);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected'.magenta);
  });
});

server.listen(port, () => {
  console.log(`Server started http://localhost:${port}/`.yellow);
});
process.on('uncaughtException', () => {
  console.log('Uncaught exception caught'.red);
});