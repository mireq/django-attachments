(function() {

window._utils = window._utils || {};
var _ = window._utils;
var el = document.createElement('DIV');


if (_.cls === undefined) {
	var getElementsByClassName;
	if (el.getElementsByClassName === undefined) {
		getElementsByClassName = function(parent, cls) {
			if (cls === undefined) {
				cls = parent;
				parent = document.body;
			}
			var elements = parent.getElementsByTagName('*');
			var match = [];
			for (var i = 0, leni = elements.length; i < leni; i++) {
				if (hasClass(elements[i], cls)) {
					match.push(elements[i]);
				}
			}
			return match;
		};
	}
	else {
		getElementsByClassName = function(parent, cls) {
			if (cls === undefined) {
				cls = parent;
				parent = document.body;
			}
			return parent.getElementsByClassName(cls);
		};
	}
	_.cls = getElementsByClassName;
}


if (_.getCookie === undefined) {
	_.getCookie = function(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = cookies[i].trim();
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	};
}


var uploadWidget = function(element, options) {
	var self = {};
	self.initialized = false;
	self.destroy = function() {};

	var listUrl = element.getAttribute('data-list-url');
	var uploadUrl = element.getAttribute('data-upload-url');
	var updateUrl = element.getAttribute('data-update-url');


	if (listUrl === null) {
		return self;
	}

	var widgetElement = document.createElement('DIV');
	widgetElement.className = element.className + ' attachments-widget';

	element.style.display = 'none';
	element.parentNode.insertBefore(widgetElement, element);

	var files = document.createElement('DIV');
	files.className = 'files';
	widgetElement.appendChild(files);

	self.destroy = function() {
		widgetElement.parentNode.removeChild(widgetElement);
		element.style.display = 'block';
	}

	if (uploadUrl) {
		var dropzone = new Dropzone(widgetElement, {
			url: uploadUrl,
			paramName: 'file',
			clickable: true,
			autoProcessQueue: false,
			addRemoveLinks: true,
			previewTemplate: '\
<div class="attachment attachment-uploading">\
	<div class="attachment-frame">\
		<div class="progress"><span class="upload" data-dz-uploadprogress></span></div>\
		<img data-dz-thumbnail />\
	</div>\
</div>',
			sending: function(file, xhr, formData) {
				formData.append('action', 'upload');
				formData.append('attachments', 'json');
				formData.append('csrfmiddlewaretoken', _.getCookie('csrftoken'));
			},
			uploadprogress: function(upload, progress) {
				console.log(upload.previewElement);
			},
			success: function(upload, data) {
				console.log(data);
			},
			queuecomplete: function() {
				console.log("ok");
			},
			processing: function() {
				dropzone.options.autoProcessQueue = true;
			},
			addedfile: function(upload) {
				upload.previewElement = Dropzone.createElement(this.options.previewTemplate);
				files.appendChild(upload.previewElement);
				if (dropzone.options.autoProcessQueue) {
					return;
				}
				setTimeout(function() { dropzone.processQueue(); }, 0);
			}
		});
	}

	return self;
};


uploadWidget(document.getElementsByClassName('attachments-upload-widget')[0]);


}());
