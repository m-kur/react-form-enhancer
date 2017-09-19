"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var immutable_1 = require("immutable");
// API: This HOC enhances your form component.
function formStateProvider(Form) {
    return /** @class */ (function (_super) {
        __extends(FormStateProvider, _super);
        function FormStateProvider(props) {
            var _this = _super.call(this, props) || this;
            _this.canSetStateFromAsync = false;
            if (props.defaultValues == null) {
                throw new Error('"defaultValues" property isn\'t set.');
            }
            if (props.submitHandler == null) {
                throw new Error('"submitHandler" property isn\'t set.');
            }
            _this.state = { isSubmitting: false, values: props.defaultValues, errors: {} };
            _this.cancelError = _this.cancelError.bind(_this);
            _this.reset = _this.reset.bind(_this);
            _this.submit = _this.submit.bind(_this);
            _this.change = _this.change.bind(_this);
            _this.validate = _this.validate.bind(_this);
            return _this;
        }
        FormStateProvider.prototype.componentWillMount = function () {
            this.canSetStateFromAsync = true;
        };
        FormStateProvider.prototype.componentWillUnmount = function () {
            this.canSetStateFromAsync = false;
        };
        FormStateProvider.prototype.isDefinedName = function (name) {
            return name === 'form' || this.props.defaultValues.hasOwnProperty(name);
        };
        FormStateProvider.prototype.setErrors = function (errors, primaryName) {
            var _this = this;
            if (this.canSetStateFromAsync && this.isDefinedName(primaryName)) {
                if (errors == null) {
                    if (primaryName === 'form') {
                        // submit -> resolve
                        this.setState({ errors: {} });
                    }
                    else {
                        // invokeValidator -> resolve
                        this.cancelError(primaryName);
                    }
                }
                else if (typeof errors === 'string') {
                    // reject returns string
                    this.setState(immutable_1.Map({}).set('errors', immutable_1.Map(this.state.errors).set(primaryName, errors)).toJS());
                }
                else {
                    // reject returns NOT string, maybe { [name: string]: string | null }
                    var sanitized = Object.keys(errors).reduce(function (result, name) {
                        if (!_this.isDefinedName(name)) {
                            return result.delete(name);
                        }
                        var reason = errors[name];
                        if (reason != null) {
                            return result.set(name, String(reason));
                        }
                        // don't delete an error whom value is null because of merging with this.state.errors.
                        return result;
                    }, immutable_1.Map(errors));
                    this.setState(immutable_1.Map({}).set('errors', immutable_1.Map(this.state.errors).merge(sanitized)).toJS());
                }
            }
        };
        FormStateProvider.prototype.cancelError = function (name) {
            if (this.canSetStateFromAsync && this.isDefinedName(name)) {
                this.setState(immutable_1.Map({}).set('errors', immutable_1.Map(this.state.errors).delete(name)).toJS());
            }
        };
        FormStateProvider.prototype.hasError = function () {
            for (var _i = 0, _a = Object.keys(this.state.errors); _i < _a.length; _i++) {
                var name_1 = _a[_i];
                if (this.state.errors[name_1] != null) {
                    return true;
                }
            }
            return false;
        };
        FormStateProvider.prototype.isPristine = function () {
            for (var _i = 0, _a = Object.keys(this.state.values); _i < _a.length; _i++) {
                var name_2 = _a[_i];
                if (this.state.values[name_2] !== this.props.defaultValues[name_2]) {
                    return false;
                }
            }
            return true;
        };
        FormStateProvider.prototype.reset = function () {
            this.setState({ isSubmitting: false, values: this.props.defaultValues, errors: {} });
        };
        FormStateProvider.prototype.endSubmitting = function () {
            if (this.canSetStateFromAsync) {
                this.setState({ isSubmitting: false });
            }
        };
        FormStateProvider.prototype.invoke = function (handler, onResolve, onReject) {
            var result = handler();
            if (Promise.resolve(result) === result) {
                result.then(function () { return onResolve(); }, function (reason) {
                    // This component doesn't catch Error.
                    if (reason instanceof Error)
                        throw reason;
                    onReject(reason);
                });
            }
            else {
                if (result != null) {
                    onReject(result);
                }
                else {
                    onResolve();
                }
            }
        };
        FormStateProvider.prototype.submit = function (event) {
            var _this = this;
            if (event != null && event.preventDefault != null) {
                event.preventDefault();
            }
            this.setState({ isSubmitting: true });
            this.invoke(function () { return _this.props.submitHandler(_this.state.values, event); }, function () { return _this.endSubmitting(); }, function (reason) {
                _this.setErrors(reason, 'form');
                _this.endSubmitting();
            });
        };
        FormStateProvider.prototype.invokeValidator = function (name, newValue) {
            var _this = this;
            if (this.props.validators != null) {
                var validator_1 = this.props.validators[name];
                if (validator_1 != null) {
                    var validating_1 = immutable_1.Map(this.state.values).set(name, newValue).toJS();
                    this.invoke(function () { return validator_1(validating_1); }, function () { return _this.cancelError(name); }, function (reason) { return _this.setErrors(reason, name); });
                }
            }
        };
        FormStateProvider.prototype.change = function (name, value, validateConcurrently) {
            if (validateConcurrently === void 0) { validateConcurrently = true; }
            if (this.isDefinedName(name)) {
                this.setState(immutable_1.Map({}).set('values', immutable_1.Map(this.state.values).set(name, value)).toJS());
                if (validateConcurrently) {
                    this.invokeValidator(name, value);
                }
            }
        };
        FormStateProvider.prototype.validate = function (name) {
            if (this.isDefinedName(name)) {
                this.invokeValidator(name, this.state.values[name]);
            }
        };
        FormStateProvider.prototype.render = function () {
            var Component = Form;
            var props = immutable_1.Map(this.props)
                .delete('defaultValues').delete('submitHandler').delete('validators')
                .set('formValues', this.state.values)
                .set('formErrors', this.state.errors)
                .set('formHasError', this.hasError())
                .set('formIsPristine', this.isPristine())
                .set('formIsSubmitting', this.state.isSubmitting)
                .set('formCancelError', this.cancelError)
                .set('formReset', this.reset)
                .set('formSubmit', this.submit)
                .set('formChange', this.change)
                .set('formValidate', this.validate).toJS();
            return React.createElement(Component, props);
        };
        return FormStateProvider;
    }(React.Component));
}
exports.formStateProvider = formStateProvider;
//# sourceMappingURL=formStateProvider.js.map