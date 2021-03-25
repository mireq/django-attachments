# -*- coding: utf-8 -*-
from django import forms
from django.urls import reverse


class AdminLibraryWidget(forms.Widget):
	template_name = 'django_attachments/widgets/admin_attachments.html'

	class Media:
		css = {
			'all': ('django_attachments/css/attachments.css',)
		}
		js = (
			'django_attachments/vendor/dropzone/dropzone.min.js',
			'django_attachments/vendor/sortable/Sortable.min.js',
			'django_attachments/js/attachments.js',
			'django_attachments/js/admin_attachments.js',
		)

	def get_context(self, name, value, attrs):
		context = super().get_context(name, value, attrs)
		create_url = reverse('admin:attachments_library_create_api')
		library_url = reverse('admin:attachments_library_edit_api', args=('0000',))
		# hack
		library_url = library_url.replace('0000', '__library_id__')
		context['create_url'] = create_url
		context['library_url'] = library_url
		return context


class AdminGalleryWidget(AdminLibraryWidget):
	def get_context(self, name, value, attrs):
		context = super().get_context(name, value, attrs)
		library_url = reverse('admin:attachments_gallery_edit_api', args=('0000',))
		# hack
		library_url = library_url.replace('0000', '__library_id__')
		context['library_url'] = library_url
		return context
