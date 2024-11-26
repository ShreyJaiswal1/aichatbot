const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// const rateLimit = require('express-rate-limit');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const { getAIResponse, generateImageTitle } = require('./utils/getAiresponse.js');
const app = express();
const server = http.createServer(app);
const colors = require('colors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');
const sessionSecret = crypto.randomBytes(32).toString('hex');
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const domain = process.env.DOMAIN;
const port = process.env.PORT;

// Session configuration
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

// Authentication middleware
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized - Please login first' });
};

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
  origin: domain,
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Protect all API routes with authentication
app.use('/api', ensureAuthenticated);

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${domain}/auth/google/callback`,
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
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public'));

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/chat');
  } else {
    res.sendFile(__dirname + '/public/login.html');
  }
});

app.get('/chat', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(__dirname + '/public/chat.html');
  } else {
    res.redirect('/login');
  }
});

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

// Add user route to get user information
app.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    const user = {
      name: req.user.displayName,
      email: req.user.emails ? req.user.emails[0].value : '',
      photo: req.user.photos ? req.user.photos[0].value : null,
    };
    res.json(user);
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

app.post('/api/imagine', async (req, res) => {
  (async () => {
    try {
      const prompt = req.body.prompt;
      const imageTitle = await generateImageTitle(prompt);
      
      // Generate random seed between 1 and 1000000
      const seed = Math.floor(Math.random() * 1000000) + 1;
      
      // Pollinations.ai API endpoint with seed
      const pollinationsResponse = await fetch('https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?seed=' + seed, {
        method: 'GET'
      });

      if (!pollinationsResponse.ok) {
        throw new Error('Failed to generate image from Pollinations.ai');
      }

      const imageUrl = pollinationsResponse.url;
      console.log(`------------------------------------------------------------\n`.green);
      console.log(`${req.body.username}`.red +` Generated a Image: ${prompt}\n`.blue +`Ai response: ${imageUrl}\n`.cyan)
      console.log(`------------------------------------------------------------`.green)
      
      res.json({ 
        url: imageUrl,
        title: imageTitle,
        seed: seed // Including seed in response for reference
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to generate image' });
    }
  })();
});

app.post('/api/chat', async (req, res) => {
  const userMsg = req.body.message;
  const userName = `${req.body.username}-${req.body.id}`;
  // Initialize conversation history for the user if it doesn't exist
  if (!conversationHistory[userName]) {
    conversationHistory[userName] = [];
  }

  // Add user message to conversation history
  conversationHistory[userName].push({ role: 'user', content: userMsg });

  try {
    const botResponse = await getAIResponse(
      userMsg,
      req.body.username,
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

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + '/public/error.html');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(__dirname + '/public/error.html');
});

server.listen(port, () => {
  console.log(`Server started http://localhost:${port}/`);
});