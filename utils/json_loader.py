# Utility to load and cache JSON files
import json
import os

def load_json(filename):
    path = os.path.join(os.getcwd(), filename)
    with open(path, 'r') as f:
        return json.load(f)
