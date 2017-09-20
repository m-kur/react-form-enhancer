"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=handlerEngine.js.map