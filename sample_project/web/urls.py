# -*- coding: utf-8 -*-
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path

from example import views as example_views


urlpatterns = [
	path('admin/', admin.site.urls),
	path('', example_views.IndexView.as_view(), name='home'),
	path('attachments/', example_views.LiveUploadAttachments.as_view(), name='live_upload_attachments'),
	path('attachments-save/', example_views.OnSaveUploadAttachments.as_view(), name='on_save_upload_attachments'),
	path('gallery/', example_views.GalleryUpload.as_view(), name='gallery_upload'),
]

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
