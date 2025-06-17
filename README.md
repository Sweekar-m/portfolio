# AI Portfolio

This is a Flask-based AI portfolio web application.

## Features
- Modular structure for easy extension
- Static frontend assets (CSS, JS, demo videos)
- JSON-driven content for about, projects, and contact
- AI agent logic in the `agent/` directory

## Getting Started
1. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
2. Run the app:
   ```sh
   python app.py
   ```
3. Open your browser at http://127.0.0.1:5000/

## Project Structure
- `app.py`: Main Flask app
- `static/`: Frontend assets
- `templates/`: HTML templates
- `json_data/`: Static JSON data
- `agent/`: AI tools and logic
- `utils/`: Utility functions

## Customization
- Update JSON files in `json_data/` for your info and projects.
- Extend AI logic in `agent/tools/` as needed.
