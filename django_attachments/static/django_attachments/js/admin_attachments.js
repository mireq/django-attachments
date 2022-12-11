(function() {

function updateUrls(input, widget) {
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
}


document.addEventListener("DOMContentLoaded", function(event) {
	var inputs = Array.prototype.slice.call(document.getElementsByClassName('django-attachments-widget'));
	var widgets = [];
	inputs.forEach(function(input) {
		var w = uploadWidget(input, {autoProcess: false});
		widgets.push(w);
		var creatingGallery = false;
		updateUrls(input, w);
		w.loadAttachments();
	});

	var mainContent = document.getElementById('content-main');
	var form = mainContent.getElementsByTagName('form')[0];

	var interceptSubmit = true;
	function onSubmit(e) {
		if (!interceptSubmit) {
			return;
		}
		var btn = e.submitter;
		if (btn !== null) {
			btn.disabled = true;
		}
		setTimeout(function() { btn.disabled = false; }, 5000);

		var notSaved = inputs.length;
		widgets.forEach(function(w, i) {
			var input = inputs[i];

			function saveAttachments() {
				w.save(function() {
					notSaved--;
					if (notSaved === 0) {
						if (btn !== null) {
							btn.disabled = false;
						}

						interceptSubmit = false;
						event = new SubmitEvent("submit", {
							submitter: btn
						});
						form.dispatchEvent(event);
						setTimeout(function() { interceptSubmit = true; }, 0);
					}
				});
			}

			if (input.value && input.value !== 'None') {
				saveAttachments();
			}
			else {
				w.createLibrary(function(value) {
					if (value !== null) {
						input.value = value;
						updateUrls(input, w);
						saveAttachments();
						w.autoProcess = true;
						w.save();
					}
				});
			}
		});

		e.preventDefault();
	}

	form.addEventListener('submit', onSubmit, true);
});

}());
