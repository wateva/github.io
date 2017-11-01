/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = function addEvent(el, event, fn) {
  if (el.addEventListener) {
    el.addEventListener(event, fn, false);
  } else if (el.attachEvent) {
    el.attachEvent('on' + event, fn);
  } else {
    el['on' + event] = fn;
  }
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var adkWidget = __webpack_require__(2);
var throttle = __webpack_require__(8);
var addEvent = __webpack_require__(0);
var isDocumentLoaded = __webpack_require__(9);

if (window.JSON) {
  if (window._adkTagsLoaded === undefined) {
    window._adkTagsLoaded = false;
  }

  isDocumentLoaded(function () {
    if (!window._adkTagsLoaded) {
      window._adkTagsLoaded = true;
      adkWidget.loadTags();
    }
  });

  addEvent(window, 'scroll', throttle(adkWidget.showTags, 300));
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var xhr = __webpack_require__(3);
var isInViewport = __webpack_require__(4);
var groupBy = __webpack_require__(5);
var visibility = __webpack_require__(6);
var sizes = __webpack_require__(7);

function getBannerSizes(minSizeStr, maxSizeStr) {
  var minSize = minSizeStr ? minSizeStr.split('x') : [0, 0];
  var maxSize = maxSizeStr ? maxSizeStr.split('x') : [Infinity, Infinity];

  var result = [];

  for (var i = 0; i < sizes.length; i++) {
    var size = sizes[i];
    if (size[0] >= minSize[0] && size[0] <= maxSize[0] && size[1] >= minSize[1] && size[1] <= maxSize[1]) {
      result.push(size.join('x'));
    }
  }

  return result;
}

function createIframe(width, height) {
  var iframe = document.createElement('iframe');
  iframe.width = width + 'px';
  iframe.height = height + 'px';
  iframe.frameBorder = '0';
  iframe.marginWidth = '0';
  iframe.marginHeight = '0';
  iframe.scrolling = 'no';
  iframe.style.display = 'block';
  iframe.style.border = 'none';
  iframe.style.margin = '0 auto';

  return iframe;
}

function setIframeContent(iframe, content) {
  var iframeDoc = iframe.contentWindow.document || iframe.contentDocument.document;
  iframeDoc.open();
  iframeDoc.write(content);
  iframeDoc.close();
}

function addSyncPages(pages) {
  for (var i = 0; i < pages.length; i++) {
    var iframe = createIframe(0, 0);
    iframe.src = pages[i];

    document.body.appendChild(iframe);
  }
}

function displayTag(tag, tagWidth, tagHeight, container) {
  var iframe = createIframe(tagWidth, tagHeight);

  container.style.overflowY = 'hidden';
  container.style.maxHeight = 0;
  container.appendChild(iframe);

  setIframeContent(iframe, tag);

  var prefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];
  var value = 'max-height 0.4s ease 0s';

  for (var i = 0; i < prefixes.length; i++) {
    container.style[prefixes[i] + 'transition'] = value;
    container.style.transition = value;
  }

  iframe.onload = function () {
    container.style.maxHeight = tagHeight + 'px';
  };
}

function createReqBody(data) {
  var reqBody = {
    id: Math.random().toString(16).substr(2),
    site: {
      page: window.location.href,
      ref: document.referrer,
      secure: document.location.protocol === 'https:' ? 1 : 0
    },
    imp: []
  };

  for (var i = 0; i < data.length; i++) {
    reqBody.imp.push({
      id: Math.random().toString(16).substr(2),
      tagid: data[i].tag,
      banner: {
        format: getBannerSizes(data[i].min_size, data[i].max_size)
      }
    });
  }

  return reqBody;
}

var adkwidget = {
  tags: [],

  loadTags: function () {
    var groupedWidgets = groupBy(window.adkwidget, function (el) {
      return el.acc + ',' + el.host;
    });

    for (var key in groupedWidgets) {
      var account = groupedWidgets[key][0].acc;
      var domain = groupedWidgets[key][0].host;
      var url = document.location.protocol + '//' + domain + '/tag?account=' + account + '&pb=1';
      var reqBody = createReqBody(groupedWidgets[key]);

      xhr({
        method: 'POST',
        url: url,
        data: JSON.stringify(reqBody),
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        },
        crossDomain: true
      }, function (res) {
        var data = JSON.parse(res);

        if (data.tags && data.tags.length) {
          adkwidget.tags = adkwidget.tags.concat(data.tags);
          adkwidget.showTags();
        }

        if (data.syncpages && data.syncpages.length) {
          addSyncPages(data.syncpages);
        }
      });
    }
  },

  showTags: function () {
    if (!visibility.isVisible()) {
      return;
    }

    var notDisplayedTags = [];

    for (var i = 0; i < adkwidget.tags.length; i++) {
      var tagInfo = adkwidget.tags[i];

      var tagId = tagInfo.id;
      var tag = tagInfo.tag;
      var tagWidth = tagInfo.w;
      var tagHeight = tagInfo.h;

      var container = document.getElementById(tagId);

      if (isInViewport(container, tagWidth, tagHeight)) {
        displayTag(tag, tagWidth, tagHeight, container);
        continue;
      }

      notDisplayedTags.push(tagInfo);
    }

    adkwidget.tags = notDisplayedTags;
  }
};

visibility.onVisible(adkwidget.showTags);

