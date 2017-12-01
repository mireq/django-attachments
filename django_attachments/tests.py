# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from io import BytesIO

from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from .models import Library, Attachment


class AttachmentModelTest(TestCase):
	def setUp(self):
		pass

	def create_library(self, title='Test'):
		library = Library(title=title)
		library.save()
		return library

	def create_attachment(self, filename, data, library=None):
		if library == None:
			library = self.create_library()
		uploaded_file = SimpleUploadedFile(filename, data)
		attachment = Attachment(file=uploaded_file, library=library)
		attachment.save()
		return attachment

	def test_library(self):
		title = 'Test'
		library = self.create_library()
		self.assertEqual(library.title, title)
		self.assertIsNone(library.primary_attachment)
		library.delete()

	def test_upload_file(self):
		data = b'data'
		attachment = self.create_attachment('upload.txt', data)
		self.assertEquals(attachment.original_name, 'upload.txt')
		self.assertEquals(attachment.rank, 0)
		self.assertEquals(attachment.filesize, len(data))
		self.assertIsNone(attachment.image_width)
		attachment.delete()

	def test_upload_image(self):
		image_size = (5, 10)
		im = Image.new('RGB', image_size)
		data = BytesIO()
		im.save(data, 'JPEG')
		attachment = self.create_attachment('image.jpg', data.getvalue())
		self.assertEquals(attachment.image_width, image_size[0])
		self.assertEquals(attachment.image_height, image_size[1])

	def test_rank_create_delete(self):
		library = self.create_library()
		attachments = [
			self.create_attachment('upload.txt', b'', library),
			self.create_attachment('upload.txt', b'', library),
		]
		self.assertEquals(attachments[0].rank, 0)
		self.assertEquals(attachments[1].rank, 1)

		# ranks from other library
		library2 = self.create_library()
		attachments2 = [
			self.create_attachment('upload.txt', b'', library2),
			self.create_attachment('upload.txt', b'', library2),
		]
		self.assertEquals(attachments2[0].rank, 0)
		self.assertEquals(attachments2[1].rank, 1)

		# change rank when delete
		attachments[0].delete()
		attachments[1].refresh_from_db()
		self.assertEquals(attachments[1].rank, 0)
		attachments.pop(0)
		# preserve rank when delete last
		attachments2[1].delete()
		attachments2[0].refresh_from_db()
		self.assertEquals(attachments2[0].rank, 0)
		attachments2.pop(1)
