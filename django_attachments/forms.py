# -*- coding: utf-8 -*-
from django import forms
from django.forms.models import modelformset_factory
from django.utils.translation import gettext_lazy as _

from .models import Attachment


class AttachmentUploadForm(forms.ModelForm):
	def __init__(self, *args, **kwargs):
		self.library = kwargs.pop('library')
		super().__init__(*args, **kwargs)

	class Meta:
		model = Attachment
		fields = ('file',)

	def save(self, commit=True):
		obj = super().save(commit=False)
		obj.library = self.library
		if commit:
			obj.save()
		return obj


class ImageUploadForm(AttachmentUploadForm):
	file = forms.ImageField(
		label=_("Image")
	)

	class Meta(AttachmentUploadForm.Meta):
		pass


class AttachmentUpdateForm(forms.ModelForm):
	class Meta:
		model = Attachment
		fields = ()

	def save(self, commit=True):
		obj = super().save(commit=False)
		old_rank = obj.rank
		obj.rank = self.cleaned_data['ORDER'] - 1
		if commit:
			if old_rank != obj.rank:
				Attachment.objects.filter(pk=obj.pk).update(rank=obj.rank)
		return obj


AttachmentUpdateFormSet = modelformset_factory(
	Attachment,
	AttachmentUpdateForm,
	can_order=True,
	can_delete=True,
	extra=0
)
