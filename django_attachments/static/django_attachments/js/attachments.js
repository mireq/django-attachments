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

	if (el.classList === undefined) {
		_.hasClass = function(elem, cls) {
			return elem.className.split(" ").indexOf(cls) !== -1;
		};

		_.addClass = function(elem, cls) {
			elem.className += " " + cls;
		};

		_.removeClass = function(elem, cls) {
			var classNames = elem.className.split(" ");
			var newClassNames = [];
			for (var i = 0, leni = classNames.length; i < leni; i++) {
				if (classNames[i] != cls) {
					newClassNames.push(classNames[i]);
				}
			}
			elem.className = newClassNames.join(" ");
		};

		_.toggleClass = function(elem, cls) {
			if (hasClass(elem, cls)) {
				removeClass(elem, cls);
			}
			else {
				addClass(elem, cls);
			}
		};
	}
	else {
		_.hasClass = function(elem, cls) {
			return elem.classList.contains(cls);
		};

		_.addClass = function(elem, cls) {
			return elem.classList.add(cls);
		};

		_.removeClass = function(elem, cls) {
			return elem.classList.remove(cls);
		};

		_.toggleClass = function(elem, cls) {
			return elem.classList.toggle(cls);
		};
	}
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

var ajaxForwardError = function(response) {
	document.open();
	document.write(response.responseText); // jshint ignore:line
	document.close();
	if (window.history !== undefined) {
		window.history.replaceState({}, null, window.location);
	}
};


if (_.xhrSend === undefined) {
	var createXMLHttpRequest = null;
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

		for (var header in extraHeaders) {
			req.setRequestHeader(header, extraHeaders[header]);
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

	var onChanged = function() {
		var empty = true;
		var list = self.toList();
		_.forEach(list, function(item) {
			if (!item.deleted) {
				empty = false;
			}
		});

		if (empty) {
			_.addClass(container.parentNode, 'empty');
		}
		else {
			_.removeClass(container.parentNode, 'empty');
		}
	};

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
		onChanged();
		return widgetInstance;
	};

	self.remove = function(id) {
		var widgetInstance;
		if (id.getId === undefined) {
			widgetInstance = widgets[id + ''];
		}
		else {
			widgetInstance = widgets[id.getId()];
		}
		if (widgetInstance !== undefined) {
			widgetInstance.remove();
		}
		onChanged();
		return widgetInstance;
	};

	self.get = function(id) {
		var widgetInstance = widgets[id + ''];
		if (widgetInstance === undefined) {
			return null;
		}
		else {
			return widgetInstance;
		}
	};

	self.update = function(id, data) {
		var widgetInstance = widgets[id + ''];
		if (widgetInstance === undefined) {
			return null;
		}
		widgetInstance.update(data);
		onChanged();
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
		onChanged();
	};

	self.load = function(items, deleteNotExisting) {
		var old = [];
		_.forEachDict(widgets, function(id, widget) {
			old.push(id);
		});
		_.forEach(items, function(item) {
			self.add(item);
			var idx = old.indexOf(item.id + '');
			if (idx !== -1) {
				old.splice(idx, 1);
			}
		});
		if (deleteNotExisting) {
			_.forEach(old, function(id) {
				self.remove(id);
			});
		}
		onChanged();
	};

	onChanged();

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
		self.element.parentNode.removeChild(self.element);
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
		self.element.className = 'attachment attachment-' + (state.finished ? 'finished' : 'uploading') + (state.deleted ? ' deleted' : '');
		self.element.setAttribute('data-id', state.id);
		elements.captionSpan.innerHTML = '';
		elements.captionSpan.appendChild(document.createTextNode(state.name));
		if (state.thumbnail === undefined) {
			if (state.mimetype_url === undefined) {
				elements.img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
			}
			else {
				elements.img.src = state.mimetype_url;
			}
		}
		else {
			elements.img.src = state.thumbnail;
		}
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

	self.getFile = function() {
		return state.file;
	};

	self.getState = function() {
		var stateCopy = {};
		_.forEachDict(state, function(key, value) {
			stateCopy[key] = value;
		});
		return stateCopy;
	};

	self.getExtraFormData = function() {
		return {};
	};

	self.update(data);
	renderState();

	return self;
};


