# Handles queries about you
from utils.json_loader import load_json

def handle_about():
    about = load_json("json_data/about.json")
    return about.get("summary", "About info not available.")
