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
    SimpleMemory.prototype.isKnown = function (name, newValue, currentValues) {
        return this.args != null && immutable_1.fromJS(this.args).equals(immutable_1.fromJS({ name: name, newValue: newValue }));
    };
    SimpleMemory.prototype.memorize = function (result, name, newValue, currentValues) {
        this.args = { name: name, newValue: newValue };
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
    return function (name, newValue, currentValues, inspector) {
        if (!memory.isKnown(name, newValue, currentValues)) {
            var validResult = null;
            try {
                validResult = validator(name, newValue, currentValues, inspector);
            }
            catch (error) {
                // don't memorize.
                return error.message;
            }
            if (Promise.resolve(validResult) === validResult) {
                var promise = validResult;
                promise.then(function () {
                    // async-resolve, memorize.
                    memory.memorize(null, name, newValue, currentValues);
                }, function (reason) {
                    // async-reject, memorize.
                    memory.memorize(reason, name, newValue, currentValues);
                    return reason;
                });
                return promise;
            }
            else {
                // sync, memorize.
                memory.memorize(validResult, name, newValue, currentValues);
            }
        }
        return memory.remember();
    };
}
exports.memorizedAdaptor = memorizedAdaptor;
//# sourceMappingURL=validatorAdaptors.js.map