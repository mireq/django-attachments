# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django import forms


class AdminAttachmentsWidget(forms.Widget):
	template_name = 'django_attachments/widgets/admin_attachments.html'

	def get_context(self, name, value, attrs):
		context = super(AdminAttachmentsWidget, self).get_context(name, value, attrs)
		return context
