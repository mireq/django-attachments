(function() {


/* === Utils === */


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

	_.forEachDict = function(collection, fn) {
		for (var key in collection) {
			if (Object.prototype.hasOwnProperty.call(collection, key)) {
				var value = collection[key];
				fn(key, value);
			}
		}
	};
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

	var dictToPairs = function(collection) {
		var pairs = [];
		_.forEachDict(collection, function(key, value) {
			pairs.push([key, value]);
		});
		return pairs;
	};

	var encodeURLParameters = function(parameters) {
		var urlParameterList = parameters;
		if (!Array.isArray(parameters)) {
			urlParameterList = dictToPairs(urlParameterList);
		}

		var urlComponents = [];
		_.forEach(urlParameterList, function(parameter) {
			urlComponents.push(encodeURIComponent(parameter[0]) + '=' + encodeURIComponent(parameter[1]));
		});
		return urlComponents.join('&');
	};

	var xhrSend = function(options) {
		options.method = options.method || 'GET';
		var req = createXMLHttpRequest();
		var extraHeaders = options.extraHeaders || {};
		if (window._settings && window._settings.debug) {
			options.failFn = options.failFn || ajaxForwardError;
		}
		req.open(options.method, options.url, true);
		req.setRequestHeader('X-CSRFToken', _.getCookie('csrftoken'));
		req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		if (options.method === 'POST') {
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}

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
		var data = options.data || '';
		if (typeof data != 'string') {
			data = encodeURLParameters(data);
		}
		req.send(data);
	};
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



/* === Widget === */


var attachmentsContainer = function(container, widget) {
	var self = {};
	var widgets = {};

	self.add = function(item) {
		var widgetInstance = widgets[item.id + ''];
		if (widgetInstance === undefined) {
			widgetInstance = widget(item);
			widgetInstance.insert(container);
			widgets[item.id] = widgetInstance;
		}
		else {
			widgetInstance.update(item);
		}
		return widgetInstance;
	};

	self.remove = function(id) {
		var widgetInstance;
		if (item.getId === undefined) {
			widgetInstance = widgets[id + ''];
		}
		else {
			widgetInstance = widgets[id.getId()];
		}
		if (widgetInstance !== undefined) {
			widgetInstance.remove();
		}
		return widgetInstance;
	};

	self.toList = function() {
		var list = [];
		_.forEach(container.childNodes, function(node) {
			var id = node.getAttribute('data-id');
			if (id === null) {
				return;
			}
			var widget = widgets[id];
			if (widget === undefined) {
				return;
			}

			list.push(widget.getState());
		});
		return list;
	};

	self.changeId = function(oldId, newId) {
		var widgetInstance = widgets[oldId + ''];
		if (widgetInstance === undefined) {
			return;
		}
		delete widgets[oldId + ''];
		widgets[newId + ''] = widgetInstance;
		widgetInstance.update({id: newId});
	};

	self.load = function(items) {
		_.forEach(items, function(item) {
			self.add(item);
		});
	};

	return self;
};


var fileWidget = function(data) {
	var self = {};
	var state = {};
	var elements = {};

	self.element = document.createElement('div');
	elements.thumbnail = document.createElement('div');
	elements.img = document.createElement('img');
	elements.caption = document.createElement('div');
	elements.captionSpan = document.createElement('span');
	elements.progress = document.createElement('div');
	elements.delete = document.createElement('a');

	elements.thumbnail.className = 'thumbnail';
	elements.caption.className = 'caption';
	elements.progress.className = 'progress';
	elements.delete.className = 'delete delete-link';
	elements.delete.setAttribute('href', '#');
	elements.delete.setAttribute('data-delete', '');

	elements.thumbnail.appendChild(elements.img);
	elements.caption.appendChild(elements.captionSpan);
	elements.caption.appendChild(elements.progress);

	self.element.appendChild(elements.thumbnail);
	self.element.appendChild(elements.caption);

	self.update = function(data) {
		_.forEachDict(data, function(key, value) {
			state[key] = value;
		});
		state.id = state.id + ''; // convert to string
		renderState();
	};

	self.remove = function() {
		self.element.parentNode.removeChild(element);
	};

	self.insert = function(parent, before) {
		if (before === undefined) {
			parent.appendChild(self.element);
		}
		else {
			parent.insertBefore(self.element, before);
		}
	};

	var renderState = function() {
		self.element.className = 'attachment attachment-' + (state.finished ? 'finished' : 'uploading');
		self.element.setAttribute('data-id', state.id);
		elements.img.src = state.thumbnail;
		elements.captionSpan.innerHTML = '';
		elements.captionSpan.appendChild(document.createTextNode(state.name));
		if (state.deletable) {
			if (!elements.delete.parentNode) {
				self.element.appendChild(elements.delete);
			}
		}
		else {
			if (elements.delete.parentNode) {
				self.element.removeChild(elements.delete);
			}
		}
		if (state.progress === undefined || state.finished) {
			elements.progress.style.display = 'none';
		}
		else {
			elements.progress.style.display = 'block';
			elements.progress.style.width = state.progress + '%';
		}
	};

	self.getId = function() {
		return state.id;
	};

	self.getState = function() {
		var stateCopy = {};
		_.forEachDict(state, function(key, value) {
			stateCopy[key] = value;
		});
		return stateCopy;
	};

	self.update(data);
	renderState();

	return self;
};


var uploadWidget = function(element, options) {
	var self = {};
	self.initialized = false;
	self.destroy = function() {};
	options = options || {};
	if (options.autoProcess === undefined) {
		options.autoProcess = true;
	}

	self.listUrl = element.getAttribute('data-list-url');
	self.uploadUrl = element.getAttribute('data-upload-url');
	self.updateUrl = element.getAttribute('data-update-url');

	if (self.listUrl === null) {
		return self;
	}

	var widgetElement = document.createElement('DIV');
	widgetElement.className = element.className + ' attachments-widget';

	element.style.display = 'none';
	element.parentNode.insertBefore(widgetElement, element);

	var filesElement = document.createElement('DIV');
	filesElement.className = 'files';
	widgetElement.appendChild(filesElement);

	var dropzone;
	var dropzoneUploadId = 0;
	var sortable;
	var attachments = attachmentsContainer(filesElement, fileWidget);

	var onClicked = function(e) {
		if (e.which !== 1) {
			return;
		}

		var target = e.target;
		var id = target.getAttribute('data-delete-id');
		if (id !== null) {
			console.log(id);
			//_.xhrSend({
			//	method: 'POST',
			//	data: {'action': 'delete', 'delete': id, 'attachments': 'json'},
			//	url: self.updateUrl,
			//	successFn: function(data) {
			//		renderAttachments(data);
			//	}
			//})
			e.preventDefault();
			return;
		}

		_.triggerEvent(widgetElement, 'click');
		element.click();
	};

	_.bindEvent(filesElement, 'click', onClicked);

	self.destroy = function() {
		if (sortable !== undefined) {
			sortable.destroy();
			sortable = undefined;
		}
		dropzone = undefined;
		widgetElement.parentNode.removeChild(widgetElement);
		element.style.display = 'block';
		_.unbindEvent(filesElement, 'click', onClicked);
	};

	var createDropzone = function() {
		var dropzone = new Dropzone(widgetElement, {
			url: self.uploadUrl,
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
				upload.previewWidget.update({ progress: progress });
			},
			success: function(upload, data) {
				_.forEach(data.attachments, function(attachment) {
					attachment.finished = true;
					if (attachment.is_new) {
						attachments.changeId(upload.previewWidget.getId(), attachment.id);
					}
				});
				attachments.load(data.attachments);
				upload.previewWidget = undefined;
			},
			queuecomplete: function() {
				if (self.updateUrl !== null) {
					sortUploads();
				}
			},
			complete: function(upload) {
			},
			processing: function() {
				if (options.autoProcess) {
					dropzone.options.autoProcessQueue = true;
				}
			},
			addedfile: function(upload) {
				upload.listData = {
					'thumbnail': upload.dataURL,
					'name': upload.name,
					'finished': false,
					'id': ':' + dropzoneUploadId
				};
				dropzoneUploadId++;

				upload.previewWidget = attachments.add(upload.listData);

				if (dropzone.options.autoProcessQueue) {
					return;
				}
				if (options.autoProcess) {
					setTimeout(function() { dropzone.processQueue(); }, 0);
				}
			},
			thumbnail: function(upload, dataURL) {
				upload.previewWidget.update({thumbnail: upload.dataURL});
			}
		});
		return dropzone;
	};

	var createSortable = function() {
		var sortable = Sortable.create(filesElement, {
			animation: 200,
			draggable: '.attachment',
			group: {
				put: false,
				pull: false
			},
			onSort: function() {
				sortUploads();
			},
			onStart: function() {
			},
			onEnd: function(evt) {
			}
		});
		return sortable;
	};

	var sortUploads = function() {
		console.log("sorting");
	};

	_.xhrSend({
		url: self.listUrl,
		successFn: function(data) {
			attachments.load(data.attachments);
			if (self.updateUrl) {
				sortable = createSortable();
			}
			if (self.uploadUrl) {
				dropzone = createDropzone();
			}
		}
	});

	return self;
};



uploadWidget(document.getElementsByClassName('attachments-upload-widget')[0], {autoProcess: true});


}());
