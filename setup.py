# -*- coding: utf-8 -*-
import glob
import pathlib
import subprocess
import sys

from setuptools import setup


def create_mo_files():
	prefix = pathlib.Path('wtextra') / 'delivery_zasielkovna'

	for po_file in glob.glob(str(pathlib.Path(prefix) / 'locale' / '*' / 'LC_MESSAGES' / 'django.po')):
		sys.stdout.write(f"Compiling {po_file}")
		compiled = subprocess.check_output(['msgfmt', '--check-format', po_file, '-o', '-'])
		sys.stdout.write(" .. OK\n")
		with open(po_file[:-3] + '.mo', 'wb') as fp:
			fp.write(compiled)


setup(
	data_files=create_mo_files(),
	use_scm_version=True,
)
