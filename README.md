# Honey AI - Your Hinglish Speaking Companion 

A modern, interactive AI chatbot that communicates naturally in Hinglish (Hindi + English), making conversations more engaging and relatable for Indian users. Powered by Groq's LLaMA 3 model, Honey AI takes on the persona of a friendly 19-year-old Delhi college student who loves to chat about tech, college life, and everything in between!

[![Join Discord](https://img.shields.io/discord/951909987838468116?color=%237289DA&label=Join%20Discord&logo=discord&logoColor=white)](https://discord.gg/BCKjPjhBrm)
[![GitHub](https://img.shields.io/github/followers/ShreyJaiswal1?style=social)](https://github.com/ShreyJaiswal1)

### Support me
If you like my work, consider supporting me by buying me a coffee or two. Your support will help me to make things interesting and fun
> ```UPI id: 5aprilshrey@okhdfcbank```

## ✨ Features

- 🗣️ Natural Hinglish conversations
- 🎨 Modern, responsive UI with dark/light mode
- 🔐 Secure Google OAuth authentication
- 🖼️ AI image generation using `/imagine` command
- 💾 Conversation history tracking
- 🔄 Real-time chat using Socket.IO
- 🎯 Rate limiting for API protection
- 📱 Mobile-friendly design

## 🚀 Live Demo

Visit [Honey Lazyshrey](https://honey.lazyshrey.xyz/) to try out Honey AI!

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Image-generation**: Pollinations.ai
- **Real-time Communication**: Socket.IO
- **Authentication**: Google OAuth 2.0
- **AI Model**: Groq API (LLaMA 3)
- **Security**: Express-session, Passport.js

## 🏃‍♂️ Self-Hosting Guide

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- A Groq API key
- Google OAuth credentials

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShreyJaiswal1/aichatbot.git
   cd aichatbot
   ```

2. **Install dependencies**
   ```bash
   cd src
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the `src` directory with the following:
   ```env
   # Groq API Token (Required)
   GROQ_API_TOKEN=your_groq_api_token

   # Google OAuth (Required for authentication)
   OAUTH_ID=your_google_oauth_client_id
   OAUTH_SECRET=your_google_oauth_client_secret

   # Optional configurations
   PORT=3000
   DOMAIN=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   node server.js
   ```

5. **Access the application**
   Open your browser and visit `http://localhost:3000`

### Getting Required Credentials

1. **Groq API Token**
   - Visit [Groq Console](https://console.groq.com/keys)
   - Create a new API key
   - Copy the token to your `.env` file

2. **Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Set authorized redirect URI to `http://localhost:3000/auth/google/callback`
   - Copy Client ID and Client Secret to your `.env` file

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

- **Shrey Jaiswal**
  - GitHub: [@ShreyJaiswal1](https://github.com/ShreyJaiswal1)
  - Discord: [Join our community](https://discord.gg/BCKjPjhBrm)

## 📸 Screenshots

<p align="center">
<img src="https://cdn.discordapp.com/attachments/955580696779452436/1310636902067605546/image.png?ex=6745f13b&is=67449fbb&hm=fdf1e021be9a48a5b8f9e6bf38e75124bd375e645bf1b8b34db8420d3341c264&" alt="Honey AI" width="60%">
</p>

## 🔜 Upcoming Features

- Voice interactions
- Multi-language support
- Custom chatbot personality configuration
- Advanced conversation memory
- Integration with more AI models

---
<p align="center">Made with ❤️ by Shrey Jaiswal</p>
