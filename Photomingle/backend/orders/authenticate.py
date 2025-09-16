from typing import Optional
from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.exceptions import InvalidToken

import Photomingle

class IsAuthenticatedViaJWT(BasePermission):
    """
    Allows access only to authenticated users.
    """

    def has_permission(self, request, view):
        auth_middleware: Photomingle.users.authenticate.CustomAuthentication = request.authenticators[0]
        raw_token: Optional[bytes] = auth_middleware.token(request)
        if (raw_token) is None:
            return False
        try:
            auth_middleware.get_validated_token(raw_token)
            return True
        except InvalidToken:
            return False