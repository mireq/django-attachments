# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from .models import Article
from django_attachments.admin import AttachmentsAdminMixin


class ArticleAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
	pass


admin.site.register(Article, ArticleAdmin)
