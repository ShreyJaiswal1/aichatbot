class SpeechToTextService {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.micButton = document.getElementById('micButton');
        this.chatInput = document.getElementById('chatInput');
        
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.setupRecognition();
            this.setupEventListeners();
        } else {
            console.error('Speech recognition is not supported in this browser');
            this.micButton.style.display = 'none';
        }
    }

    setupRecognition() {
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US'; // You can change this to support other languages

        this.recognition.onstart = () => {
            this.isRecording = true;
            this.micButton.classList.add('recording');
            this.chatInput.placeholder = 'Listening...';
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            this.micButton.classList.remove('recording');
            this.chatInput.placeholder = 'Type your message here...';
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update the chat input with the transcribed text
            if (finalTranscript !== '') {
                this.chatInput.value = finalTranscript;
                // Trigger the input event to adjust textarea height
                const inputEvent = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                });
                this.chatInput.dispatchEvent(inputEvent);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopRecording();
        };
    }

    setupEventListeners() {
        this.micButton.addEventListener('click', () => {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        });
    }

    startRecording() {
        if (!this.isRecording && this.recognition) {
            this.recognition.start();
        }
    }

    stopRecording() {
        if (this.isRecording && this.recognition) {
            this.recognition.stop();
        }
    }
}

// Initialize the speech-to-text service when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpeechToTextService();
});
