import requests
import json
from utils.json_loader import load_json

OPENROUTER_API_KEY = "YOUR_OPENROUTER_API_KEY"
MODEL = "meta-llama/llama-3-8b-instruct"

def ask_llama(prompt):
    # Load local data
    about = load_json("json_data/about.json")
    projects = load_json("json_data/projects.json")
    contact = load_json("json_data/contact.json")

    # Build system prompt
    system_prompt = f"""
You are a helpful and intelligent personal assistant for Sweekar, an AI engineer.

Refer only to this structured data to answer:

[ABOUT]
Name: {about.get("name")}
Title: {about.get("title")}
Summary: {about.get("summary")}

[PROJECTS]
{" | ".join([f"{p['title']}: {p['summary']}" for p in projects])}

[CONTACT]
Email: {contact.get("email")}
Phone: {contact.get("phone")}
Location: {contact.get("location")}
LinkedIn: {contact.get("linkedin")}
GitHub: {contact.get("github")}

Respond in this exact JSON format:
{{ "intent": "...", "reply": "..." }}

If the user asks multiple things in one sentence, combine the relevant replies into one clear, short paragraph. Use fallback intent `"multi"` for mixed cases.

Examples:

User: "Hi"
Assistant: {{ "intent": "greeting", "reply": "Hey there! I'm Sweekar's assistant. How can I help you today?" }}

User: "Tell me about Sweekar and his projects"
Assistant: {{ "intent": "multi", "reply": "Sweekar is an AI engineer passionate about building innovative tools. His top projects include SlideNova (AI slide generator), Stealth Assistant (real-time screen/audio analyzer), and FoodieSpot AI (restaurant AI bot)." }}
"""


    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    body = {
        "model": MODEL,
        "messages": [
            { "role": "system", "content": system_prompt.strip() },
            { "role": "user", "content": prompt }
        ]
    }

    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=body, headers=headers)
        content = response.json()["choices"][0]["message"]["content"]
        return json.loads(content)
    except Exception as e:
        print("LLM error:", e)
        return {
            "intent": "unknown",
            "reply": "Sorry, I couldn't process your request."
        }
