var synth = require('synthetic-dom-events');


function isObject(value) {
    // Avoid a V8 JIT bug in Chrome 19-20.
    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
}

function createHandler(name, fn, prefix) {
    prefix = prefix || '';

    var handler = function (element, evName, callback, capture) {
        // if a hash of events and callbacks were passed
        if (isObject(evName)) {
            var events = evName;
            capture = callback;

            for (var key in events) {
                element[fn](prefix + key, events[key], capture || false);
            }
        } else {
            return element[fn](prefix + evName, callback, capture || false);
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
