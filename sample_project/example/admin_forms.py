# -*- coding: utf-8 -*-
from django import forms
from django_attachments.models import Library

from .models import Article


class ArticleForm(forms.ModelForm):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.fields['attachments'].required = False
		self.fields['gallery'].required = False

	def save(self, commit=True):
		obj = super().save(commit=False)
		if not hasattr(obj, 'attachments'):
			lib = Library()
			lib.save()
			obj.attachments = lib
		if not hasattr(obj, 'gallery'):
			lib = Library()
			lib.save()
			obj.gallery = lib
		if commit:
			obj.save()
		return obj

	class Meta:
		model = Article
		fields = '__all__'
