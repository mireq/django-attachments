# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import mimetypes
from os import path
from uuid import uuid4
from io import BytesIO
from PIL import Image

from django.db import models
from django.db.models import F, Max
from django.utils import timezone
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from easy_thumbnails.fields import ThumbnailerField


class TimestampModelMixin(models.Model):
	created = models.DateTimeField(_("Created"), editable=False, db_index=True)
	updated = models.DateTimeField(_("Updated"), editable=False, db_index=True)

	def save(self, *args, **kwargs):
		self.updated = timezone.now()
		if not self.id and not self.created:
			self.created = self.updated
		return super(TimestampModelMixin, self).save(*args, **kwargs)

	class Meta:
		abstract = True


def upload_path_handler(instance, filename):
	pk = instance.library.pk
	filename = str(uuid4()) + path.splitext(filename)[1]
	return path.join('attachments', "{0:02x}".format(pk % 256), str(pk), filename)


@python_2_unicode_compatible
class Library(TimestampModelMixin, models.Model):
	title = models.CharField(
		verbose_name=_("Name"),
		max_length=255,
		blank=True
	)
	primary_attachment = models.ForeignKey(
		'Attachment',
		verbose_name=_("Primary attachment"),
		blank=True,
		null=True,
		on_delete=models.SET_NULL,
		related_name='attachments_library'
	)

	class Meta:
		verbose_name = _("Library")
		verbose_name_plural = _("Libraries")

	def __str__(self):
		return self.title


class AttachmentQuerySet(models.QuerySet):
	def images(self):
		return self.filter(image_width__isnull=False)


@python_2_unicode_compatible
class Attachment(TimestampModelMixin, models.Model):
	objects = AttachmentQuerySet.as_manager()

	library = models.ForeignKey(
		Library,
		verbose_name=_("Library"),
		on_delete=models.CASCADE
	)
	rank = models.IntegerField(
		verbose_name=_("Rank")
	)
	original_name = models.CharField(
		max_length=255,
		verbose_name=_("Original name")
	)
	file = ThumbnailerField(
		verbose_name=_("File"),
		upload_to=upload_path_handler
	)
	filesize = models.BigIntegerField(
		verbose_name=_("File size"),
	)
	mimetype = models.CharField(
		verbose_name=_("File type"),
		max_length=200,
		blank=True
	)
	image_width = models.IntegerField(
		verbose_name=_("Image width"),
		blank=True,
		null=True
	)
	image_height = models.IntegerField(
		verbose_name=_("Image height"),
		blank=True,
		null=True
	)

	class Meta:
		verbose_name = _("Attachment")
		verbose_name_plural = _("Attachments")
		ordering = ('-library', 'rank')
		index_together = (('library', 'rank',),)

	def save(self, *args, **kwargs):
		if not self.original_name:
			self.original_name = self.file.name
		if self.original_name:
			self.original_name = self.original_name[:255]
			self.mimetype = (mimetypes.guess_type(self.original_name)[0] or '')[:200]
		if self.rank is None:
			next_rank = Attachment.objects.filter(library=self.library).aggregate(max_rank=Max('rank'))['max_rank']
			if next_rank is None:
				next_rank = 0
			else:
				next_rank += 1
			self.rank = next_rank
		if self.file:
			self.filesize = self.file.size
			source = BytesIO(self.file.read())
			try:
				image = Image.open(source)
				self.image_width, self.image_height = image.size
			except IOError:
				pass
			finally:
				self.file.seek(0)
		else:
			self.filesize = -1
			self.image_width = None
			self.image_height = None
		super(Attachment, self).save(*args, **kwargs)

	def delete(self):
		Attachment.objects.filter(library=self.library, rank__gt=self.rank).update(rank=F('rank')-1)
		super(Attachment, self).delete()
