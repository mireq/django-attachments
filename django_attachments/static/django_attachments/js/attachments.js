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


var listModel = function() {
	var self = {};
	var listeners = {
		add: [],
		delete: [],
		move: [],
		change: []
	};

	onAdded = function(item) {
		_.forEach(listeners.add, function(listener) {
			listener(item);
		});
	};
	onDeleted = function(item) {
		_.forEach(listeners.delete, function(listener) {
			listener(item);
		});
	};
	onMoved = function(item, position) {
		_.forEach(listeners.move, function(listener) {
			listener(item, position);
		});
	};
	onChanged = function(item) {
		_.forEach(listeners.change, function(listener) {
			listener(item);
		});
	};

	self.onAdded = function(listener) { listeners.add.push(listener); };
	self.onDeleted = function(listener) { listeners.delete.push(listener); };
	self.onMoved = function(listener) { listeners.move.push(listener); };
	self.onChanged = function(listener) { listeners.change.push(listener); };

	var items = [];

	self.setItems = function(newItems) {
		var itemPointer = 0;
		_.forEach(newItems, function(newItem, newPosition) {
			var oldPosition;
			_.forEach(items, function(oldItem, position) {
				if (oldItem.id === newItem.id) {
					oldPosition = position;
				}
			});

			// insert
			if (oldPosition === undefined) {
				if (newPosition >= items.length) {
					items.push(newItem);
					onAdded(newItem);
				}
				else {
					items.push(newItem);
					onAdded(newItem);
					items.splice(items.length - 1, 1);
					items.splice(newPosition, 0, newItem);
					onMoved(newItem, position);
				}
				return;
			}

			// change (same position)
			if (oldPosition == newPosition) {
				items[newPosition] = newItem;
				onChanged(newItem);
			}
			// change (moved position)
			else {
				var oldItem = items[oldPosition];
				items.splice(oldPosition, 1);
				items.splice(newPosition, 0, oldItem);
				onMoved(oldItem, newPosition);
				items[newPosition] = newItem;
				onChanged(newItem);
			}
		});

		while (items.length > newItems.length) {
			var oldItem = items[newItems.length];
			items.splice(newItems.length, 1);
			onDeleted(oldItem);
		}
	};

	self.findItem = function(id) {
		var itemIdx;
		_.forEach(items, function(item, idx) {
			if (item.id === id) {
				itemIdx = idx;
			}
		});
		return itemIdx;
	};

	self.addItem = function(item) {
		items.push(item);
		onAdded(item);
	};

	self.changeItem = function(item) {
		var itemIdx = self.findItem(item.id);
		if (itemIdx !== undefined) {
			items[itemIdx] = item;
			self.onChange(item);
		}
	};

	self.destroy = function() {
		self.setItems([]);
		listeners = {
			add: [],
			delete: [],
			move: [],
			change: []
		};
	};

	return self;
};


var listView = function(model, element, widgetConstructor) {
	var self = {};
	var widgets = [];

	model.onAdded(function(item) {
		console.log("added", item);
	});
	model.onDeleted(function(item) {
		console.log("deleted", item);
	});
	model.onMoved(function(item, position) {
		console.log("moved", item, position);
	});
	model.onChanged(function(item) {
		console.log("changed", item);
	});

	return self;
};


/* === Widget === */


