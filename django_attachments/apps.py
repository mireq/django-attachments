# -*- coding: utf-8 -*-
from django import apps
from django.utils.translation import gettext_lazy as _


class AppConfig(apps.AppConfig):
	name = 'django_attachments'
	verbose_name = _("Attachemnts")
	default_auto_field = 'django.db.models.AutoField'

	def ready(self):
		from .cleanup import register_cleaner_for_model
		register_cleaner_for_model(self.get_model('Attachment'))
