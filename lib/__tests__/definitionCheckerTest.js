"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitionChecker_1 = require("../definitionChecker");
describe('isDefineName', function () {
    var definition = { age: 45, yourName: 'YOUR NAME?' };
    test('defined', function () {
        expect(definitionChecker_1.isDefinedName(definition, 'yourName', 'test', false)).toBeTruthy();
    });
    test('not defined', function () {
        var origin = console.error;
        var error = jest.fn();
        console.error = error;
        expect(definitionChecker_1.isDefinedName(definition, 'notPredefined', 'test', false)).toBeFalsy();
        expect(error).toBeCalled();
        console.error = origin;
    });
});
//# sourceMappingURL=definitionCheckerTest.js.map