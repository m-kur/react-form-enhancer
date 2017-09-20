"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var definitionChecker_1 = require("./definitionChecker");
function invokeHandler(name, handler, onResolve, onReject, inspector) {
    var onProcessed = inspector != null ? inspector : function () { };
    var result = handler();
    if (Promise.resolve(result) === result) {
        onProcessed({ name: name, type: 'handled', async: true });
        result.then(function () {
            onResolve();
            onProcessed({ name: name, type: 'resolved', async: true });
        }, function (reason) {
            // don't catch Error.
            if (reason instanceof Error)
                throw reason;
            onReject(reason);
            onProcessed({ name: name, type: 'rejected', async: true });
        });
    }
    else {
        onProcessed({ name: name, type: 'handled', async: false });
        if (result != null) {
            onReject(result);
            onProcessed({ name: name, type: 'rejected', async: false });
        }
        else {
            onResolve();
            onProcessed({ name: name, type: 'resolved', async: false });
        }
    }
}
exports.invokeHandler = invokeHandler;
function sanitizeErrors(definition, errors, isForm) {
    return Object.keys(errors).reduce(function (prior, name) {
        if (!definitionChecker_1.isDefinedName(definition, name, 'result of a validation', isForm)) {
            return prior.delete(name);
        }
        var reason = errors[name];
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
function mergeErrors(definition, oldError, name, newErrors) {
    var isForm = name === 'form';
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
        if (definitionChecker_1.isDefinedName(definition, name, 'result of a validation', isForm)) {
            return immutable_1.Map(oldError).set(name, String(newErrors)).toJS();
        }
    }
    else if (newErrors instanceof Error) {
        // reject catch Error
        if (definitionChecker_1.isDefinedName(definition, name, 'catching Error of a validation', isForm)) {
            return immutable_1.Map(oldError).set(name, newErrors.message).toJS();
        }
    }
    // reject returns NOT string, maybe { [name: string]: any }
    var sanitized = sanitizeErrors(definition, newErrors, isForm);
    return immutable_1.Map(oldError).merge(sanitized).toJS();
}
exports.mergeErrors = mergeErrors;
//# sourceMappingURL=handlerEngine.js.map