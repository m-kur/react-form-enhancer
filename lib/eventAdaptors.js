"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusAdaptor = function (prop) { return function (e) { return prop(e.currentTarget.name); }; };
exports.changeAdaptor = function (prop, validateConcurrently) {
    if (validateConcurrently === void 0) { validateConcurrently = true; }
    return function (e) {
        var value = e.target.type !== 'checkbox' ? e.target.value :
            e.target.checked;
        prop(e.target.name, value, validateConcurrently);
    };
};
//# sourceMappingURL=eventAdaptors.js.map