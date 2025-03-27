import os

SMTP_SERVER = os.environ.get("SMTP_SERVER")
SMTP_PORT = 465
SMTP_SENDER = os.environ.get("SMTP_SENDER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
OTP_SALT="ph0tom1ngles4l7"