const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const {
  getAIResponse,
  generateImageTitle,
} = require('./utils/getAiresponse.js');
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  where,
  writeBatch,
  orderBy,
} = require('firebase/firestore');
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
const firebaseConfig = require('./utils/firebaseConfig.js');
const domain = process.env.DOMAIN;
const port = process.env.PORT;

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

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
app.use(
  cors({
    origin: domain,
    methods: ['GET', 'POST'],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(bodyParser.json());

// Protect all API routes with authentication
app.use('/api', ensureAuthenticated);
app.use('/user', ensureAuthenticated);

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

// Handle API requests
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
});

app.use(express.static(__dirname + '/public'));

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/chat');
  } else {
    res.sendFile(__dirname + '/public/html/login.html');
  }
});

app.get('/chat', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(__dirname + '/public/html/chat.html');
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
  try {
    const userName = req.body.username;
    const userId = req.user.id;
    const prompt = req.body.prompt;
    const imageTitle = await generateImageTitle(prompt);

    // Generate random seed between 1 and 1000000
    const seed = Math.floor(Math.random() * 1000000) + 1;

    // Pollinations.ai API endpoint with seed
    const pollinationsResponse = await fetch(
      'https://image.pollinations.ai/prompt/' +
        encodeURIComponent(prompt) +
        '?seed=' +
        seed,
      {
        method: 'GET',
      }
    );

    if (!pollinationsResponse.ok) {
      throw new Error('Failed to generate image from Pollinations.ai');
    }

    const imageUrl = pollinationsResponse.url;
    console.log(
      `------------------------------------------------------------\n`.green
    );
    console.log(
      `${req.body.username}`.red +
        ` Generated a Image: ${prompt}\n`.blue +
        `Ai response: ${imageUrl}\n`.cyan
    );
    console.log(
      `------------------------------------------------------------`.green
    );
    // Save chat history to Firestore
    await addDoc(collection(db, 'chatHistory'), {
      userName,
      prompt,
      userId,
      imageTitle,
      imageUrl,
      timestamp: new Date(),
    });

    res.json({
      url: imageUrl,
      title: imageTitle,
      seed: seed, // Including seed in response for reference
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

app.post('/api/chat', async (req, res) => {
  const userMsg = req.body.message;
  const userName = req.body.username;
  const userId = req.user.id;
  try {
    const botResponse = await getAIResponse(userMsg, userName, userId);
    await addDoc(collection(db, 'chatHistory'), {
      userName,
      userMsg,
      userId,
      botResponse,
      timestamp: new Date(),
    });

    res.json({ reply: botResponse });
  } catch (error) {
    console.error('Error in AI response:', error);
    res
      .status(500)
      .json({ error: 'Something went wrong with the AI response' });
  }
});

app.get('/api/chatHistory', async (req, res) => {
  const userId = req.user.id;
  try {
  const q = query(
    collection(db, 'chatHistory'),
    where('userId', '==', userId),
    orderBy('timestamp', 'asc')
  );

    const querySnapshot = await getDocs(q);
    const chatHistory = querySnapshot.docs.map((doc) => doc.data());
    res.json(chatHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

app.delete('/api/clearHistory', async (req, res) => {
  const userId = req.user.id;
  try {
    const chatHistoryRef = collection(db, 'chatHistory');
    const q = query(chatHistoryRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      return res.status(200).json({
        message: 'No chat history found for the user.',
      });
    }

    const batch = writeBatch(db);
    let deletedCount = 0;
    querySnapshot.forEach((document) => {
      batch.delete(doc(db, 'chatHistory', document.id));
      deletedCount++;
    });
    await batch.commit();

    res.json({
        message: `Successfully deleted ${deletedCount} chat entries.`,
      });
  } catch (error) {
    console.error('Error deleting user entries:', error);
  }
})

io.on('connection', (socket) => {
  var usr = null;
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
  res.status(404).sendFile(__dirname + '/public/html/error.html');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(__dirname + '/public/html/error.html');
});

server.listen(port, () => {
  console.log(`Server started http://localhost:${port}/`);
});

