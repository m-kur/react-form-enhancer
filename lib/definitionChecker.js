"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var PropTypes = require("prop-types");
function isDefinedName(definition, name, warnFor, form) {
    if (form === void 0) { form = false; }
    var defined = form && name === 'form' || definition.hasOwnProperty(name);
    if (!defined && warnFor != null && warnFor !== '') {
        if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
            console.error("Warning: '" + warnFor + "' accessed '" + name + "' which is a non-predefined name.");
        }
    }
    return defined;
}
exports.isDefinedName = isDefinedName;
function checkProviderProps(props) {
    if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
        PropTypes.checkPropTypes({
            defaultValues: PropTypes.object.isRequired,
            submitHandler: PropTypes.func.isRequired,
            validators: PropTypes.object,
            inspector: PropTypes.func,
        }, props, 'props', 'FormStateProvider');
        if (props.validators != null) {
            var checker = Object.keys(props.validators).reduce(function (prior, name) {
                if (isDefinedName(props.defaultValues, name, '')) {
                    return immutable_1.Map(prior).set(name, PropTypes.func).toJS();
                }
                console.error('Warning: The \`validators\` property of \`FormStateProvider\` ' +
                    ("has a validator named '" + name + "' without name in 'defaultValues'."));
                return prior;
            }, {});
            PropTypes.checkPropTypes(checker, props.validators, 'props.validators', 'FormStateProvider');
        }
    }
}
exports.checkProviderProps = checkProviderProps;
//# sourceMappingURL=definitionChecker.js.map