var fileWidget = function() {

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

	var files = document.createElement('DIV');
	files.className = 'files';
	widgetElement.appendChild(files);

	var attachmentsModel = listModel();
	var attachmentsView = listView(attachmentsModel, files, fileWidget);
	var dropzone;
	var dropzoneUploadList = [];
	var dropzoneUploadId = 0;
	var sortable;

	var onClicked = function(e) {
		if (e.which !== 1) {
			return;
		}

		var target = e.target;
		var id = target.getAttribute('data-delete-id');
		if (id !== null) {
			if (locked) {
				return;
			}
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

	_.bindEvent(files, 'click', onClicked);

	self.destroy = function() {
		if (sortable !== undefined) {
			sortable.destroy();
			sortable = undefined;
		}
		dropzone = undefined;
		widgetElement.parentNode.removeChild(widgetElement);
		element.style.display = 'block';
		_.unbindEvent(files, 'click', onClicked);
	};

	self.makeAttachmentWidget = function(attachmentData) {
		/*
		 * Returns dictionary:
		 *
		 * {
		 *   element: html_element,
		 *   updateProgress: function
		 * }
		 */
		var attachment = document.createElement('DIV');
		attachment.setAttribute('data-id', attachmentData.id);
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
		if (attachmentData.thumbnail !== undefined) {
			var img = document.createElement('IMG');
			thumbnail.appendChild(img);
			img.setAttribute('src', attachmentData.thumbnail);
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

		if (self.updateUrl !== null && attachmentData.id !== undefined) {
			var link = document.createElement('A');
			link.innerHTML = 'Delete';
			link.setAttribute('href', '#');
			link.setAttribute('data-delete-id', attachmentData.id);
			link.className = 'delete delete-link';
			frame.appendChild(link);
		}

		return {
			element: attachment,
			updateProgress: function(value) {
				progress.style.width = value + '%';
			}
		};
	};

	var renderAttachments = function(data) {
		var toRemove = [];
		_.forEach(files.childNodes, function(node) {
			if (node.getAttribute('data-uploading') === null) {
				toRemove.push(node);
			}
		});

		_.forEach(toRemove, function(node) {
			node.parentNode.removeChild(node);
		});

		var insertAttachment;
		var lastNode = files.childNodes[files.childNodes.length - 1];
		if (lastNode === undefined) {
			insertAttachment = function(element) {
				files.appendChild(element);
			};
		}
		else {
			insertAttachment = function(element) {
				lastNode.parentNode.insertBefore(element, lastNode);
			};
		}

		_.forEach(data, function(attachmentData) {
			insertAttachment(self.makeAttachmentWidget({
				'thumbnail': attachmentData.thumbnail,
				'name': attachmentData.name,
				'id': attachmentData.id,
				'finished': true
			}).element);
		});
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
				console.log(file);
			},
			uploadprogress: function(upload, progress) {
				upload.previewWidget.updateProgress(progress);
			},
			success: function(upload, data) {
				/*
				attachmentsModel.setItems(data);
				upload.previewElement.parentNode.removeChild(upload.previewElement);
				upload.previewElement = undefined;
				upload.previewWidget = undefined;
				*/
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
				dropzoneUploadList.push(upload);
				attachmentsModel.addItem(upload.listData);

				upload.previewWidget = self.makeAttachmentWidget({
					'thumbnail': upload.dataURL,
					'name': upload.name,
					'finished': false,
					'upload': upload
				});
				upload.previewElement = upload.previewWidget.element;
				files.appendChild(upload.previewElement);

				if (dropzone.options.autoProcessQueue) {
					return;
				}
				if (options.autoProcess) {
					setTimeout(function() { dropzone.processQueue(); }, 0);
				}
			},
			thumbnail: function(upload, dataURL) {
				/*
				var oldPreview = upload.previewElement;
				upload.previewWidget = self.makeAttachmentWidget({
					'thumbnail': upload.dataURL,
					'name': upload.name,
					'finished': false
				});
				upload.previewElement = upload.previewWidget.element;
				oldPreview.parentNode.insertBefore(upload.previewElement, oldPreview);
				oldPreview.parentNode.removeChild(oldPreview);
				*/
			}
		});
		return dropzone;
	};

	var createSortable = function() {
		var sortable = Sortable.create(files, {
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
				var position;
				if (evt.newIndex > evt.oldIndex) {
					position = files.childNodes[evt.oldIndex];
				}
				else {
					position = files.childNodes[evt.oldIndex + 1];
				}
				evt.item.parentNode.removeChild(evt.item);
				if (position) {
					position.parentNode.insertBefore(evt.item, position);
				}
				else {
					files.appendChild(evt.item);
				}
				console.log(evt.oldIndex, evt.newIndex);
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
			attachmentsModel.setItems(data);
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



uploadWidget(document.getElementsByClassName('attachments-upload-widget')[0], {autoProcess: false});


}());
