# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import url
from django.contrib import admin
from django.contrib.auth.mixins import UserPassesTestMixin
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.generic import CreateView, TemplateView

from .forms import ImageUploadForm
from .models import Attachment, Library
from .views import AttachmentEditableMixin


class AttachmentsPermsMixin(UserPassesTestMixin):
	def test_func(self):
		user = self.request.user
		if not user.is_authenticated():
			return False
		if not user.is_staff:
			return False
		if not user.has_perm('attachments.change_attachment'):
			return False
		return True


class LibraryEditView(AttachmentsPermsMixin, AttachmentEditableMixin, TemplateView):
	template_name = 'admin/attachments/library_edit.html'

	def get_library(self):
		return get_object_or_404(Library, pk=self.kwargs['pk'])


class GalleryEditView(LibraryEditView):
	upload_form_class = ImageUploadForm


class LibraryCreateViw(AttachmentsPermsMixin, CreateView):
	template_name = 'admin/attachments/library_create.html'
	model = Library
	fields = ('title',)

	def form_valid(self, form):
		self.object = form.save()
		return JsonResponse({'id': self.object.pk})


class AttachmentsInline(admin.TabularInline):
	model = Attachment


class LibraryAdmin(admin.ModelAdmin):
	inlines = [AttachmentsInline]
	raw_id_fields = ('primary_attachment',)

	def get_urls(self):
		urlpatterns = super(LibraryAdmin, self).get_urls()
		urlpatterns = [
			url(r'^api/create/$', LibraryCreateViw.as_view(), name='attachments_library_create_api'),
			url(r'^api/attachments/(?P<pk>\d+)/$', LibraryEditView.as_view(), name='attachments_library_edit_api'),
			url(r'^api/gallery/(?P<pk>\d+)/$', GalleryEditView.as_view(), name='attachments_gallery_edit_api'),
		] + urlpatterns
		return urlpatterns


admin.site.register(Attachment)
admin.site.register(Library, LibraryAdmin)
