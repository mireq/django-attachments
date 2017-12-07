# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django import forms


class LibraryFormField(forms.ModelChoiceField):
	pass


class GalleryFormField(LibraryFormField):
	pass


class LibraryField(models.ForeignKey):
	description = "Attachments"

	def __init__(self, to='django_attachments.Library', *args, **kwargs):
		super(LibraryField, self).__init__(to, *args, **kwargs)

	def formfield(self, **kwargs):
		defaults = {'form_class': LibraryFormField}
		defaults.update(kwargs)
		return super(LibraryField, self).formfield(**defaults)


class GalleryField(LibraryField):
	description = "Gallery"

	def formfield(self, **kwargs):
		defaults = {'form_class': GalleryFormField}
		defaults.update(kwargs)
		return super(GalleryField, self).formfield(**defaults)
