"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var handlerAdaptors_1 = require("../handlerAdaptors");
describe('memorizedAdaptor', function () {
    test('sync', function () {
        var validator = function (values, name, inspector) {
            inspector('test', name, values);
            return name === 'yourName' && (values.yourName == null || values.yourName === '') ? 'Error' : null;
        };
        var memorized = handlerAdaptors_1.memorizedAdaptor(validator);
        var inspector = jest.fn();
        expect(memorized({ yourName: '', age: 18 }, 'yourName', inspector)).toBe('Error');
        expect(inspector.mock.calls.length).toBe(1);
        expect(memorized({ yourName: '', age: 18 }, 'yourName', inspector)).toBe('Error');
        expect(memorized({ yourName: '', age: 18 }, 'yourName', inspector)).toBe('Error');
        expect(inspector.mock.calls.length).toBe(1); // <- reuse result.
        expect(memorized({ yourName: 'Mitsuha', age: 18 }, 'yourName', inspector)).toBeNull();
        expect(inspector.mock.calls.length).toBe(2);
        expect(memorized({ yourName: 'Mitsuha', age: 18 }, 'yourName', inspector)).toBeNull();
        expect(memorized({ yourName: 'Mitsuha', age: 18 }, 'yourName', inspector)).toBeNull();
        expect(inspector.mock.calls.length).toBe(2); // <- reuse result again.
    });
    test('async resolve', function (done) {
        var validator = function (values, name, inspector) {
            inspector('test', name, values);
            return new Promise(function (resolve, reject) { return setTimeout(function () { return resolve(); }, 100); });
        };
        var memorized = handlerAdaptors_1.memorizedAdaptor(validator);
        var inspector = jest.fn();
        var result = memorized({ yourName: 'Mitsuha', age: 18 }, 'yourName', inspector);
        expect.assertions(5);
        result.then(function () {
            expect(inspector.mock.calls.length).toBe(1);
            expect(memorized({ yourName: 'Mitsuha', age: 18 }, 'yourName', inspector)).toBeNull();
            // it is sync execution because of using memorized result.
            expect(inspector.mock.calls.length).toBe(1);
            expect(memorized({ yourName: 'Mitsuha', age: 18 }, 'yourName', inspector)).toBeNull();
            expect(inspector.mock.calls.length).toBe(1);
            done();
        }, function () {
            done();
        });
    });
    test('async reject', function (done) {
        var validator = function (values, name, inspector) {
            inspector('test', name, values);
            return new Promise(function (resolve, reject) { return setTimeout(function () { return reject('Error'); }, 100); });
        };
        var memorized = handlerAdaptors_1.memorizedAdaptor(validator);
        var inspector = jest.fn();
        var result = memorized({ yourName: '', age: 18 }, 'yourName', inspector);
        expect.assertions(5);
        result.then(function () {
            done();
        }, function () {
            expect(inspector.mock.calls.length).toBe(1);
            expect(memorized({ yourName: '', age: 18 }, 'yourName', inspector)).toBe('Error');
            // it is sync execution because of using memorized result.
            expect(inspector.mock.calls.length).toBe(1);
            expect(memorized({ yourName: '', age: 18 }, 'yourName', inspector)).toBe('Error');
            expect(inspector.mock.calls.length).toBe(1);
            done();
        });
    });
});
//# sourceMappingURL=handlerAdaptorsTest.js.map