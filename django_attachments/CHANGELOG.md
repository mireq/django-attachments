## 1.2.4 (2025-01-05)

### Fix

- Replaced old get_storage_class with get_storage utility from easy_thumbnails

## 1.2.3 (2025-01-05)

### Fix

- Compatibility with django 5.1

## 1.2.2 (2024-08-17)

### Fix

- Don't throw error if attachment without associated file is saved

## 1.2.1 (2024-06-08)

### Feat

- Add missing submitter input to form
- Added DEFAULT_AUTO_FIELD setting to sample project

### Fix

- Stretch drop widget to full width

## 1.2.0 (2024-05-15)

### Feat

- Add LibraryQuerySet.update_primary_image() method

## 1.1.2 (2023-05-11)

### Refactor

- Replaced index_together with indexes

## 1.1.1 (2023-05-10)

### Fix

- Access attachment_set relation only on saved objects

## 1.1.0 (2023-02-04)

### Feat

- Export URL to file list

### Fix

- Fixed admin freeze if library don't exist
- Suppress setuptools warning

## 1.0.0 (2022-12-11)

## 0.0.1 (2022-12-11)

### Feat

- Implemented missing action get_library
- Added werkkzeug support to sample project
- Forwarded sign argument to list / update actions
- Allow forward signed parameter

### Fix

- Save admin attachments only after submit
- Fixed exception after save
- Update sample project
- Set default auto field to prevent migration generateion
- Suppressed warning
- Fixed for requests without HTTP_ACCEPT header

### Refactor

- Updated build system
