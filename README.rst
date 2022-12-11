==================
Django attachments
==================

|version| |downloads| |license|

Django application to manage attached files to any django model.

Install
-------

.. code:: bash

	pip install django_attachments_management

Configure
---------

Add `'django_attachments'` to `INSTALLED_APPS`.

Usage
-----

Add `GalleryField` or `LibraryField` to django model.

.. code:: python

	from django.db import models
	from django_attachments.fields import LibraryField, GalleryField


	class Article(models.Model):
		title = models.CharField(max_length=100)
		attachments = LibraryField(related_name='articles_with_attachment', on_delete=models.CASCADE)
		gallery = GalleryField(related_name='articles_with_gallery', on_delete=models.CASCADE)


Use `AttachmentsAdminMixin` to enable attachments in admin interface.

.. code:: python

	from django.contrib import admin

	from .models import Article
	from django_attachments.admin import AttachmentsAdminMixin


	class ArticleAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
		pass


	admin.site.register(Article, ArticleAdmin)

Screenshots
-----------

.. image:: https://raw.github.com/wiki/mireq/django-attachments/django_attachments.png?v2022-12-11

.. |version| image:: https://badge.fury.io/py/django-attachments-management.svg
	:target: https://pypi.python.org/pypi/django-attachments-management/

.. |downloads| image:: https://img.shields.io/pypi/dw/django-attachments-management.svg
	:target: https://pypi.python.org/pypi/django-attachments-management/

.. |license| image:: https://img.shields.io/pypi/l/django-attachments-management.svg
	:target: https://pypi.python.org/pypi/django-attachments-management/
