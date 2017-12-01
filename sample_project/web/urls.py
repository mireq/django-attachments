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
	url(r'^attachments/$', example_views.EditableAttachments.as_view(), name='attachments'),
]

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
