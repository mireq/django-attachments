# -*- coding: utf-8 -*-
import logging

from django.core.files.storage import get_storage_class
from django.db import models
from django.db.models.signals import post_delete, pre_save
from easy_thumbnails.conf import settings
from easy_thumbnails.files import get_thumbnailer


logger = logging.getLogger('django.db.models')


def delete_files(sender, instance, *args, **kwargs): #pylint: disable=unused-argument
	for field in instance._meta.fields:
		if not isinstance(field, models.FileField):
			continue
		file_to_delete = getattr(instance, field.name)
		delete_file(file_to_delete)


def delete_old_files(sender, instance, *args, **kwargs): #pylint: disable=unused-argument
	if not instance.pk:
		return

	try:
		old_instance = instance.__class__.objects.get(pk=instance.pk)
	except instance.__class__.DoesNotExist:
		return

	for field in instance._meta.fields:
		if not isinstance(field, models.FileField):
			continue
		old_file = getattr(old_instance, field.name)
		new_file = getattr(instance, field.name)
		if new_file != old_file:
			delete_file(old_file)


def delete_file(file_instance):
	if not file_instance.name:
		return
	thumbnailer = get_thumbnailer(file_instance)
	thumbnailer.thumbnail_storage = get_storage_class(settings.THUMBNAIL_DEFAULT_STORAGE)()
	thumbnailer.delete_thumbnails()
	storage = file_instance.storage
	if storage and storage.exists(file_instance.name):
		try:
			storage.delete(file_instance.name)
		except IOError:
			logger.error('File not deleted: %s', file_instance.name)


def register_cleaner_for_model(model_cls):
	post_delete.connect(delete_files, sender=model_cls)
	pre_save.connect(delete_old_files, sender=model_cls)
