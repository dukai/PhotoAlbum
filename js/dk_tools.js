/*************************************
 author     : DK
 createDate : 2010.1.1
 editDate   : 2010.8.1,2010.8.16,2010.9.3,2010.9.10,2010.9.30, 2010.12.6, 2010.12.14, 2010.12.16, 2010.12.17
 blog       : http://www.dklogs.net
 email      : xiaobaov2@gmail.com
 *************************************/
(

function () {
    if (!window.dk) {
        window['dk'] = {}
    }
    //根据ID获取对象

    function $() {
        if (typeof(arguments[0]) == 'string') {
            if (document.getElementById(arguments[0])) {
                return document.getElementById(arguments[0]);
            } else {
                //throw "unknow element";
                return null;
            }
        } else {
            return arguments[0];
        }
    }

    window.dk.$ = $;

    function $c(tagName) {
        return document.createElement(tagName);
    }

    window.dk.$c = $c;
    var browserMatch = window.dk.browserMatch = (function (ua) {
        ua = navigator.userAgent.toLowerCase();
        var match = /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || !/compatible/.test(ua) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) || [];
        return {
            browser: match[1] || "",
            version: match[2] || "0"
        };
    })();
    window.dk.browser = {};
    if (browserMatch.browser) {
        window.dk.browser[browserMatch.browser] = true;
        window.dk.browser.version = browserMatch.version;
    }
    //根据Class名称获取对象

    function getElementsByClassName(className, tag, parent) {
        parent = parent || document;
        if (!(parent = $(parent))) {
            return false;
        }
        var allTags = (tag == '*' && parent.all) ? parent.all : parent.getElementsByTagName(tag);
        var matchingElements = new Array();
        className = className.replace(/\-/g, '\\-');
        var regex = new RegExp('(^|\\s)' + className + '(\\s|$)');
        var element;
        for (var i = 0, length = allTags.length; i < length; i++) {
            element = allTags[i];
            if (regex.test(element.className)) {
                matchingElements.push(element);
            }
        }
        return matchingElements;
    }

    window['dk']['getElementsByClassName'] = getElementsByClassName;
	//绑定事件
    function addEvent(node, type, listener) {
        if (typeof(node) == 'string') {
            node = $(node);
        }
        if (!listener.$$guid) {
            listener.$$guid = addEvent.guid++;
        }
        if (!node.events) {
            node.events = {};
        }
        var handlers = node.events[type],
            isRegisted = !! node.events[type];
        if (!handlers) {
            handlers = node.events[type] = {};
        }
        handlers[listener.$$guid] = listener;
        if (!isRegisted) {
            if (node.addEventListener) {
                node.addEventListener(type, handleEvent, false);
            } else if (node.attachEvent) {
                var tempFunc = function () {
                    handleEvent.call(node, window.event);
                };
                node.attachEvent('on' + type, tempFunc);
            } else {
                node['on' + type] = handleEvent;
            }
        }
    }

    addEvent.guid = 1;

    function removeEvent(node, type, handler) {
        if (node.events && node.events[type]) {
            delete node.events[type][handler.$$guid];
        }
    }

    function handleEvent(event) {
        var returnValue = true;
        event = event || window.event;
        event = fixEvent(event, this);
        var handlers = this.events[event.type];
        for (var i in handlers) {
            this.$$handleEvent = handlers[i];
            if (this.$$handleEvent(event) === false) {
                returnValue = false;
            }
        }
        return returnValue;
    }

    function fixEvent(event, currentTarget) {
        event.preventDefault || (event.preventDefault = fixEvent.preventDefault);
        event.stopPropagation || (event.stopPropagation = fixEvent.stopPropagation);
        event.target || (event.target = event.srcElement);
        event.currentTarget || (event.currentTarget = currentTarget);
        //event.x && (event.x = fixEvent.x);
        //event.y && (event.y = fixEvent.y);
        return event;
    }

    fixEvent.preventDefault = function () {
        this.returnValue = false;
    };
    fixEvent.stopPropagation = function () {
        this.cancelBubble = true;
    };
    window['dk']['addEvent'] = addEvent;
    window.dk.addEvent = addEvent;
    //移出绑定的事件
    window.dk.removeEvent = removeEvent;
    //绑定函数的执行对象

    function bind(targetObj, func) {
        var args = Array.prototype.slice.call(arguments).slice(2);
        return function () {
            return func.apply(targetObj, args.concat(Array.prototype.slice.call(arguments)));
        }
    }

    window['dk']['bind'] = bind;
    //检查childNode是被包含在parentNode中

    function contains(parentNode, childNode) {
        return parentNode.contains ? parentNode != childNode && parentNode.contains(childNode) : !! (parentNode.compareDocumentPosition(childNode) & 16);
    }

    window['dk']['contains'] = contains;
    //获取Event对象

    function getEvent(e) {
        return e || window.event;
    }

    window.dk.getEvent = getEvent;
    //停止冒泡

    function stopBubble(e) {
        getEvent(e).bubbles ? getEvent(e).stopPropagation() : getEvent(e).cancelBubble = true;
    }

    window['dk']['stopBubble'] = stopBubble;
    //恢复冒泡

    function startBubble(e) {
        getEvent(e).initEvent ? getEvent(e).initEvent() : getEvent(e).cancelBubble = false;
    }

    window['dk']['startBubble'] = startBubble;
    //检查mouseover和mouseout模式下取消事件派发

    function checkHover(e, target) {
        if (dk.getEvent(e).type == "mouseover") {
            return !contains(target, getEvent(e).relatedTarget || getEvent(e).fromElement) && !((getEvent(e).relatedTarget || getEvent(e).fromElement) === target);
        } else {
            return !contains(target, getEvent(e).relatedTarget || getEvent(e).toElement) && !((getEvent(e).relatedTarget || getEvent(e).toElement) === target);
        }
    }

    window['dk']['checkHover'] = checkHover;
    //获取事件触发的对象

    function getEventTarget(e) {
        return dk.getEvent(e).target || dk.getEvent(e).srcElement;
    }

    window['dk']['getEventTarget'] = getEventTarget;
    //获取窗口的大小

    function getBrowserSize() {
        var de = document.documentElement;
        return {
            width: (window.innerWidth || (de && de.clientWidth) || document.body.clientWidth),
            height: (window.innerHeight || (de && de.clientHeight) || document.body.clientHeight)
        }
    }

    window['dk']['getBrowserSize'] = getBrowserSize;
    //获取对象在页面中的位置，返回值为值类型

    function getPositionInDoc(target) {
        target = $(target)
        if (!target) {
            return null;
        }
        var left = 0,
            top = 0;
        do {
            left += target.offsetLeft || 0;
            top += target.offsetTop || 0;
            target = target.offsetParent;
        } while (target);
        return {
            left: left,
            top: top
        };
    }
    window['dk']['getPositionInDoc'] = getPositionInDoc;
    window.dk.pageDom = getPositionInDoc;
    //获取鼠标在Document中的位置，返回值为值类型

    function getMousePositionInDoc(e) {
        var scrollx, scrolly;
        if (typeof(window.pageXOffset) == 'number') {
            scrollx = window.pageXOffset;
            scrolly = window.pageYOffset;
        } else {
            scrollx = document.documentElement.scrollLeft;
            scrolly = document.documentElement.scrollTop;
        }
        return {
            x: e.clientX + scrollx,
            y: e.clientY + scrolly
        }
    }
    window['dk']['getMousePositionInDoc'] = getMousePositionInDoc;
    window['dk']['pageMouse'] = getMousePositionInDoc;
    //获取document的宽度和高度

    function getDocSize() {
        return {
            width: document.body.scrollWidth,
            height: document.body.scrollHeight
        };
    }
    window.dk.getDocSize = getDocSize;
    //获取滚动条的top 和 left

    function getScroll() {
        var scrollx, scrolly;
        if (typeof(window.pageXOffset) == 'number') {
            scrollx = window.pageXOffset;
            scrolly = window.pageYOffset;
        } else {
            scrollx = document.documentElement.scrollLeft;
            scrolly = document.documentElement.scrollTop;
        }
        return {
            left: scrollx,
            top: scrolly
        };
    }

    window.dk.getScroll = getScroll;

    window.dk.now = (function () {
        return new Date();
    })();

    function tagName(target) {
        return target.tagName.toLowerCase();
    }
    window.dk.tagName = tagName;
    //根据给定的范围返回随机数

    function ran(m, n) {
        return Math.floor((n - m + 1) * Math.random() + m);
    }
    window.dk.ran = ran;
    //日志

    function myLogs(id) {
        id = id || 'defaultDebugLogs';
        var logsWindow = null;
        var initWindow = function () {
            logsWindow = document.createElement('ol');
            logsWindow.setAttribute('id', id);
            var winStyle = logsWindow.style;
            winStyle.position = 'fixed';
            winStyle.top = '10px';
            winStyle.right = '10px';
            winStyle.width = '300px';
            winStyle.height = '600px';
            winStyle.overflow = 'auto';
            winStyle.border = '1px solid #ccc';
            winStyle.background = '#fff';
            winStyle.padding = 0;
            winStyle.margin = 0;
            document.body.appendChild(logsWindow);
        };
        this.writeRow = function (message) {
            logsWindow || initWindow();
            var newItem = document.createElement('li');
            newItem.style.padding = '2px';
            newItem.style.margin = '0 0 1px 0';
            newItem.style.background = '#eee';
            if (typeof(message) == 'undefined') {
                newItem.innerHTML = '<span style=\"color:#f90;\">Message is undefined</span>';
            } else {
                newItem.innerHTML = message;
            }
            logsWindow.appendChild(newItem);
        };
    }

    myLogs.prototype = {
        write: function (message) {

            if (typeof(message) == 'string' && message.length == 0) {
                return this.writeRow('<span style=\"color:#900;\">warning:</span> empty message');
            }
            if (typeof(message) != 'string' && typeof(message) != 'undefined') {
                if (message.toString) return this.writeRow(message.toString());
                else
                return this.writeRow(typeof(message));
            }
            if (typeof(message) == 'undefined') {
                return this.writeRow('<span style=\"color:#f90;\">Message is undefined</span>');
            }
            message = message.replace(/</g, "&lt;").replace(/</g, "&gt;");
            return this.writeRow(message);
        },
        header: function (message) {
            return this.writeRow(message);
        }
    };
    window.dk.logs = new myLogs('log');
    //Dom加载完成事件

    function ready(loadEvent) {
        var init = function () {
            if (arguments.callee.done) return;
            arguments.callee.done = true;
            loadEvent.apply(document, arguments);
        };

        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', init, false);
        }

        if (/WebKit/i.test(navigator.userAgent)) {
            var _timer = setInterval(function () {
                if (/loaded|complete/.test(document.readyState)) {
                    clearInterval(_timer);
                    init();
                }
            }, 10)
        }


        /*@if(@_win32)*/
        document.write('<script id=__ie_onload defer src=javascript:void(0)><\/script>');
        var script = document.getElementById('__ie_onload');
        script.onreadystatechange = function () {
            if (this.readyState == 'complete') {
                init();
            }
        }; 
		/*@end @*/
        return true;
    }

    window['dk']['ready'] = ready;

    function trim(str) {
        return (str || "").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");
    }
    window['dk']['trim'] = trim;

    //继承

    function extend(parent, child, methords) {
        throw "TODO";
    }

})();

