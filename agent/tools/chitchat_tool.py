# tools/chitchat_tool.py

def handle_chitchat(intent):
    chitchat_responses = {
        "greeting": "Hey there! I'm Sweekar's assistant. How can I help you today?",
        "goodbye": "Goodbye! Have a great day.",
        "thanks": "You're welcome!",
        "who_are_you": "I'm a personal assistant built by Sweekar to help showcase his work and journey.",
        "default": "I'm here to help! Ask me about Sweekar's projects, background, or contact info."
    }

    return chitchat_responses.get(intent, chitchat_responses["default"])
