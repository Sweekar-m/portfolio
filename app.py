import subprocess
subprocess.run(["apt-get", "update"])
subprocess.run(["apt-get", "install", "-y", "ffmpeg"])

from flask import Flask, render_template, request, jsonify
from agent.tool_router import route_intent
from agent.llama_client import ask_llama
from utils.json_loader import load_json
from faster_whisper import WhisperModel
from io import BytesIO
from pydub import AudioSegment
import sys
import os
import socket

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)

# Load Whisper model once
whisper_model = WhisperModel("base", device="cpu", compute_type="int8")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    user_input = request.json.get('message')
    llama_response = ask_llama(user_input)

    intent = llama_response.get("intent")
    llm_reply = llama_response.get("reply", "")
    tool_reply = route_intent(intent, llama_response)

    final_reply = tool_reply if tool_reply else llm_reply
    return jsonify({"response": final_reply})

@app.route('/voice', methods=['POST'])
def voice():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    audio_bytes = BytesIO(audio_file.read())

    try:
        # Convert webm to wav
        webm_audio = AudioSegment.from_file(audio_bytes, format="webm")
        wav_io = BytesIO()
        webm_audio.export(wav_io, format="wav")
        wav_io.seek(0)
    except Exception as e:
        return jsonify({'error': f'Audio conversion failed: {str(e)}'}), 500

    try:
        segments, info = whisper_model.transcribe(wav_io)
        transcript = " ".join([seg.text for seg in segments]).strip()
        print(f"Transcribed: {transcript}")
    except Exception as e:
        return jsonify({'error': f'Transcription failed: {str(e)}'}), 500

    llama_response = ask_llama(transcript)
    intent = llama_response.get("intent", "chitchat")
    llm_reply = llama_response.get("reply", "")
    tool_reply = route_intent(intent, llama_response)

    final_reply = tool_reply if tool_reply else llm_reply

    return jsonify({
        'transcript': transcript,
        'response': final_reply
    })

if __name__ == '__main__':
    ip = socket.gethostbyname(socket.gethostname())
    print(f"\n🟢 Open this on your phone: http://{ip}:5000\n")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
