# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django_attachments.fields import LibraryField, GalleryField


@python_2_unicode_compatible
class Article(models.Model):
	title = models.CharField(max_length=100)
	attachments = LibraryField(related_name='articles_with_attachment', on_delete=models.CASCADE)
	gallery = GalleryField(related_name='articles_with_gallery', on_delete=models.CASCADE)

	class Meta:
		verbose_name = "Article"
		verbose_name_plural = "Articles"

	def __str__(self):
		return self.title
