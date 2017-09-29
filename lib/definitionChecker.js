"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isDefinedName(definition, name, warnFor, isForm) {
    if (isForm === void 0) { isForm = false; }
    var defined = isForm && name === 'form' || definition.hasOwnProperty(name);
    if (!defined && warnFor !== '') {
        if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
            console.error("Warning: '" + warnFor + "' accessed '" + name + "' which is a non-predefined name.");
        }
    }
    return defined;
}
exports.isDefinedName = isDefinedName;
//# sourceMappingURL=definitionChecker.js.map