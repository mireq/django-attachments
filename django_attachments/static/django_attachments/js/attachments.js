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


if (_.bindEvent === undefined) {
	_.bindEvent = function(element, name, fn) {
		if (document.addEventListener) {
			element.addEventListener(name, fn, false);
		}
		else {
			element.attachEvent('on' + name, fn);
		}
	};

	_.unbindEvent = function(element, name, fn) {
		if (document.removeEventListener) {
			element.removeEventListener(name, fn, false);
		}
		else {
			element.detachEvent('on' + name, fn);
		}
	};

	_.triggerEvent = function(element, name, memo) {
		var event;
		if (document.createEvent) {
			event = document.createEvent('HTMLEvents');
			event.initEvent(name, true, true);
		}
		else {
			event = document.createEventObject();
			event.eventType = name;
		}

		event.eventName = name;
		event.memo = memo || { };
		event.target = element;

		if (document.createEvent) {
			element.dispatchEvent(event);
		}
		else {
			element.fireEvent("on" + event.eventType, event);
		}
	};
}


var uploadWidget = function(element, options) {
	var self = {};
	self.initialized = false;
	self.destroy = function() {};
	options = options || {};

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

	var onClicked = function(e) {
		if (e.which !== 1) {
			return;
		}

		_.triggerEvent(widgetElement, 'click')
		element.click();
	}

	_.bindEvent(files, 'click', onClicked);

	self.destroy = function() {
		widgetElement.parentNode.removeChild(widgetElement);
		element.style.display = 'block';
		_.unbindEvent(files, 'click', onClicked);
	}

	options.makeAttachmentWidget = options.makeAttachmentWidget || function(attachmentData) {
		/*
		 * Returns dictionary:
		 *
		 * {
		 *   element: html_element,
		 *   updateProgress: function
		 * }
		 */
		var attachment = document.createElement('DIV');
		if (attachmentData.finished) {
			attachment.className = 'attachment attachment-finished';
		}
		else {
			attachment.className = 'attachment attachment-uploading';
			attachment.setAttribute('data-uploading', 'data-uploading');
		}
		var frame = document.createElement('DIV');
		frame.className = 'attachment-frame';
		attachment.appendChild(frame);
		var thumbnail = document.createElement('DIV');
		thumbnail.className = 'thumbnail';
		frame.appendChild(thumbnail);
		if (attachmentData['thumbnail'] !== undefined) {
			var img = document.createElement('IMG');
			thumbnail.appendChild(img);
			img.setAttribute('src', attachmentData['thumbnail']);
		}

		var caption = document.createElement('DIV');
		caption.className = 'caption';
		frame.appendChild(caption);

		var progress = document.createElement('DIV');
		progress.className = 'progress';
		caption.appendChild(progress);

		var captionSpan = document.createElement('SPAN');
		caption.appendChild(captionSpan);
		captionSpan.appendChild(document.createTextNode(attachmentData.name));

		return {
			element: attachment,
			updateProgress: function(value) {
				progress.style.width = value + '%';
			}
		}
	}

	var renderAttachments = function(data) {
		var toRemove = [];
		_.forEach(files.childNodes, function(node) {
			if (node.getAttribute('data-uploading') === null) {
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
			insertAttachment(options.makeAttachmentWidget({
				'thumbnail': attachmentData['thumbnail'],
				'name': attachmentData['name'],
				'finished': true
			}).element);
		});
	};

	var createDropzone = function() {
		var dropzone = new Dropzone(widgetElement, {
			url: uploadUrl,
			paramName: 'file',
			clickable: true,
			autoProcessQueue: false,
			addRemoveLinks: true,
			sending: function(file, xhr, formData) {
				formData.append('action', 'upload');
				formData.append('attachments', 'json');
				formData.append('csrfmiddlewaretoken', _.getCookie('csrftoken'));
			},
			uploadprogress: function(upload, progress) {
				upload.previewElement.updateProgress(progress);
			},
			success: function(upload, data) {
				renderAttachments(data);
				upload.previewElement.element.parentNode.removeChild(upload.previewElement.element);
				upload.previewElement = undefined;
			},
			queuecomplete: function() {
			},
			processing: function() {
				dropzone.options.autoProcessQueue = true;
			},
			addedfile: function(upload) {
				upload.previewElement = options.makeAttachmentWidget({
					'thumbnail': upload.dataURL,
					'name': upload.name,
					'finished': false
				});
				files.appendChild(upload.previewElement.element);

				if (dropzone.options.autoProcessQueue) {
					return;
				}
				setTimeout(function() { dropzone.processQueue(); }, 0);
			},
			thumbnail: function(upload, dataURL) {
				var oldPreview = upload.previewElement.element;
				upload.previewElement = options.makeAttachmentWidget({
					'thumbnail': upload.dataURL,
					'name': upload.name,
					'finished': false
				});
				oldPreview.parentNode.insertBefore(upload.previewElement.element, oldPreview);
				oldPreview.parentNode.removeChild(oldPreview);
			}
		});
		return dropzone;
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
