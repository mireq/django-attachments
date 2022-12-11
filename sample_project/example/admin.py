# -*- coding: utf-8 -*-
from django.contrib import admin

from .admin_forms import ArticleForm
from .models import Article
from django_attachments.admin import AttachmentsAdminMixin


class ArticleAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
	form = ArticleForm


admin.site.register(Article, ArticleAdmin)
