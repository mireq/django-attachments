# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-12-01 13:16
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

	initial = True

	dependencies = [
		('django_attachments', '0001_initial'),
	]

	operations = [
		migrations.CreateModel(
			name='Article',
			fields=[
				('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
				('title', models.CharField(max_length=100)),
				('attachments', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='articles_with_attachment', to='django_attachments.Library')),
				('gallery', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='articles_with_gallery', to='django_attachments.Library')),
			],
			options={
				'verbose_name': 'Article',
				'verbose_name_plural': 'Articles',
			},
		),
	]