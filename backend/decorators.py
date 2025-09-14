from functools import wraps

from flask import current_app, request, jsonify


def authorisation_required():
    def decorator(func):
        @wraps(func)
        def wrapped_function(*args, **kwargs):
            data = request.get_json()
            auth_token = data.get('auth_token') if data else None
            if auth_token != current_app.config.get('PROD_PASSCODE'):
                return jsonify({"error": "Unauthorized"}), 401
            return func(*args, **kwargs)
        return wrapped_function
    return decorator