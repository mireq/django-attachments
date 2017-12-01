# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.utils.encoding import python_2_unicode_compatible


@python_2_unicode_compatible
class Article(models.Model):
	title = models.CharField(max_length=100)
	attachments = models.ForeignKey('django_attachments.Library', related_name='articles_with_attachment')
	gallery = models.ForeignKey('django_attachments.Library', related_name='articles_with_gallery')

	class Meta:
		verbose_name = "Article"
		verbose_name_plural = "Articles"

	def __str__(self):
		return self.title
