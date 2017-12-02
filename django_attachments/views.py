# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http.response import HttpResponseRedirect
from django.utils.functional import cached_property
from django.http import HttpResponse
from easy_thumbnails.files import get_thumbnailer

import json
from .forms import AttachmentUploadForm, AttachmentUpdateFormSet


class AttachmentEditableMixin(object):
	upload_form_class = AttachmentUploadForm
	update_form_class = AttachmentUpdateFormSet
	thumbnail_options = {
		'thumbnail': {'crop': True, 'size': (200, 150)},
	}

	def can_upload_attachment(self):
		return True

	def can_update_attachment(self):
		return True

	def get_library(self):
		raise NotImplementedError

	def get_attachment_form_kwargs(self, action, **extra_kwargs):
		kwargs = {}
		kwargs.update(extra_kwargs)
		if self.request.POST.get('action') == action:
			kwargs.update({
				'data': self.request.POST,
				'files': self.request.FILES,
			})
		return kwargs

	def get_upload_form_kwargs(self):
		return self.get_attachment_form_kwargs('upload', library=self.get_library())

	def get_update_form_kwargs(self):
		return self.get_attachment_form_kwargs('update', queryset=self.get_library().attachment_set.all())

	@cached_property
	def upload_form(self):
		if self.can_upload_attachment():
			return self.upload_form_class(**self.get_upload_form_kwargs())
		else:
			return None

	@cached_property
	def update_form(self):
		if self.can_update_attachment():
			return self.update_form_class(**self.get_update_form_kwargs())
		else:
			return None

	def get_context_data(self, **kwargs):
		ctx = super(AttachmentEditableMixin, self).get_context_data(**kwargs)
		ctx['upload_form'] = self.upload_form
		ctx['update_form'] = self.update_form
		return ctx

	def post(self, request, *args, **kwargs):
		if self.request.POST.get('action') == 'upload' and self.upload_form:
			if self.upload_form.is_valid():
				return self.upload_form_valid()
			else:
				return self.upload_form_invalid()
		if self.request.POST.get('action') == 'update' and self.upload_form:
			if self.update_form.is_valid():
				return self.update_form_valid()
			else:
				return self.update_form_invalid()
		return super(AttachmentEditableMixin, self).post(request, *args, **kwargs)

	def upload_form_valid(self):
		self.upload_form.save()
		if self.request.POST.get('attachments') == 'json':
			return self.render_json_attachments()
		return HttpResponseRedirect(self.request.get_full_path())

	def upload_form_invalid(self):
		return self.render_to_response(self.get_context_data())

	def update_form_valid(self):
		self.update_form.save()
		if self.request.POST.get('attachments') == 'json':
			return self.render_json_attachments()
		return HttpResponseRedirect(self.request.get_full_path())

	def update_form_invalid(self):
		return self.render_to_response(self.get_context_data())

	def get(self, request, *args, **kwargs):
		if request.GET.get('attachments') == 'json':
			return self.render_json_attachments()
		return super(AttachmentEditableMixin, self).get(request, *args, **kwargs)

	def serialize_attachemnts(self):
		attachments = self.get_library().attachment_set.all()
		attachments_data = []
		for attachment in attachments:
			attachment_data = {
				'id': attachment.pk,
				'name': attachment.original_name,
				'rank': attachment.rank,
				'filesize': attachment.filesize,
				'mimetype': attachment.mimetype,
			}
			if attachment.is_image:
				attachment_data['image_width'] = attachment.image_width
				attachment_data['image_height'] = attachment.image_height
				thumbnails = {}
				thumbnailer = get_thumbnailer(attachment.file)
				for key, options in self.thumbnail_options.items():
					attachment_data[key] = thumbnailer.get_thumbnail(options).url
			attachments_data.append(attachment_data)
		return attachments_data

	def render_json_attachments(self):
		attachments = json.dumps(self.serialize_attachemnts())
		return HttpResponse(attachments, 'application/json')
