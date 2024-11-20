const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// const rateLimit = require('express-rate-limit');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const getAIResponse = require('./getAiresponse.js');
const app = express();
const server = http.createServer(app);
const colors = require('colors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const port = 3000;
// Session configuration
app.use(
  session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(bodyParser.json());

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.OAUTH_ID,
      clientSecret: process.env.OAUTH_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      proxy: true,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// // Rate limiting: 5 requests per minute per IP for chat API
// const apiLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute window
//   max: 10, // limit each IP to 5 requests per window
//   message: "Too many requests from this IP, please try again later.",
// });

// app.use('/api/chat', apiLimiter); // Apply rate limit to /api/chat endpoint

const conversationHistory = {};

// Handle API requests
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/chat');
  } else {
    res.sendFile(__dirname + '/public/login.html');
  }
});
app.get('/chat', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(__dirname + '/public/index.html');
  } else {
    res.redirect('/');
  }
});
app.use(express.static(__dirname + '/public'));
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/chat');
  }
);
app.get('/user', (req, res) => {
  if (req.user) {
      res.json({ 
          name: req.user.displayName,
          email: req.user.emails?.[0]?.value,
          picture: req.user.photos?.[0]?.value
      });
  } else {
      res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
      if (err) {
          return next(err);
      }
      req.session.destroy((err) => {
          if (err) {
              console.error('Session destruction error:', err);
              return res.status(500).send('Logout failed');
          }
          res.redirect('/');
      });
  });
});
var userName = '';
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
    res
      .status(500)
      .json({ error: 'Something went wrong with the AI response' });
  }
});

io.on('connection', (socket) => {
  // console.log('New client connected'.yellow);
  var usr= null;
  socket.once('user-joined', (username) => {
    usr = username;
    console.log(`${username} joined the chat`.blue);
    io.emit('user-joined', username);
  });

  socket.on('disconnect', () => {
    console.log(`${usr} disconnected`.magenta);
  });
});

server.listen(port, () => {
  console.log(`Server started http://localhost:${port}/`);
});