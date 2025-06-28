from agent.tools.about_tool import handle_about
from agent.tools.project_tool import handle_projects
from agent.tools.contact_tool import handle_contact
from agent.tools.chitchat_tool import handle_chitchat  

def route_intent(intent):
    if intent == "get_about":
        # handle_about expects no arguments
        return handle_about()
    elif intent == "get_projects":
        # handle_projects expects no arguments
        return handle_projects()
    elif intent == "get_contact_info":
        # handle_contact expects no arguments
        return handle_contact()
    elif intent in ["greeting", "goodbye", "thanks", "who_are_you"]:  
        return handle_chitchat(intent)
    else:
        return None
