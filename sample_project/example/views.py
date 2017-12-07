# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.utils.functional import cached_property
from django.views.generic import TemplateView

from .models import Article
from django_attachments.forms import ImageUploadForm
from django_attachments.models import Library
from django_attachments.views import AttachmentEditableMixin


class IndexView(TemplateView):
	template_name = 'index.html'


class GetOrCreateArticleMixin(object):
	article_title = 'Test'

	@cached_property
	def article(self):
		article = Article.objects.filter(title=self.article_title).first()
		if article is None:
			attachments = Library()
			attachments.save()
			gallery = Library()
			gallery.save()
			article = Article(title=self.article_title, attachments=attachments, gallery=gallery)
			article.save()
		return article


class LiveUploadAttachments(AttachmentEditableMixin, GetOrCreateArticleMixin, TemplateView):
	template_name = 'live_upload_attachments.html'

	def get_library(self):
		return self.article.attachments


class OnSaveUploadAttachments(AttachmentEditableMixin, GetOrCreateArticleMixin, TemplateView):
	article_title = 'Test 2'
	template_name = 'on_save_upload_attachments.html'

	def get_library(self):
		return self.article.attachments


class GalleryUpload(AttachmentEditableMixin, GetOrCreateArticleMixin, TemplateView):
	template_name = 'gallery_upload.html'
	upload_form_class = ImageUploadForm

	def get_library(self):
		return self.article.gallery
