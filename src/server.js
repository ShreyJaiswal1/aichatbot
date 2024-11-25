const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// const rateLimit = require('express-rate-limit');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
<<<<<<< Updated upstream
const getAIResponse = require('./getAiresponse.js');
=======
const { getAIResponse, generateImageTitle } = require('./utils/getAiresponse.js');
>>>>>>> Stashed changes
const app = express();
const server = http.createServer(app);
const colors = require('colors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
<<<<<<< Updated upstream
=======
const crypto = require('crypto');
const sessionSecret = crypto.randomBytes(32).toString('hex');
>>>>>>> Stashed changes
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
<<<<<<< Updated upstream
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
=======
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
      clientID: process.env.OAUTH_ID,
      clientSecret: process.env.OAUTH_SECRET,
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

>>>>>>> Stashed changes
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

var userID = null;
<<<<<<< Updated upstream
app.get('/user', (req, res) => {
  userID = req.user.id;
  if (req.user) {
      res.json({ 
          name: req.user.displayName,
          email: req.user.emails?.[0]?.value,
          picture: req.user.photos?.[0]?.value
      });
  } else {
      res.status(401).json({ error: 'Not authenticated' });
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
app.post('/api/imagine', async (req, res) => {
  (async () => {
    const { Client } = await import('@gradio/client');
    const { prompt } = req.body; // Extract the prompt from the request body

  try {
    const client = await Client.connect("randomtable/Simple-FLUX-Image-Generator", {
            headers: {
                Authorization: `Bearer ${process.env.HUGGING_TOKEN}`,
            }
    });
    const result = await client.predict("/infer", { 
      prompt: prompt, 
      seed: 0, 
      randomize_seed: true, 
      width: 1024, 
      height: 1024, 
      guidance_scale: 0, 
      num_inference_steps: 8 
    });

    const imageUrl = result.data[0].url;
    console.log(`------------------------------------------------------------\n`.green);
    console.log(`${req.body.username}`.red +` Generated a Image: ${prompt}\n`.blue +`Ai response: ${imageUrl}\n`.cyan)
    console.log(`------------------------------------------------------------`.green)
    res.json({ url: imageUrl }); // Return the image URL as a JSON response

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Image generation failed' });
  }
  })();
  
  
=======

app.post('/api/imagine', async (req, res) => {
  (async () => {
    try {
      const prompt = req.body.prompt;
      const imageTitle = await generateImageTitle(prompt);
      const { Client } = await import('@gradio/client');
      const client = await Client.connect("randomtable/Simple-FLUX-Image-Generator", {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_TOKEN}`,
        }
      });
      const result = await client.predict("/infer", { 
        prompt: prompt, 
        seed: 0, 
        randomize_seed: true, 
        width: 1024, 
        height: 1024, 
        guidance_scale: 0, 
        num_inference_steps: 8 
      });

      const imageUrl = result.data[0].url;
      console.log(`------------------------------------------------------------\n`.green);
      console.log(`${req.body.username}`.red +` Generated a Image: ${prompt}\n`.blue +`Ai response: ${imageUrl}\n`.cyan)
      console.log(`------------------------------------------------------------`.green)
      
      res.json({ 
        url: imageUrl,
        title: imageTitle 
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to generate image' });
    }
  })();
>>>>>>> Stashed changes
});

var userName = '';
app.post('/api/chat', async (req, res) => {
  const userMsg = req.body.message;
  userName = `${req.body.username}-${userID}`;
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
<<<<<<< Updated upstream
      conversationHistory[userName]
=======
        conversationHistory[userName]
>>>>>>> Stashed changes
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