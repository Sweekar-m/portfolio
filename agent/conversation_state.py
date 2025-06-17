# agent/conversation_state.py

class ConversationState:
    def __init__(self):
        self.state = {}

    def update(self, user_id, last_intent, last_topic=None):
        self.state[user_id] = {
            "last_intent": last_intent,
            "last_topic": last_topic
        }

    def get(self, user_id):
        return self.state.get(user_id, {})

    def clear(self, user_id):
        if user_id in self.state:
            del self.state[user_id]
