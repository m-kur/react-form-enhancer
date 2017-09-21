import { mergeErrors } from '../handlerEngine';

describe('handleEngine', () => {
    type State = { yourName: string, age: number };
    const definition = { age: 45, yourName: 'YOUR NAME?' };
    const oldErrors = { age: 'Negative', yourName: 'zzz' };

    test('mergeErrors, validation, null', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'yourName', null))
            .toEqual({ age: 'Negative' });
    });

    test('mergeErrors, validation, string', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'yourName', 'Error!'))
            .toEqual({ age: 'Negative', yourName: 'Error!' });
    });

    test('mergeErrors, submit, key-value', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'yourName', { yourName: 'Error!' }))
            .toEqual({ age: 'Negative', yourName: 'Error!' });
    });

    test('mergeErrors, submit, null', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'form', null))
            .toEqual({});
    });

    test('mergeErrors, submit, string', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'form', 'Error!'))
            .toEqual({ age: 'Negative', yourName: 'zzz', form: 'Error!' });
    });

    test('mergeErrors, submit, key-value', () => {
        expect(mergeErrors<State>(definition, oldErrors, 'form', { form: 'Error!' }))
            .toEqual({ age: 'Negative', yourName: 'zzz', form: 'Error!' });
    });

    test('mergeErrors, validation, sanitize', () => {
        const origin = console.error;
        const error = jest.fn();
        console.error = error;
        expect(mergeErrors<State>(definition, oldErrors, 'yourName', { nonPredefined: 'Error!' }))
            .toEqual({ age: 'Negative', yourName: 'zzz' });
        expect(error).toBeCalled();
        console.error = origin;
    });

});
