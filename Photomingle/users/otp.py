import pyotp
import smtplib, ssl
import hashlib
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.core.cache import cache
from .constants import OTP_SALT, SMTP_PASSWORD, SMTP_PORT, SMTP_SENDER, SMTP_SERVER

class CacheManager:
    @staticmethod
    def generate_key(receiver: str) -> str:
        base32_payload = f"{hashlib.sha256(receiver.strip().encode()).hexdigest()}_{OTP_SALT}"
        return base64.b32encode(base32_payload.encode()).decode()

    @staticmethod
    def get_cache_value(key: str) -> str | None:
        return cache.get(key)

    @staticmethod
    def set_cache_value(key: str, value: str, timeout: int = 300) -> None:
        cache.set(key, value, timeout)

    @staticmethod
    def delete_cache_value(key: str) -> None:
        cache.delete(key)


class OTPGenerator:
    def __init__(self, receiver: str) -> None:
        self.__receiver: str = receiver
        self._otp: pyotp.TOTP = None
        self._otp_key = CacheManager.generate_key(receiver)
    
    def prepare(self) -> None:
        self._otp = pyotp.TOTP(self._otp_key, digits=6, interval=300)
        if self.code is None:
            self.code = self._otp.now()

    def verify(self, otp: str) -> bool:
        return self.code == otp

    @property
    def code(self) -> str | None:
        return CacheManager.get_cache_value(self._otp_key)
        
    @code.setter
    def code(self, value: str) -> None:
        CacheManager.set_cache_value(self._otp_key, value)

    @code.deleter
    def code(self) -> None:
        CacheManager.delete_cache_value(self._otp_key)

    @property
    def reciever(self) -> str:
        return self.__receiver

class EmailSender(OTPGenerator):

    def __init__(self, receiver: str) -> None:
        super().__init__(receiver)
        self.context = ssl._create_unverified_context()
        self.prepare()


    def __prepare_body(self) -> str:
        msg = MIMEMultipart()
        msg['From'] = SMTP_SENDER
        msg['To'] = self.reciever
        msg['Subject'] = 'Ваш двухфакторный код для PhotoMingle'

        html_content: str = ""
        with open('users/templates/email.html', 'r', encoding='utf-8') as file:
            html_content = file.read()
        html_content = html_content.replace("{two_factor_code}", self.code)
        body = MIMEText(html_content, 'html')
        msg.attach(body)
        return msg.as_string()

    def send_mail(self) -> bool:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=self.context, timeout=10) as server:
            try:
                server.login(SMTP_SENDER, SMTP_PASSWORD)
                server.sendmail(SMTP_SENDER, self.reciever, self.__prepare_body())
                return True
            except smtplib.SMTPAuthenticationError:
                print ("SMTP Send: error while authenticate to smtp server.")
            except smtplib.SMTPDataError:
                print ("SMTP Send: error while sending data via smtp")
            except smtplib.SMTPHeloError:
                print ("SMTP Server: error while helo client's server")
            except smtplib.SMTPConnectError:
                print ("SMTP Server: error while connecting to client's server")
            except smtplib.SMTPResponseException as e:
                print ("SMTP Error: ", e)
            finally:
                return False
        return False