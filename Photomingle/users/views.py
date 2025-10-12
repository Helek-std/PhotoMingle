from django.contrib.postgres.search import TrigramSimilarity
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import CustomUser
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


class UsersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search_query = request.query_params.get("search", "").strip()
        queryset = CustomUser.objects.all()

        if search_query:
            queryset = (
                queryset.annotate(similarity=TrigramSimilarity("email", search_query))
                        .filter(similarity__gt=0.1)
                        .order_by("-similarity")
            )

        serializer = MyInfoOutputSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data, status=200)

class AddUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        is_admin = request.data.get("is_staff") in ["true", "True", True, 1, "1"]
        avatar = request.FILES.get("avatar")

        if not email or not password:
            return Response({"error": "Email и пароль обязательны"}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "Пользователь с таким email уже существует"}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            role="admin" if is_admin else "customer",
        )

        if avatar:
            user.avatar = avatar
            user.save()

        return Response({"message": "Пользователь успешно создан"}, status=status.HTTP_201_CREATED)


class EditUserView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND)

        email = request.data.get("email")
        password = request.data.get("password")
        is_admin = request.data.get("is_staff") in ["true", "True", True, 1, "1"]
        avatar = request.FILES.get("avatar")

        if email:
            if CustomUser.objects.exclude(id=user_id).filter(email=email).exists():
                return Response({"error": "Пользователь с таким email уже существует"}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email

        if password:
            user.set_password(password)

        user.role = "admin" if is_admin else "customer"

        if avatar:
            user.avatar = avatar

        user.save()
        return Response({"message": "Пользователь успешно обновлён"}, status=status.HTTP_200_OK)


class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({"message": "Пользователь успешно удалён"}, status=status.HTTP_200_OK)