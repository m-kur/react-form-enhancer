"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An adaptor for DOM onFocus event converts element's name attribute.
 * @param {FocusEventHandler} prop this.props.formValidate, etc.
 */
exports.focusAdaptor = function (prop) { return function (e) { return prop(e.currentTarget.name); }; };
/**
 * An adaptor for DOM onChange event converts element's name and value attribute.
 * @param {ChangeEventHandler} prop this.props.formChange, etc.
 * @param {boolean} validateConcurrently do concurrent validation.
 */
exports.changeAdaptor = function (prop, validateConcurrently) {
    if (validateConcurrently === void 0) { validateConcurrently = true; }
    return function (e) {
        var value = e.target.type !== 'checkbox' ? e.target.value : e.target.checked;
        prop(e.target.name, value, validateConcurrently);
    };
};
//# sourceMappingURL=eventAdaptors.js.map