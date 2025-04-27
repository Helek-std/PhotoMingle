from storages.backends.s3boto3 import S3Boto3Storage, S3StaticStorage
from .settings import AWS_STORAGE_BUCKET_NAME, STATICFILES_LOCATION, MEDIAFILES_LOCATION


class MediaStorage(S3Boto3Storage):
    bucket_name = AWS_STORAGE_BUCKET_NAME
    location = MEDIAFILES_LOCATION
    file_overwrite = False

class StaticStorage(S3StaticStorage):
    bucket_name = AWS_STORAGE_BUCKET_NAME
    location = STATICFILES_LOCATION