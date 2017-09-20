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
var handlerEngine_1 = require("./handlerEngine");
var definitionChecker_1 = require("./definitionChecker");
// API: This HOC enhances your form component.
function formStateProvider(Form) {
    return /** @class */ (function (_super) {
        __extends(FormStateProvider, _super);
        function FormStateProvider(props) {
            var _this = _super.call(this, props) || this;
            _this.canSetStateFromAsync = false;
            definitionChecker_1.checkProviderProps(props);
            var values = props.defaultValues != null ? props.defaultValues : {};
            _this.state = { values: values, errors: {}, isSubmitting: false };
            _this.change = _this.change.bind(_this);
            _this.validate = _this.validate.bind(_this);
            _this.submit = _this.submit.bind(_this);
            _this.reset = _this.reset.bind(_this);
            return _this;
        }
        FormStateProvider.prototype.componentWillMount = function () {
            this.canSetStateFromAsync = true;
        };
        FormStateProvider.prototype.componentWillUnmount = function () {
            this.canSetStateFromAsync = false;
        };
        FormStateProvider.prototype.isPristine = function () {
            for (var _i = 0, _a = Object.keys(this.state.values); _i < _a.length; _i++) {
                var name_1 = _a[_i];
                if (this.state.values[name_1] !== this.props.defaultValues[name_1]) {
                    return false;
                }
            }
            return true;
        };
        FormStateProvider.prototype.hasError = function () {
            for (var _i = 0, _a = Object.keys(this.state.errors); _i < _a.length; _i++) {
                var name_2 = _a[_i];
                if (this.state.errors[name_2] != null) {
                    return true;
                }
            }
            return false;
        };
        FormStateProvider.prototype.updateErrors = function (name, newErrors) {
            if (this.canSetStateFromAsync) {
                var errors = handlerEngine_1.mergeErrors(this.props.defaultValues, this.state.errors, name, newErrors);
                this.setState({ errors: errors });
            }
        };
        FormStateProvider.prototype.invokeValidator = function (name, newValue) {
            var _this = this;
            if (this.props.validators != null) {
                var validator_1 = this.props.validators[name];
                if (validator_1 != null) {
                    var newValues_1 = immutable_1.Map(this.state.values).set(name, newValue).toJS();
                    handlerEngine_1.invokeHandler(name, function () { return validator_1(newValues_1); }, function () { return _this.updateErrors(name, null); }, function (reason) { return _this.updateErrors(name, reason); }, this.props.inspector);
                }
            }
        };
        FormStateProvider.prototype.change = function (name, value, validateConcurrently) {
            if (validateConcurrently === void 0) { validateConcurrently = true; }
            if (definitionChecker_1.isDefinedName(this.props.defaultValues, name, 'props.formChange')) {
                this.setState(immutable_1.Map({}).set('values', immutable_1.Map(this.state.values).set(name, value)).toJS());
                if (validateConcurrently) {
                    this.invokeValidator(name, value);
                }
            }
        };
        FormStateProvider.prototype.validate = function (name) {
            if (definitionChecker_1.isDefinedName(this.props.defaultValues, name, 'props.formValidate')) {
                this.invokeValidator(name, this.state.values[name]);
            }
        };
        FormStateProvider.prototype.endSubmitting = function () {
            if (this.canSetStateFromAsync) {
                this.setState({ isSubmitting: false });
            }
        };
        FormStateProvider.prototype.submit = function (event) {
            var _this = this;
            if (event != null && event.preventDefault != null) {
                event.preventDefault();
            }
            this.setState({ isSubmitting: true });
            handlerEngine_1.invokeHandler('form', function () { return _this.props.submitHandler(_this.state.values, event); }, function () {
                _this.updateErrors('form', null);
                _this.endSubmitting();
            }, function (reason) {
                _this.updateErrors('form', reason);
                _this.endSubmitting();
            }, this.props.inspector);
        };
        FormStateProvider.prototype.reset = function () {
            if (this.canSetStateFromAsync) {
                this.setState({ values: this.props.defaultValues, errors: {}, isSubmitting: false });
            }
        };
        FormStateProvider.prototype.render = function () {
            var Component = Form;
            var props = immutable_1.Map(this.props)
                .delete('defaultValues').delete('submitHandler').delete('validators').delete('inspector')
                .set('formValues', this.state.values)
                .set('formErrors', this.state.errors)
                .set('formIsSubmitting', this.state.isSubmitting)
                .set('formIsPristine', this.isPristine())
                .set('formHasError', this.hasError())
                .set('formChange', this.change)
                .set('formValidate', this.validate)
                .set('formSubmit', this.submit)
                .set('formReset', this.reset).toJS();
            return React.createElement(Component, props);
        };
        return FormStateProvider;
    }(React.Component));
}
exports.formStateProvider = formStateProvider;
//# sourceMappingURL=formStateProvider.js.map