from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    RegisterInputSerializer,
    LoginInputSerializer,
    TwoFactorInputSerializer,
    MyInfoOutputSerializer, LogoutInputSerializer
)
from .services import register_user, login_user, verify_two_factor, get_user_info, logout_all_sessions, \
    logout_current_session


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, message = register_user(
            serializer.validated_data["email"],
            serializer.validated_data["password"]
        )
        if not user and "существует" in message:
            return Response({"error": message}, status=status.HTTP_409_CONFLICT)
        if not user:
            return Response({"message": message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "2FA required", "user_id": str(user.id)}, status=status.HTTP_202_ACCEPTED)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        serializer = LoginInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, message = login_user(
            serializer.validated_data["email"],
            serializer.validated_data["password"]
        )
        if not user:
            return Response({"error": message}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({"message": "2FA required", "email": str(user.email)}, status=status.HTTP_200_OK)

class TwoFactorAuthView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        serializer = TwoFactorInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, error = verify_two_factor(
            request,
            serializer.validated_data["email"],
            serializer.validated_data["code"]
        )
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_200_OK)

class LogoutView(APIView):
    def post(self, request):
        serializer = LogoutInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data["all"]:
            logout_all_sessions(request.user)
            return Response({"message": "Все сессии завершены"}, status=status.HTTP_200_OK)
        else:
            logout_current_session(request)
            return Response({"message": "Текущая сессия завершена"}, status=status.HTTP_200_OK)

class MyInfo(APIView):
    def get(self, request):
        user_info = get_user_info(request.user.id)
        output =  MyInfoOutputSerializer(user_info)
        return Response(output.data, status=status.HTTP_200_OK)