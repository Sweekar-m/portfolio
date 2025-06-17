# Gathers/uses contact data
from utils.json_loader import load_json

def handle_contact():
    contact = load_json("json_data/contact.json")
    return f"Email: {contact.get('email')} | Location: {contact.get('location')}"
