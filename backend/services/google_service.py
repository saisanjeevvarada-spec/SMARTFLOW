import os
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

def is_google_auth_configured():
    client_id = os.getenv('GOOGLE_CLIENT_ID', '').strip()
    return bool(client_id)

def verify_google_token(token):
    client_id = os.getenv('GOOGLE_CLIENT_ID', '').strip()
    if not client_id:
        return False, "Google authentication is not configured.", None

    try:
        req = google_requests.Request()
        payload = google_id_token.verify_oauth2_token(token, req, client_id)
        return True, None, payload
    except Exception as e:
        print("Google token verification error:", e)
        return False, "Google authentication failed. Please try again.", None
