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


if (_.forEach === undefined) {
	if (Array.prototype.forEach) {
		var coreForEach = Array.prototype.forEach;
		_.forEach = function(collection, fn) {
			coreForEach.call(collection, fn);
		};
	}
	else {
		_.forEach = function(collection, fn) {
			for (var i = 0, len = collection.length; i < len; i++) {
				fn(collection[i], i);
			}
		};
	}
}


if (_.xhrSend === undefined) {
	var createXMLHttpRequest = null;
	var ajaxForwardError = function(response) {
		document.open();
		document.write(response.responseText); // jshint ignore:line
		document.close();
		if (window.history !== undefined) {
			window.history.replaceState({}, null, window.location);
		}
	};
	if (window.XMLHttpRequest) {
		createXMLHttpRequest = function() { return new XMLHttpRequest(); };
	}
	else {
		createXMLHttpRequest = function() { return new ActiveXObject('Microsoft.XMLHTTP'); };
	}

	var xhrSend = function(options) {
		options.method = options.method || 'GET';
		var req = createXMLHttpRequest();
		var extraHeaders = options.extraHeaders || {};
		if (window._settings && window._settings.debug) {
			options.failFn = opts.failFn || ajaxForwardError;
		}
		req.open(options.method, options.url, true);
		req.setRequestHeader('X-CSRFToken', _.getCookie('csrftoken'));
		req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

		req.onreadystatechange = function () {
			if (req.readyState === 2) {
				if (options.headersFn !== undefined) {
					options.headersFn(req);
				}
			}
			if (req.readyState != 4) return;
			if (req.status >= 200 && req.status < 400) {
				if (options.successFn !== undefined) {
					var contentType = req.getResponseHeader('content-type');
					var data = req.responseText;
					if (contentType.indexOf('application/json') === 0) {
						data = JSON.parse(data);
					}
					options.successFn(data, req, options);
				}
			}
			else {
				if (options.failFn !== undefined) {
					options.failFn(req, options);
				}
			}
		};
		req.send();
	}
	_.xhrSend = xhrSend;
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

	var renderAttachments = function(data) {
		var toRemove = [];
		_.forEach(files.childNodes, function(node) {
			if (node.getAttribute('data-uploading') !== null) {
				toRemove.push(node);
			}
		});

		_.forEach(toRemove, function(node) {
			node.parentNode.removeChild(node);
		})

		var insertAttachment;
		var lastNode = files.childNodes[files.childNodes.length - 1];
		if (lastNode === undefined) {
			insertAttachment = function(element) {
				files.appendChild(element);
			}
		}
		else {
			insertAttachment = function(element) {
				lastNode.parentNode.insertBefore(element, lastNode);
			}
		}

		_.forEach(data, function(attachmentData) {
			var attachment = document.createElement('DIV');
			attachment.className = 'attachment attachment-finished';
			var frame = document.createElement('DIV');
			frame.className = 'attachment-frame';
			attachment.appendChild(frame);
			var thumbnail = document.createElement('DIV');
			thumbnail.className = 'thumbnail';
			frame.appendChild(thumbnail);
			if (attachmentData['200_150'] !== undefined) {
				var img = document.createElement('IMG');
				frame.appendChild(img);
				img.setAttribute('src', attachmentData['200_150']);
			}

			insertAttachment(attachment);
		});
	};

	var createDropzone = function() {
		return new Dropzone(widgetElement, {
			url: uploadUrl,
			paramName: 'file',
			clickable: true,
			autoProcessQueue: false,
			addRemoveLinks: true,
			previewTemplate: '\
<div class="attachment attachment-uploading" data-uploading>\
	<div class="attachment-frame">\
		<div class="progress"><span class="upload" data-dz-uploadprogress></span></div>\
		<div class="thumbnail">\
			<img data-dz-thumbnail />\
		</div>\
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
				renderAttachments(data);
			},
			queuecomplete: function() {
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

	_.xhrSend({
		url: listUrl,
		successFn: function(data) {
			renderAttachments(data);
			if (uploadUrl) {
				createDropzone();
			}
		}
	})

	return self;
};


uploadWidget(document.getElementsByClassName('attachments-upload-widget')[0]);


}());
