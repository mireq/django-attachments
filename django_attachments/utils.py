# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import mimetypes
import os
from io import BytesIO

from PIL import Image
from django.contrib.staticfiles import finders
from django.core.files.uploadedfile import SimpleUploadedFile
from django.templatetags.static import static


def resized_picture_field(self, image_field, max_image_size=None, force_image_type=None, strip_metadata=False, image_quality=70):
	if max_image_size is None and force_image_type is None:
		return image_field
	image_file = BytesIO(image_field.read())
	image = Image.open(image_file).convert('RGB')

	if strip_metadata:
		image_without_exif = Image.new(image.mode, image.size)
		image_without_exif.putdata(image.getdata())
		image_without_exif.format = image.format
		image = image_without_exif

	if max_image_size is not None:
		if image.size[0] > max_image_size[0] or image.size[1] > max_image_size[1]:
			image.thumbnail(max_image_size, Image.ANTIALIAS)

	image_file = BytesIO()
	image.save(image_file, format=force_image_type or image.format, quality=image_quality)
	image_field.file = SimpleUploadedFile(image_field.name, image_file.getvalue())

	return image_field


def parse_mimetype(filename):
	mimetype = (mimetypes.guess_type(filename)[0] or '')[:200]
	mime_url_part = '/'.join([d for d in mimetype.split('/') if d != '..' and d != ''])
	safe_mimetype = os.path.join(*[d for d in mimetype.split('/') if d != '..' and d != ''])
	mime_url = 'django_attachments/img/mimetypes/%s.png' % mime_url_part
	result = finders.find(os.path.join('django_attachments', 'img', 'mimetypes', safe_mimetype) + '.png')
	if result is None:
		mime_url = 'django_attachments/img/mimetypes/application/octet-stream.png'
	return {
		'mimetype': mimetype,
		'mimetype_url': static(mime_url)
	}
