var synth = require('synthetic-dom-events');

function isObject(item) {
    return (Object.prototype.toString.call(item) == '[object Object]');
}

function createHandler(name, fn, prefix) {
    prefix = prefix || '';

    var handler = function (element, name, callback, capture) {
        // if a hash of events and callbacks were passed
        if (isObject(name)) {
            var events = name;
            capture = callback;

            for (var key in events) {
                element[fn](prefix + key, events[key], capture || false);
            }
        } else {
            return element[fn](prefix + name, callback, capture || false);
        }
    }

    handler.name = name;

    return handler;
}

var on  = createHandler('on', 'addEventListener');
var off = createHandler('off', 'removeEventListener');

var once = function (element, name, fn, capture) {
    function tmp (ev) {
        off(element, name, tmp, capture);
        fn(ev);
    }
    on(element, name, tmp, capture);
};

var emit = function(element, name, opt) {
    var ev = synth(name, opt);
    element.dispatchEvent(ev);
};

if (!document.addEventListener) {
    on = createHandler('on', 'attachEvent', 'on');
}

if (!document.removeEventListener) {
    off = createHandler('off', 'detachEvent', 'on');
}

if (!document.dispatchEvent) {
    emit = function(element, name, opt) {
        var ev = synth(name, opt);
        return element.fireEvent('on' + ev.type, ev);
    };
}

module.exports = {
    on: on,
    off: off,
    once: once,
    emit: emit
};
