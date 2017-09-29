"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var handlerEngine_1 = require("../handlerEngine");
describe('invokeHandler sync', function () {
    test('resolved', function () {
        var handle = jest.fn().mockReturnValueOnce(null);
        var resolve = jest.fn();
        var reject = jest.fn();
        var inspect = jest.fn();
        handlerEngine_1.invokeHandler('yourName', handle, resolve, reject, inspect);
        expect(handle.mock.calls.length).toBe(1);
        expect(resolve.mock.calls.length).toBe(1);
        expect(reject.mock.calls.length).toBe(0);
        expect(inspect.mock.calls[0]).toEqual(['handled', 'yourName']);
        expect(inspect.mock.calls[1]).toEqual(['resolved', 'yourName']);
    });
    test('rejected', function () {
        var handle = jest.fn().mockReturnValueOnce('Error');
        var resolve = jest.fn();
        var reject = jest.fn();
        var inspect = jest.fn();
        handlerEngine_1.invokeHandler('yourName', handle, resolve, reject, inspect);
        expect(handle.mock.calls.length).toBe(1);
        expect(resolve.mock.calls.length).toBe(0);
        expect(reject.mock.calls.length).toBe(1);
        expect(reject.mock.calls[0][0]).toBe('Error');
        expect(inspect.mock.calls[0]).toEqual(['handled', 'yourName']);
        expect(inspect.mock.calls[1]).toEqual(['rejected', 'yourName', 'Error']);
    });
});
describe('invokeHandler async', function () {
    test('resolved', function (done) {
        var handle = jest.fn().mockReturnValueOnce(new Promise(function (resolve, reject) { return setTimeout(function () { return resolve(); }, 100); }));
        var resolve = jest.fn();
        var reject = jest.fn();
        var inspect = jest.fn();
        var inspectDone = function (on, name, value) {
            inspect(on, name, value);
            if (on !== 'async-handled') {
                expect(handle.mock.calls.length).toBe(1);
                expect(resolve.mock.calls.length).toBe(1);
                expect(reject.mock.calls.length).toBe(0);
                expect(inspect.mock.calls[0]).toEqual(['async-handled', 'yourName', undefined]);
                expect(inspect.mock.calls[1]).toEqual(['async-resolved', 'yourName', undefined]);
                done();
            }
        };
        handlerEngine_1.invokeHandler('yourName', handle, resolve, reject, inspectDone);
    });
    test('rejected', function (done) {
        var handle = jest.fn().mockReturnValueOnce(new Promise(function (resolve, reject) { return setTimeout(function () { return reject('Error'); }, 100); }));
        var resolve = jest.fn();
        var reject = jest.fn();
        var inspect = jest.fn();
        var inspectDone = function (on, name, value) {
            inspect(on, name, value);
            if (on !== 'async-handled') {
                expect(handle.mock.calls.length).toBe(1);
                expect(resolve.mock.calls.length).toBe(0);
                expect(reject.mock.calls.length).toBe(1);
                expect(reject.mock.calls[0][0]).toBe('Error');
                expect(inspect.mock.calls[0]).toEqual(['async-handled', 'yourName', undefined]);
                expect(inspect.mock.calls[1]).toEqual(['async-rejected', 'yourName', 'Error']);
                done();
            }
        };
        handlerEngine_1.invokeHandler('yourName', handle, resolve, reject, inspectDone);
    });
});
describe('sanitizeErrors', function () {
    var definition = { age: 45, yourName: 'YOUR NAME?' };
    test('sanitize, predefined', function () {
        expect(handlerEngine_1.sanitizeErrors(definition, { age: 'Error!' }, false)).toEqual({ age: 'Error!' });
    });
    test('sanitize, non predefined', function () {
        var origin = console.error;
        var error = jest.fn();
        console.error = error;
        expect(handlerEngine_1.sanitizeErrors(definition, { nonPredefined: 'Error!' }, false)).toEqual({});
        expect(error).toBeCalled();
        console.error = origin;
    });
});
describe('mergeErrors', function () {
    var definition = { age: 45, yourName: 'YOUR NAME?' };
    var oldErrors = { age: 'Error!', yourName: 'zzz' };
    test('validation, null', function () {
        expect(handlerEngine_1.mergeErrors(definition, oldErrors, 'yourName', null)).toEqual({ age: 'Error!' });
    });
    test('validation, string', function () {
        expect(handlerEngine_1.mergeErrors(definition, oldErrors, 'yourName', 'Error!'))
            .toEqual({ age: 'Error!', yourName: 'Error!' });
    });
    test('submit, key-value', function () {
        expect(handlerEngine_1.mergeErrors(definition, oldErrors, 'yourName', { yourName: 'Error!' }))
            .toEqual({ age: 'Error!', yourName: 'Error!' });
    });
    test('submit, null', function () {
        expect(handlerEngine_1.mergeErrors(definition, oldErrors, 'form', null)).toEqual({});
    });
    test('submit, string', function () {
        expect(handlerEngine_1.mergeErrors(definition, oldErrors, 'form', 'Error!'))
            .toEqual({ age: 'Error!', yourName: 'zzz', form: 'Error!' });
    });
    test('submit, key-value', function () {
        expect(handlerEngine_1.mergeErrors(definition, oldErrors, 'form', { form: 'Error!' }))
            .toEqual({ age: 'Error!', yourName: 'zzz', form: 'Error!' });
    });
});
//# sourceMappingURL=handlerEngineTest.js.map