"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var definitionChecker_1 = require("./definitionChecker");
function invokeHandler(name, handle, // <- Promise's type arg is intentional never.
    onResolve, onReject, notify) {
    var result = null;
    try {
        result = handle();
    }
    catch (error) {
        onReject(error);
        notify('rejected', name, error);
    }
    if (Promise.resolve(result) === result) {
        notify('async-handled', name);
        var promise = result; // <- type arg is intentional never.
        promise.then(function () {
            onResolve();
            notify('async-resolved', name);
        }, function (reason) {
            onReject(reason);
            notify('async-rejected', name, reason);
        });
    }
    else {
        notify('handled', name);
        if (result == null) {
            onResolve();
            notify('resolved', name);
        }
        else {
            onReject(result);
            notify('rejected', name, result);
        }
    }
}
exports.invokeHandler = invokeHandler;
function sanitizeErrors(definition, newErrors, isForm) {
    return Object.keys(newErrors).reduce(function (prior, name) {
        if (!definitionChecker_1.isDefinedName(definition, name, 'result of a validation', isForm)) {
            return prior.delete(name);
        }
        var reason = newErrors[name];
        if (reason == null) {
            // null or undefined means no-error.
            return prior.set(name, null);
        }
        else if (typeof reason === 'string' || typeof reason === 'number' || typeof reason === 'boolean') {
            return prior.set(name, String(reason));
        }
        // ignore 'function' etc
        return prior;
    }, immutable_1.Map({})).toJS();
}
exports.sanitizeErrors = sanitizeErrors;
function mergeErrors(definition, oldError, name, newErrors) {
    var isForm = name === 'form';
    var type = isForm ? 'submitting' : 'validation';
    if (newErrors == null) {
        if (isForm) {
            // submit -> resolve
            return {};
        }
        else {
            // invokeValidator -> resolve
            return immutable_1.Map(oldError).delete(name).toJS();
        }
    }
    else if (typeof newErrors === 'string' || typeof newErrors === 'number' || typeof newErrors === 'boolean') {
        // reject returns string (or number, boolean)
        if (definitionChecker_1.isDefinedName(definition, name, "result of a " + type, isForm)) {
            return immutable_1.Map(oldError).set(name, String(newErrors)).toJS();
        }
    }
    else if (newErrors instanceof Error) {
        if (definitionChecker_1.isDefinedName(definition, name, "Error of a " + type, isForm)) {
            return immutable_1.Map(oldError).set(name, newErrors.message).toJS();
        }
    }
    // reject returns NOT string, maybe { [name: string]: any }
    // newErrors isn't Error object because invokeHandler doesn't catch Error.
    return immutable_1.Map(oldError).merge(sanitizeErrors(definition, newErrors, isForm)).toJS();
}
exports.mergeErrors = mergeErrors;
//# sourceMappingURL=handlerEngine.js.map