module.exports = adkwidget;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = function (settings, cb) {
  var url = settings.url;
  var method = settings.method;
  var data = settings.data;
  var headers = settings.headers;
  var crossDomain = settings.crossDomain;

  if (window.XMLHttpRequest) {
    var xhr = new XMLHttpRequest();

    if ('withCredentials' in xhr) {
      xhr.open(method, url, true);

      if (crossDomain) {
        xhr.withCredentials = true;
      }

      if (headers) {
        for (var header in headers) {
          xhr.setRequestHeader(header, headers[header])
        }
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          cb(xhr.responseText);
        }
      };
      xhr.send(data);
    } else if (window.XDomainRequest) {
      xhr = new XDomainRequest(); // fix for IE8/9
      xhr.open(method, url);
      xhr.onload = function () {
        cb(xhr.responseText);
      };
      xhr.send(data);
    }
  }
};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

function getCurrentScroll() {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  };
}

function getViewportSize() {
  return {
    width: window.innerWidth || window.document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || window.document.documentElement.clientHeight || document.body.clientHeight
  };
}

function getElementInfo(elem) {
  var offsetTop = 0;
  var offsetLeft = 0;
  var offsetWidth = elem.offsetWidth;
  var offsetHeight = elem.offsetHeight;

  do {
    if (!isNaN(elem.offsetTop)) {
      offsetTop += elem.offsetTop;
    }
    if (!isNaN(elem.offsetLeft)) {
      offsetLeft += elem.offsetLeft;
    }
  } while ((elem = elem.offsetParent) !== null);

  return {
    top: offsetTop,
    left: offsetLeft,
    width: offsetWidth,
    height: offsetHeight
  };
}

var isInViewport = function (elem, hiddenWidth, hiddenHeight) {
  var viewportSize = getViewportSize();
  var currentScroll = getCurrentScroll();
  var elemInfo = getElementInfo(elem);
  var elemWidth = hiddenWidth ? hiddenWidth : elemInfo.width;
  var elemHeight = hiddenHeight ? hiddenHeight : elemInfo.height;
  var elemTop = elemInfo.top;
  var elemLeft = elemInfo.left;
  var elemBottom = elemTop + elemHeight;
  var elemRight = elemLeft + elemWidth;
  var spaceOffset = 0.7;

  var top = elemTop + elemHeight * spaceOffset;
  var left = elemLeft + elemWidth * spaceOffset;
  var bottom = elemBottom - elemHeight * spaceOffset;
  var right = elemRight - elemWidth * spaceOffset;

  var viewportTop = currentScroll.y;
  var viewportLeft = currentScroll.x;
  var viewportBottom = currentScroll.y + viewportSize.height;
  var viewportRight = currentScroll.x + viewportSize.width;

  return top < viewportBottom && bottom > viewportTop && left > viewportLeft && right < viewportRight;
};

module.exports = isInViewport;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = function (collection, iteratee) {
  var res = {};

  for (var i = 0; i < collection.length; i++) {
    var elem = collection[i];
    var key = iteratee(elem);
    (res[key] = res[key] || []).push(elem);
  }

  return res;
};


/***/ }),
/* 6 */
/***/ (function(module, exports) {

var visibility = {
  prefix: null,
  prefixes: ['webkit', 'ms', 'moz'],
  visibleCallbacks: [],
  hiddenCallbacks: [],

  isSupported: function () {
    var i = visibility.prefixes.length;
    while (i--) if (visibility._supports(i)) return visibility.prefix = visibility.prefixes[i];
  },

  _supports: function (index) {
    return ((visibility.prefixes[index] + 'Hidden') in document);
  },

  isVisible: function() {
    if (visibility.isSupported()) {
      return !document[visibility.prefix + 'Hidden'];
    }

    return true;
  },

  onVisible: function (cb) {
    visibility.visibleCallbacks.push(cb);
  },

  onHidden: function (cb) {
    visibility.hiddenCallbacks.push(cb);
  },

  runCallbacks: function (callbacks) {
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i]();
    }
  },

  handleChange: function () {
    if ((document[visibility.prefix + 'Hidden']) === true) {
      return visibility.runCallbacks(visibility.visibleCallbacks);
    }

    visibility.runCallbacks(visibility.hiddenCallbacks)
  },

  listen: function () {
    try {
      if (!(visibility.isSupported())) {
        if (document.addEventListener) {
          window.addEventListener('focus', visibility.onVisible, true);
          window.addEventListener('blur', visibility.onHidden, true);
        } else { // for IE 10
          document.attachEvent('onfocusin', visibility.onVisible);
          document.attachEvent('onfocusout', visibility.onHidden);
        }
      } else {
        document.addEventListener(visibility.prefix + 'visibilitychange', visibility.handleChange, true);
      }
    } catch (e) {}
  }
};

visibility.listen();

module.exports = visibility;


/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = [
  [320, 50],
  [320, 480],
  [300, 504],
  [80, 320],
  [300, 250],
  [250, 250],
  [240, 400],
  [336, 280],
  [180, 150],
  [300, 100],
  [720, 300],
  [468, 60],
  [234, 60],
  [88, 31],
  [120, 90],
  [120, 60],
  [120, 240],
  [125, 125],
  [728, 90],
  [160, 600],
  [120, 600],
  [300, 600]
];


/***/ }),
/* 8 */
/***/ (function(module, exports) {

var getTime = Date.now || function () {
  return new Date().getTime();
};

var throttle = function (func, wait) {
  var context, args, result;
  var timeout = null;
  var previous = 0;

  var later = function () {
    previous = getTime();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) {
      context = args = null;
    }
  };

  return function () {
    var now = getTime();
    var remaining = wait - (now - previous);

    context = this;
    args = arguments;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = now;
      result = func.apply(context, args);

      if (!timeout) {
        context = args = null;
      }
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }

    return result;
  };
};

module.exports = throttle;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var addEvent = __webpack_require__(0);

module.exports = function (fn) {
  // If document has finished loading, run function
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    return fn();
  }

  // Alternative to DOMContentLoaded
  addEvent(document, 'readystatechange', function () {
    if (document.readyState === 'interactive') fn()
  }, false);
};


/***/ })
/******/ ]);
