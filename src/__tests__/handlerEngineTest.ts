import { mergeErrors } from '../handlerEngine';

describe('handleEngine', () => {
    const definition = { yourName: 'YOUR NAME?', age: 45 };
    const oldErrors = { age: 'Negative', yourName: 'zzz' };

    test('mergeErrors, validation, null', () => {
        expect(mergeErrors(definition, oldErrors, 'yourName', null))
            .toEqual({ age: 'Negative' });
    });

    test('mergeErrors, validation, string', () => {
        expect(mergeErrors(definition, oldErrors, 'yourName', 'Error!'))
            .toEqual({ age: 'Negative', yourName: 'Error!' });
    });

    test('mergeErrors, submit, key-value', () => {
        expect(mergeErrors(definition, oldErrors, 'yourName', { yourName: 'Error!' }))
            .toEqual({ age: 'Negative', yourName: 'Error!' });
    });

    test('mergeErrors, submit, null', () => {
        expect(mergeErrors(definition, oldErrors, 'form', null))
            .toEqual({});
    });

    test('mergeErrors, submit, string', () => {
        expect(mergeErrors(definition, oldErrors, 'form', 'Error!'))
            .toEqual({ age: 'Negative', yourName: 'zzz', form: 'Error!' });
    });

    test('mergeErrors, submit, key-value', () => {
        expect(mergeErrors(definition, oldErrors, 'form', { form: 'Error!' }))
            .toEqual({ age: 'Negative', yourName: 'zzz', form: 'Error!' });
    });

    test('mergeErrors, validation, Error', () => {
        expect(mergeErrors(definition, oldErrors, 'yourName', new Error('Error!')))
            .toEqual({ age: 'Negative', yourName: 'Error!' });
    });

    test('mergeErrors, validation, sanitize', () => {
        const origin = console.error;
        const error = jest.fn();
        console.error = error;
        expect(mergeErrors(definition, oldErrors, 'yourName', { nonPredefined: 'Error!' }))
            .toEqual({ age: 'Negative', yourName: 'zzz' });
        expect(error).toBeCalled();
        console.error = origin;
    });

});