var _$ = function (node) {
    if (typeof(node) == 'string') {
        node = dk.$(node);
    }
    this.node = node;
};
_$.prototype = {
    fixover: function (func) {
        dk.addEvent(this.node, 'mouseover', function (e) {
            if (dk.checkHover(e, this)) {
                func(e);
            }
        });
        return this;
    },
    fixout: function (func) {
        dk.addEvent(this.node, 'mouseout', function (e) {
            if (dk.checkHover(e, this)) {
                func(e);
            }
        });
        return this;
    },
    css: function (style, value) { //三个重载方法
        var argNum = arguments.length;
        if (argNum == 1 && typeof(arguments[0]) == 'string') { //按照参数中的样式表的样式名称获取样式的值
            return this.getCss(arguments[0]);
        } else if (argNum == 1 && typeof(arguments[0]) == 'object') { //按照参数中的Json对象设置样式
            var styles = arguments[0];
            for (var i in styles) {
                this.setCss(i, styles[i]);
            }
        } else if (argNum == 2) { //按照参数中的样式名称和值对指定样式进行设置
            this.setCss(arguments[0], arguments[1]);
        }
        return this;
    },
    getCss: function (styleName) {
        var value;
        if (this.node.currentStyle) {
            value = this.node.currentStyle[styleName];
            if (value == 'auto' && styleName == 'width') {
                value = this.node.clientWidth;
            }
            if (value == 'auto' && styleName == 'height') {
                value = this.node.clientHeight;
            }
            if (styleName == 'opacity' && this.supportFilter() && !this.supportOpacity()) {
                var opactiyRex = /opacity=(\d{1,3})/;
                var filterString = this.node.currentStyle['filter'];
                if (opactiyRex.test(filterString)) {
                    value = parseFloat(RegExp.$1) / 100;
                }
            }
            return value;
        } else if (window.getComputedStyle) {
            value = window.getComputedStyle(this.node, null).getPropertyValue(this.getSplitName(styleName));
            return value;
        }
    },
    width: function () {
        return this.node.offsetWidth;
    },
    height: function () {
        return this.node.offsetHeight;
    },
    setCss: function (styleName, value) {
        //alert(!!document.body.filters);
        if (styleName == 'opacity') {
            if (this.supportOpacity()) {
                this.node.style.opacity = value;
            } else if (this.supportFilter()) {
                this.node.style.zoom = 1;
                this.node.style.filter = 'alpha(opacity=' + (parseFloat(value) * 100) + ')';
            }
            return;
        }
        regExpNoneUnit = /(?:zIndex|opacity|zoom)/i;
        if (!regExpNoneUnit.test(styleName) && typeof value == 'number') {
            this.node.style[this.getCamelName(styleName)] = value + 'px';
            return;
        }

        this.node.style[this.getCamelName(styleName)] = value;
    },
    getSplitName: function (styleName) {
        return styleName.replace(/([A-Z])/g, '-$1').toLowerCase();
    },
    getCamelName: function (style_name) {
        return style_name.replace(/-([a-z])/g, function (targetStr) {
            return targetStr.slice(1).toUpperCase();
        });
    },
    addClass: function (value) {
        var classNames = (value || '').split(/\s+/);
        if (this.node.className) {
            var className = ' ' + this.node.className + ' ',
                setClass = this.node.className;
            for (var i = 0, len = classNames.length; i < len; i++) {
                if (className.indexOf(' ' + classNames[i] + ' ') < 0) {
                    setClass += ' ' + classNames[i];
                }
            }
            this.node.className = dk.trim(setClass);
        } else {
            this.node.className = value;
        }
    },
    removeClass: function (value) {
        var classNames = (value || '').split(/\s+/);
        if (this.node.className) {
            if (value) {
                var className = (' ' + this.node.className + ' ').replace(/[\n\t]/g, ' ');
                for (var i = 0, len = classNames.length; i < len; i++) {
                    className = className.replace(' ' + classNames[i] + ' ', ' ');
                }
                this.node.className = dk.trim(className);
            } else {
                this.node.className = '';
            }
        }
    },
    hasClass: function (value) {
        return this.node.className.indexOf(value) > -1;
    },
    supportOpacity: function () {
        return typeof document.createElement("div").style.opacity != 'undefined';
    },
    supportFilter: function () {
        return typeof document.createElement('div').style.filter != 'undefined';
    }
};
$$ = function (node) {
    return new _$(node);
};