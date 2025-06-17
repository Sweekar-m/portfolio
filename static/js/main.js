function opengreeting() {
  const greeting = "Welcome to Sweekar's AI Portfolio. Experience the future of interactive portfolios.";
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(greeting);
    utter.rate = 1.02;
    utter.pitch = 1.1;
    utter.volume = 1;
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  }
}

// Try to greet on DOMContentLoaded
document.addEventListener('DOMContentLoaded', opengreeting);

// Fallback: greet on first user interaction if blocked
window.addEventListener('click', function greetOnce() {
  opengreeting();
  window.removeEventListener('click', greetOnce);
});
// --------- Scroll to Section ---------
function scrollToSection(id) {
  const section = document.getElementById(id);
  section.scrollIntoView({ behavior: "smooth" });
}

// --------- Popup for Project Demo ---------
function openPopup(index) {
  const popup = document.getElementById("popup");
  const video = document.getElementById("demoVideo");
  video.src = demoVideos[index];
  popup.classList.remove("hidden");
}

function closePopup() {
  const popup = document.getElementById("popup");
  const video = document.getElementById("demoVideo");
  video.pause();
  video.src = "";
  popup.classList.add("hidden");
}

// --------- Text Chat Logic ---------
async function sendMessage() {
  const input = document.getElementById("userInput");
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage(msg, "user");
  input.value = "";

  const res = await fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });

  const data = await res.json();
  appendMessage(data.response, "bot");
}

function appendMessage(text, sender = "bot") {
  const chatbox = document.getElementById("chatbox");
  const msgDiv = document.createElement("div");
  msgDiv.className = `chatbot-message ${sender}`;
  msgDiv.textContent = text;
  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Optionally, send on Enter key
const userInput = document.getElementById("userInput");
if (userInput) {
  userInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendMessage();
  });
}

// --------- Voice Input (Audio Recording & Upload) ---------
const voiceBtn = document.getElementById("startVoice");
const voiceOutput = document.getElementById("voiceResponse");
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let stream = null;

async function sendAudioToBackend(audioBlob) {
  voiceOutput.innerHTML = '<em>Processing audio...</em>';
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-input.webm');
    const res = await fetch('/voice', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    // Show transcript and response
    voiceOutput.innerHTML = `<strong>You:</strong> ${data.transcript}<br><strong>AI:</strong> ${data.response}`;
    appendVoiceMessage('You: ' + data.transcript, 'user');
    appendVoiceMessage('AI: ' + data.response, 'bot');
    // Speak the LLM response
    if ('speechSynthesis' in window && data.response) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(data.response);
      utter.rate = 1.02;
      utter.pitch = 1.1;
      utter.volume = 1;
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  } catch (err) {
    voiceOutput.innerHTML = '<span style="color:red">Error processing audio.</span>';
  }
  // Reset button and visualizer
  voiceBtn.textContent = 'Start Talking';
  isRecording = false;
  stopVoiceVisualizer();
}

if (voiceBtn) {
  voiceBtn.onclick = async () => {
    if (!isRecording) {
      // Start recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Audio recording not supported in this browser.');
        return;
      }
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        sendAudioToBackend(audioBlob);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
      mediaRecorder.start();
      isRecording = true;
      voiceBtn.textContent = 'Stop & Send';
      voiceOutput.innerHTML = '<em>Recording... Click again to send.</em>';
      startVoiceVisualizer();
    } else {
      // Stop recording
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }
  };
}

// --- Voicebot UI logic ---
function appendVoiceMessage(text, sender = 'bot') {
  const msgArea = document.getElementById('voicebot-messages');
  if (!msgArea) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = `voicebot-message ${sender}`;
  msgDiv.textContent = text;
  msgArea.appendChild(msgDiv);
  msgArea.scrollTop = msgArea.scrollHeight;
}

function startVoiceChat() {
  // Simulate user speaking
  appendVoiceMessage('You: Hello, AI!', 'user');
  // Simulate bot response (replace with real voice recognition/response)
  setTimeout(() => {
    appendVoiceMessage('AI: Hi there! How can I assist you today?', 'bot');
  }, 900);
}

// --- Voice Visualizer ---
let audioContext, analyser, micStream, animationId;
const bars = [
  document.getElementById('bar1'),
  document.getElementById('bar2'),
  document.getElementById('bar3')
];

function startVoiceVisualizer() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    micStream = audioContext.createMediaStreamSource(stream);
    micStream.connect(analyser);
    analyser.fftSize = 32;
    animateBars();
  }).catch(() => {
    // fallback: animate bars randomly if mic not allowed
    animateBars(true);
  });
}

function animateBars(fallback = false) {
  const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 3);
  function draw() {
    if (analyser && !fallback) {
      analyser.getByteFrequencyData(dataArray);
      // Use three frequency bins for three bars
      for (let i = 0; i < 3; i++) {
        const val = dataArray[i + 1] || 0;
        const h = Math.max(18, Math.min(38, val / 3));
        bars[i].style.height = h + 'px';
        bars[i].style.background = `linear-gradient(180deg, #8be9fd ${(val/2.5)}%, #232946 100%)`;
      }
      // Reset if silent
      if (dataArray.reduce((a, b) => a + b, 0) < 10) {
        bars.forEach(bar => bar.style.height = '18px');
      }
    } else {
      // fallback: animate bars up/down
      for (let i = 0; i < 3; i++) {
        const h = 18 + Math.random() * 20;
        bars[i].style.height = h + 'px';
      }
    }
    animationId = requestAnimationFrame(draw);
  }
  draw();
}

function stopVoiceVisualizer() {
  if (animationId) cancelAnimationFrame(animationId);
  if (audioContext) audioContext.close();
  bars.forEach(bar => bar.style.height = '18px');
}

// Start visualizer when mic button is pressed
const micBtn = document.getElementById('startVoice');
if (micBtn) {
  micBtn.addEventListener('click', startVoiceVisualizer);
}

// --------- Greeting Function ---------

