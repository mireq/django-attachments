# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.utils.functional import cached_property
from django.views.generic import TemplateView

from .models import Article
from django_attachments.models import Library
from django_attachments.views import AttachmentEditableMixin


class IndexView(TemplateView):
	template_name = 'index.html'


class EditableAttachments(AttachmentEditableMixin, TemplateView):
	template_name = 'editable_attachments.html'

	@cached_property
	def article(self):
		article = Article.objects.filter(title='Test').first()
		if article is None:
			attachments = Library()
			attachments.save()
			gallery = Library()
			gallery.save()
			article = Article(title='Test', attachments=attachments, gallery=gallery)
			article.save()
		return article

	def get_library(self):
		return self.article.attachments
