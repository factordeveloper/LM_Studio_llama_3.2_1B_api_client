document.getElementById('record-btn').addEventListener('mousedown', startRecording);
document.getElementById('record-btn').addEventListener('mouseup', stopRecording);

let recognition;
const chatContainer = document.getElementById('chat-container');

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
} else {
    recognition = new SpeechRecognition();
}

recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'es-ES';

function startRecording() {
    chatContainer.classList.add('recording');
    recognition.start();
}

function stopRecording() {
    chatContainer.classList.remove('recording');
    recognition.stop();
}

recognition.onresult = function(event) {
    const userInput = event.results[0][0].transcript;
    appendMessage('user', userInput);
    sendMessage(userInput);
};

function sendMessage(userInput) {
    const url = 'http://127.0.0.1:1234/v1/chat/completions';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "llama-3.2-1b-instruct",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful jokester."
                },
                {
                    role: "user",
                    content: userInput
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "joke_response",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            joke: {
                                type: "string"
                            }
                        },
                        required: ["joke"]
                    }
                }
            },
            temperature: 0.7,
            max_tokens: 50,
            stream: false
        })
    })
    .then(response => response.json())
    .then(data => {
        const aiResponse = JSON.parse(data.choices[0].message.content).joke;
        appendMessage('bot', aiResponse);
        speak(aiResponse);
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('bot', 'Error: Unable to fetch response.');
    });
}

function appendMessage(role, text) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);

    const messageText = document.createElement('div');
    messageText.classList.add('text');
    messageText.textContent = text;

    messageDiv.appendChild(messageText);
    chatBox.appendChild(messageDiv);

    chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    synth.speak(utterance);
}
