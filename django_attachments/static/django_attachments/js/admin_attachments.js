(function() {

var updateUrls = function(input, widget) {
	var value = input.value;
	if (value && value !== 'None') {
		var listUrl = input.getAttribute('data-list-url');
		var uploadUrl = input.getAttribute('data-upload-url');
		var updateUrl = input.getAttribute('data-update-url');
		if (listUrl !== null) {
			listUrl = listUrl.replace('__library_id__', value);
		}
		if (uploadUrl !== null) {
			uploadUrl = uploadUrl.replace('__library_id__', value);
		}
		if (updateUrl !== null) {
			updateUrl = updateUrl.replace('__library_id__', value);
		}
		widget.listUrl = listUrl;
		widget.uploadUrl = uploadUrl;
		widget.updateUrl = updateUrl;
	}
	else {
		widget.listUrl = input.getAttribute('data-list-url');
		widget.uploadUrl = input.getAttribute('data-upload-url');
		widget.updateUrl = input.getAttribute('data-update-url');
	}
	widget.createLibraryUrl = input.getAttribute('data-create-library-url');
};

document.addEventListener("DOMContentLoaded", function(event) {
	var inputs = [];
	Array.prototype.forEach.call(document.getElementsByClassName('django-attachments-widget'), function(input) {
		inputs.push(input);
	});
	inputs.forEach(function(input) {
		var w = uploadWidget(input, {autoProcess: false});
		var creatingGallery = false;
		updateUrls(input, w);
		w.loadAttachments();
		w.onChanged(function() {
			if (creatingGallery) {
				return;
			}
			creatingGallery = true;
			if (input.value && input.value !== 'None') {
				w.save();
			}
			else {
				w.createLibrary(function(value) {
					if (value !== null) {
						input.value = value;
						updateUrls(input, w);
						w.autoProcess = true;
						w.save();
					}
				});
			}
		});
	});
});

}());
