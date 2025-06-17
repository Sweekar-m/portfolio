# agent/tools/project_tool.py

import json

project_index = 0

def load_projects():
    with open("json_data/projects.json") as f:
        return json.load(f)

def handle_projects():
    global project_index
    project_index = 0
    projects = load_projects()
    output = "\n".join([f"- {p['title']}: {p['summary']}" for p in projects[:3]])
    return f"Here are some projects:\n{output}"

def handle_another_project():
    global project_index
    projects = load_projects()
    project_index = (project_index + 1) % len(projects)
    p = projects[project_index]
    return f"Another one: {p['title']} — {p['summary']}"
