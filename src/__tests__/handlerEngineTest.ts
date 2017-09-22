import { Inspector } from '../types';
import { invokeHandler, sanitizeErrors, mergeErrors } from '../handlerEngine';

describe('invokeHandler sync', () => {
    type State = { yourName: string, age: number };

    test('resolved', () => {
        const handle = jest.fn().mockReturnValueOnce(null);
        const resolve = jest.fn();
        const reject = jest.fn();
        const inspect = jest.fn();
        invokeHandler<State>('yourName', handle, resolve, reject, inspect);
        expect(handle.mock.calls.length).toBe(1);
        expect(resolve.mock.calls.length).toBe(1);
        expect(reject.mock.calls.length).toBe(0);
        expect(inspect.mock.calls[0]).toEqual(['handled', 'yourName', false]);
        expect(inspect.mock.calls[1]).toEqual(['resolved', 'yourName', false]);
    });

    test('rejected', () => {
        const handle = jest.fn().mockReturnValueOnce('Error');
        const resolve = jest.fn();
        const reject = jest.fn();
        const inspect = jest.fn();
        invokeHandler<State>('yourName', handle, resolve, reject, inspect);
        expect(handle.mock.calls.length).toBe(1);
        expect(resolve.mock.calls.length).toBe(0);
        expect(reject.mock.calls.length).toBe(1);
        expect(reject.mock.calls[0][0]).toBe('Error');
        expect(inspect.mock.calls[0]).toEqual(['handled', 'yourName', false]);
        expect(inspect.mock.calls[1]).toEqual(['rejected', 'yourName', false]);
    });
});

describe('invokeHandler async', () => {
    type State = { yourName: string, age: number };

    test('resolved', (done) => {
        const handle = jest.fn().mockReturnValueOnce(
            new Promise((resolve, reject) => setTimeout(() => resolve(), 100)),
        );
        const resolve = jest.fn();
        const reject = jest.fn();
        const inspect = jest.fn();
        const inspectDone: Inspector = (on, name, value) => {
            inspect(on, name, value);
            if (on !== 'handled') {
                expect(handle.mock.calls.length).toBe(1);
                expect(resolve.mock.calls.length).toBe(1);
                expect(reject.mock.calls.length).toBe(0);
                expect(inspect.mock.calls[0]).toEqual(['handled', 'yourName', true]);
                expect(inspect.mock.calls[1]).toEqual(['resolved', 'yourName', true]);
                done();
            }
        };
        invokeHandler<State>('yourName', handle, resolve, reject, inspectDone);
    });

    test('rejected', (done) => {
        const handle = jest.fn().mockReturnValueOnce(
            new Promise((resolve, reject) => setTimeout(() => reject('Error'), 100)),
        );
        const resolve = jest.fn();
        const reject = jest.fn();
        const inspect = jest.fn();
        const inspectDone: Inspector = (on, name, value) => {
            inspect(on, name, value);
            if (on !== 'handled') {
                expect(handle.mock.calls.length).toBe(1);
                expect(resolve.mock.calls.length).toBe(0);
                expect(reject.mock.calls.length).toBe(1);
                expect(reject.mock.calls[0][0]).toBe('Error');
                expect(inspect.mock.calls[0]).toEqual(['handled', 'yourName', true]);
                expect(inspect.mock.calls[1]).toEqual(['rejected', 'yourName', true]);
                done();
            }
        };
        invokeHandler<State>('yourName', handle, resolve, reject, inspectDone);
    });
});

describe('sanitizeErrors', () => {
    type State = { yourName: string, age: number };
    const definition = { age: 45, yourName: 'YOUR NAME?' };

    test('sanitize, predefined', () => {
        expect(sanitizeErrors<State>(definition, { age: 'Error!' }, false)).toEqual({ age: 'Error!' });
    });

    test('sanitize, non predefined', () => {
        const origin = console.error;
        const error = jest.fn();
        console.error = error;
        expect(sanitizeErrors<State>(definition, { nonPredefined: 'Error!' }, false)).toEqual({});
        expect(error).toBeCalled();
        console.error = origin;
    });
});

describe('mergeErrors', () => {
    type State = { yourName: string, age: number };
    const definition = { age: 45, yourName: 'YOUR NAME?' };
    const oldErrors = { age: 'Error!', yourName: 'zzz' };

    test('validation, null', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'yourName', null)).toEqual({ age: 'Error!' });
    });

    test('validation, string', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'yourName', 'Error!'))
            .toEqual({ age: 'Error!', yourName: 'Error!' });
    });

    test('submit, key-value', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'yourName', { yourName: 'Error!' }))
            .toEqual({ age: 'Error!', yourName: 'Error!' });
    });

    test('submit, null', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'form', null)).toEqual({});
    });

    test('submit, string', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'form', 'Error!'))
            .toEqual({ age: 'Error!', yourName: 'zzz', form: 'Error!' });
    });

    test('submit, key-value', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'form', { form: 'Error!' }))
            .toEqual({ age: 'Error!', yourName: 'zzz', form: 'Error!' });
    });
});

