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


var uploadWidget = function(element, options) {
	var self = {};
	self.initialized = false;
	self.destroy = function() {};

	var uploadForm = _.cls('upload-form')[0];
	var updateForm = _.cls('update-form')[0];

	if (uploadForm === undefined || updateForm === undefined) {
		return self;
	}

	var dropzoneElement = document.createElement('DIV');
	dropzoneElement.className = element.className + ' attachments-widget';

	var uploadUrl = uploadForm.getAttribute('action');
	var updateUrl = updateForm.getAttribute('action');

	element.style.display = 'none';
	element.parentNode.insertBefore(dropzoneElement, element);

	var dropzone = new Dropzone(dropzoneElement, {
		url: uploadUrl
	});

	self.destroy = function() {
		dropzoneElement.parentNode.removeChild(dropzoneElement);
		element.style.display = 'block';
	}

	dropzoneElement.innerHTML = 'aaa';

	return self;
};


uploadWidget(document.getElementsByClassName('attachments-upload-widget')[0]);


}());
