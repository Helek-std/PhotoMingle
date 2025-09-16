from typing import Optional
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions
from rest_framework_simplejwt.exceptions import InvalidToken


def get_response(req):
    return None

def enforce_csrf(request):
    """
    Enforce CSRF validation.
    """
    check = CSRFCheck(None)
    # populates request.META['CSRF_COOKIE'], which is used in process_view()
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        # CSRF failed, bail with explicit error message
        raise exceptions.PermissionDenied('CSRF Failed: %s' % reason)

class CustomAuthentication(JWTAuthentication):
    
    def token(self, request) -> Optional[bytes]:
        header = self.get_header(request)
        raw_token = bytes()
        
        if header is None:
            raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None
        else:
            raw_token = self.get_raw_token(header)
        
        return raw_token

    def authenticate(self, request):
        raw_token = self.token(request=request)
        if raw_token is None:
            return None
        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except:
            return None, None

    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)