var messagesContainer = function(element, tagName) {
	var self = {};

	tagName = tagName || 'LI';

	self.show = function(message, className, timeout) {
		element.style.display = 'block';
		var messageElement = document.createElement(tagName);
		messageElement.className = className;
		messageElement.appendChild(document.createTextNode(message));
		element.appendChild(messageElement);
		setTimeout(function() {
			element.removeChild(messageElement);
			if (element.childNodes.length === 0) {
				element.style.display = 'none';
			}
		}, timeout || 10000);
	};

	return self;
};


var uploadWidget = function(element, options) {
	options = options || {};

	var self = {};
	self.initialized = false;
	self.autoProcess = options.autoProcess === undefined ? true : options.autoProcess;
	self.fileWidget = options.fileWidget || fileWidget;
	self.destroy = function() {};

	self.listUrl = element.getAttribute('data-list-url');
	self.uploadUrl = element.getAttribute('data-upload-url');
	self.updateUrl = element.getAttribute('data-update-url');
	self.createLibraryUrl = element.getAttribute('data-create-library-url');
	self.librarySign = undefined;
	self.librarySignName = undefined;

	if (self.listUrl === null) {
		return self;
	}

	var widgetElement = document.createElement('DIV');
	widgetElement.className = element.className + ' attachments-widget';

	element.style.display = 'none';
	element.parentNode.insertBefore(widgetElement, element);

	var messagesElement = document.createElement('UL');
	messagesElement.className = 'messages';
	messagesElement.style.display = 'none';
	widgetElement.appendChild(messagesElement);

	var filesElement = document.createElement('DIV');
	filesElement.className = 'files';
	widgetElement.appendChild(filesElement);

	var listeners = {
		saved: [],
		changed: []
	};
	var dropzone;
	var dropzoneUploadId = 0;
	var sortable;
	var attachments = attachmentsContainer(filesElement, self.fileWidget);
	var messages = messagesContainer(messagesElement);
	var queueSuccessCallback;

	var fireListeners = function(event) {
		_.forEach(listeners[event], function(listener) {
			listener.apply(arguments);
		});
	};

	var isPlaceholderUrl = function(url) {
		return url.indexOf('__library_id__') !== -1;
	};

	var findId = function(element) {
		var id;
		while (element && element.getAttribute !== undefined) {
			id = element.getAttribute('data-id');
			if (id !== null) {
				return id;
			}
			element = element.parentNode;
		}
		return null;
	};

	var onClicked = function(e) {
		var target = e.target;
		var id = findId(target);
		var widget = null;

		if (options.onClick !== undefined) {
			if (id !== null) {
				widget = attachments.get(id);
			}
			if (options.onClick(e, widget) === false) {
				return;
			}
		}

		if (e.which !== 1) {
			return;
		}

		if (target.getAttribute('data-delete') !== null) {
			if (id === null) {
				return;
			}
			widget = attachments.get(id);
			if (widget !== null) {
				if (widget.getId()[0] === ':') {
					dropzone.removeFile(widget.getFile());
					attachments.remove(id);
				}
				else {
					attachments.update(id, { deleted: true });
					if (self.autoProcess) {
						saveUploads();
					}
				}
				fireListeners('changed');
			}
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

	self.loadAttachments = function() {
		if (isPlaceholderUrl(self.listUrl)) {
			attachments.load([], true);
		}
		else {
			_.xhrSend({
				url: self.listUrl,
				extraHeaders: {
					'Accept': 'application/json',
				},
				successFn: function(data) {
					attachments.load([], true);
					if (data.attachments) {
						if (self.updateUrl) {
							_.forEach(data.attachments, function(attachment) {
								attachment.deletable = true;
							});
						}
						attachments.load(data.attachments);
					}
				}
			});
		}
	};

	self.save = function(successCallback) {
		if (dropzone === undefined) {
			setTimeout(function() {
				saveUploads(successCallback);
			}, 0);
		}
		else {
			setTimeout(function() {
				if (dropzone.getQueuedFiles().length || dropzone.getUploadingFiles().length) {
					_.xhrSend({
						url: self.uploadUrl,
						method: 'POST',
						data: {action: 'get_library'},
						extraHeaders: {
							'Accept': 'application/json',
						},
						successFn: function(data) {
							if (data && data.sign) {
								self.librarySign = data.sign;
								self.librarySignName = 'attachment_' + data.name;
								var hiddenInput = document.getElementById('id_' + self.librarySignName);
								if (hiddenInput === null) {
									hiddenInput = document.createElement('input');
									hiddenInput.setAttribute('id', 'id_' + self.librarySignName);
									hiddenInput.setAttribute('name', self.librarySignName);
									element.appendChild(hiddenInput);
								}
								hiddenInput.value = data.sign;
							}
							queueSuccessCallback = successCallback;
							dropzone.processQueue();
						},
						failFn: function() {
							queueSuccessCallback = successCallback;
							dropzone.processQueue();
						}
					});
				}
				else {
					saveUploads(successCallback);
				}
			}, 0);
		}
	};

	self.createLibrary = function(callback) {
		if (self.createLibraryUrl === null) {
			callback(null);
		}
		else {
			_.xhrSend({
				url: self.createLibraryUrl,
				method: 'POST',
				extraHeaders: {
					'Accept': 'application/json',
				},
				successFn: function(data) {
					callback(data.id);
				},
				failFn: function() {
					callback(null);
				}
			});
		}
	};

	self.onSaved = function(callback) {
		listeners.saved.push(callback);
	};

	self.onChanged = function(callback) {
		listeners.changed.push(callback);
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
				formData.append('csrfmiddlewaretoken', _.getCookie('csrftoken'));
				if (self.librarySign !== undefined) {
					formData.append(self.librarySignName, self.librarySign);
				}
				xhr.setRequestHeader('Accept', 'applicaton/json');
				var extraFormData = file.previewWidget.getExtraFormData();
				for (var key in extraFormData) {
					if (_.has(extraFormData, key)) {
						var value = extraFormData[key];
						formData.append(key, value);
					}
				}
			},
			uploadprogress: function(upload, progress) {
				upload.previewWidget.update({ progress: progress });
			},
			success: function(upload, data) {
				if (data.attachments) {
					_.forEach(data.attachments, function(attachment) {
						attachment.finished = true;
						if (attachment.is_new) {
							attachments.changeId(upload.previewWidget.getId(), attachment.id);
						}
					});
					if (self.updateUrl) {
						_.forEach(data.attachments, function(attachment) {
							attachment.deletable = true;
						});
					}
					attachments.load(data.attachments);
				}
				else {
					attachments.remove(upload.previewWidget.getId());
					if (data.errors !== undefined) {
						_.forEachDict(data.errors, function(key, errorList) {
							_.forEach(errorList, function(errorMessage) {
								messages.show(errorMessage.message, 'error');
							});
						});
					}
				}
				upload.previewWidget = undefined;
			},
			error: function(upload, errorMessage, response) {
				attachments.remove(upload.previewWidget.getId());
				upload.previewWidget = undefined;
				if (response && window._settings && window._settings.debug) {
					ajaxForwardError(response);
				}
			},
			queuecomplete: function() {
				if (self.updateUrl !== null) {
					saveUploads(queueSuccessCallback);
					queueSuccessCallback = undefined;
				}
				if (!self.autoProcess) {
					dropzone.options.autoProcessQueue = false;
				}
			},
			complete: function(upload) {
				upload.previewWidget = undefined;
			},
			processing: function() {
				dropzone.options.url = self.uploadUrl;
				dropzone.options.autoProcessQueue = true;
			},
			addedfile: function(upload) {
				upload.listData = {
					thumbnail: upload.dataURL,
					name: upload.name,
					finished: false,
					id: ':' + dropzoneUploadId,
					deletable: true,
					file: upload
				};
				dropzoneUploadId++;

				upload.previewWidget = attachments.add(upload.listData);

				if (self.uploadUrl !== null && !isPlaceholderUrl(self.uploadUrl)) {
					_.xhrSend({
						url: self.uploadUrl,
						method: 'POST',
						data: {action: 'mimetype', filename: upload.name},
						extraHeaders: {
							'Accept': 'application/json',
						},
						successFn: function(data) {
							if (upload.previewWidget !== undefined) {
								upload.previewWidget.update(data);
							}
						}
					});
				}

				fireListeners('changed');
				if (dropzone.options.autoProcessQueue) {
					return;
				}
				if (self.autoProcess) {
					setTimeout(function() { dropzone.processQueue(); }, 0);
				}
			},
			thumbnail: function(upload, dataURL) {
				if (upload.previewWidget !== undefined) {
					upload.previewWidget.update({thumbnail: upload.dataURL});
				}
			}
		});
		window.dropzone = dropzone;
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
				if (self.autoProcess) {
					saveUploads();
				}
				fireListeners('changed');
			},
			onStart: function() {
			},
			onEnd: function(evt) {
			}
		});
		return sortable;
	};

	var saveUploads = function(successCallback) {
		var listUrl = self.listUrl;
		if (self.librarySign !== undefined) {
			var separator = listUrl.indexOf('?') === -1 ? '?' : '&';
			listUrl += separator + encodeURIComponent(self.librarySignName) + '=' + encodeURIComponent(self.librarySign);
		}
		_.xhrSend({
			url: listUrl,
			extraHeaders: {
				'Accept': 'application/json',
			},
			successFn: function(data) {
				var oldAttachments = data.attachments;
				var newAttachments = attachments.toList();
				var formData = {'action': 'update', 'attachments': 'json'};
				var rowNumber = 0;
				var attachmentsIndex = {};
				_.forEach(oldAttachments, function(attachment) {
					attachment.rank = -1;
					attachmentsIndex[attachment.id] = attachment;
				});
				_.forEach(newAttachments, function(attachment) {
					var oldAttachment = attachmentsIndex[attachment.id];
					if (oldAttachment !== undefined && oldAttachment.rank === -1) {
						oldAttachment.rank = rowNumber;
						oldAttachment.deleted = attachment.deleted;
						rowNumber++;
					}
					if (attachment.deleted) {
						attachments.remove(attachment.id);
					}
				});
				_.forEach(oldAttachments, function(attachment, rowIndex) {
					if (attachment.rank === -1) {
						attachment.rank = rowNumber;
						rowNumber++;
					}
					formData['form-' + rowIndex + '-ORDER'] = attachment.rank + 1;
					formData['form-' + rowIndex + '-id'] = attachment.id;
					if (attachment.deleted) {
						formData['form-' + rowIndex + '-DELETE'] = '1';
					}
					var widget = attachments.get(attachment.id);
					if (widget !== null) {
						var extraFormData = widget.getExtraFormData();
						for (var key in extraFormData) {
							if (_.has(extraFormData, key)) {
								var value = extraFormData[key];
								formData['form-' + rowIndex + '-' + key] = value;
							}
						}
					}
				});
				formData['form-INITIAL_FORMS'] = rowNumber;
				formData['form-TOTAL_FORMS'] = rowNumber;
				formData['form-MAX_NUM_FORMS'] = 1000;
				formData['form-MIN_NUM_FORMS'] = 0;
				if (self.librarySign !== undefined) {
					formData[self.librarySignName] = self.librarySign;
				}
				_.xhrSend({
					method: 'POST',
					data: formData,
					url: self.updateUrl,
					extraHeaders: {
						'Accept': 'application/json',
					},
					successFn: function(data) {
						if (successCallback !== undefined) {
							successCallback();
						}
						fireListeners('saved');
					}
				});
			}
		});
	};

	attachments.load([]);
	if (self.updateUrl) {
		sortable = createSortable();
	}
	if (self.uploadUrl) {
		dropzone = createDropzone();
	}
	self.initialized = true;
	self.loadAttachments();

	return self;
};


window.uploadWidget = uploadWidget;
window.uploadWidget.fileWidget = fileWidget;


}());
