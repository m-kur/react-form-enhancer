"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An adaptor for DOM onChange event converts element's name and value attribute.
 * @param {ChangeEventHandler} prop this.props.formChange, etc.
 * @param {boolean} validateConcurrently do concurrent validation.
 */
exports.changeAdaptor = function (prop, validateConcurrently) {
    if (validateConcurrently === void 0) { validateConcurrently = true; }
    return function (e) {
        var value = e.target.type === 'checkbox' ? e.target.checked :
            (e.target.value != null ? e.target.value : e.currentTarget.value);
        var name = e.target.name != null ? e.target.name : e.currentTarget.name;
        prop(name, value, validateConcurrently);
    };
};
/**
 * An adaptor for DOM onFocus/onBlur event converts element's name attribute.
 * @param {FocusEventHandler} prop this.props.formValidate, etc.
 */
exports.focusAdaptor = function (prop) { return function (e) {
    var name = e.currentTarget.name != null ? e.currentTarget.name : e.target.name;
    prop(name);
}; };
//# sourceMappingURL=eventHandlerAdaptors.js.map