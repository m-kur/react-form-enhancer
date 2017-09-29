"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var SimpleMemory = /** @class */ (function () {
    function SimpleMemory() {
        this.args = null;
        this.result = null;
        this.isKnown = this.isKnown.bind(this);
        this.memorize = this.memorize.bind(this);
        this.remember = this.remember.bind(this);
    }
    SimpleMemory.prototype.isKnown = function (currentValues) {
        return this.args != null && immutable_1.fromJS(currentValues).equals(this.args);
    };
    SimpleMemory.prototype.memorize = function (currentValues, result) {
        this.args = immutable_1.fromJS(currentValues);
        this.result = result;
    };
    SimpleMemory.prototype.remember = function () {
        return this.result;
    };
    return SimpleMemory;
}());
exports.SimpleMemory = SimpleMemory;
function memorizedAdaptor(validator, memory) {
    if (memory === void 0) { memory = new SimpleMemory(); }
    return function (currentValues, name, inspector) {
        if (!memory.isKnown(currentValues)) {
            var validResult = null;
            try {
                validResult = validator(currentValues, name, inspector);
            }
            catch (error) {
                // don't memorize.
                return error.message;
            }
            if (Promise.resolve(validResult) === validResult) {
                var promise = validResult;
                promise.then(function () {
                    // async-resolve, memorize.
                    memory.memorize(currentValues, null);
                }, function (reason) {
                    // async-reject, memorize.
                    memory.memorize(currentValues, reason);
                    return reason;
                });
                return promise;
            }
            else {
                // sync, memorize.
                memory.memorize(currentValues, validResult);
            }
        }
        return memory.remember();
    };
}
exports.memorizedAdaptor = memorizedAdaptor;
//# sourceMappingURL=handlerAdaptors.js.map