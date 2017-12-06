# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static
from django.contrib import admin
from example import views as example_views


urlpatterns = [
	url(r'^admin/', admin.site.urls),
	url(r'^$', example_views.IndexView.as_view(), name='home'),
	url(r'^attachments/$', example_views.LiveUploadAttachments.as_view(), name='live_upload_attachments'),
	url(r'^attachments-save/$', example_views.OnSaveUploadAttachments.as_view(), name='on_save_upload_attachments'),
]

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
