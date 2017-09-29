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
var formStateProvider_1 = require("../formStateProvider");
var YourNameForm = /** @class */ (function (_super) {
    __extends(YourNameForm, _super);
    function YourNameForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    YourNameForm.prototype.render = function () {
        return (React.createElement("form", { onSubmit: this.props.formSubmit },
            React.createElement("input", { id: "zero", name: "gently", type: "checkbox", checked: this.props.formValues.gently, onChange: this.props.formOnChange }),
            React.createElement("input", { id: "one", name: "yourName", type: "text", value: this.props.formValues.yourName, onChange: this.props.formOnChange, onBlur: this.props.formOnValidate }),
            React.createElement("div", { id: "two" }, this.props.formErrors.yourName),
            React.createElement("select", { id: "three", name: "greeting", value: this.props.formValues.greeting, onChange: this.props.formOnChange },
                React.createElement("option", { value: "hello" }, "hello!"),
                React.createElement("option", { value: "bye" }, "bye."),
                React.createElement("option", { value: "how" }, "how are you?"),
                React.createElement("option", { value: "have" }, "have a good day."),
                React.createElement("option", { value: "4x" }, "FxxK!")),
            React.createElement("div", { id: "four" }, this.props.formErrors.greeting),
            React.createElement("input", { id: "five", type: "submit", disabled: this.props.formIsSubmitting || this.props.formHasError }),
            React.createElement("input", { id: "six", type: "button", onClick: this.props.formReset }),
            React.createElement("div", { id: "seven" }, this.props.formErrors.form)));
    };
    return YourNameForm;
}(React.Component));
exports.YourNameForm = YourNameForm;
exports.YourNameComponent = formStateProvider_1.formStateProvider(YourNameForm);
//# sourceMappingURL=YourName.js.map