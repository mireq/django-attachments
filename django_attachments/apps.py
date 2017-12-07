# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django import apps
from django.utils.translation import ugettext_lazy as _


class AppConfig(apps.AppConfig):
	name = 'django_attachments'
	verbose_name = _("Attachemnts")

	def ready(self):
		from .cleanup import register_cleaner_for_model
		register_cleaner_for_model(self.get_model('Attachment'))
