import { memorizedAdaptor } from '../validatorAdaptors';
import { InputValidator } from '../types';

describe('memorizedAdaptor', () => {
    type State = { yourName: string, age: number };
    const values = { yourName: 'Mitsuha', age: 18 };

    test('sync', () => {
        const validator: InputValidator<State> = (name, newValue, values, inspector) => {
            inspector('test', name, newValue);
            return name === 'yourName' && (newValue == null || newValue === '') ? 'Error' : null;
        };
        const memorized = memorizedAdaptor<State>(validator);
        const inspector = jest.fn();
        expect(memorized('yourName', '', values, inspector)).toBe('Error');
        expect(inspector.mock.calls.length).toBe(1);
        expect(memorized('yourName', '', values, inspector)).toBe('Error');
        expect(memorized('yourName', '', values, inspector)).toBe('Error');
        expect(inspector.mock.calls.length).toBe(1); // <- reuse result.
        expect(memorized('yourName', 'Mitsuha', values, inspector)).toBeNull();
        expect(inspector.mock.calls.length).toBe(2);
        expect(memorized('yourName', 'Mitsuha', values, inspector)).toBeNull();
        expect(memorized('yourName', 'Mitsuha', values, inspector)).toBeNull();
        expect(inspector.mock.calls.length).toBe(2); // <- reuse result again.
    });

    test('async resolve', (done) => {
        const validator: InputValidator<State> = (name, newValue, values, inspector) => {
            inspector('test', name, newValue);
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 100));
        };
        const memorized = memorizedAdaptor<State>(validator);
        const inspector = jest.fn();
        const result = memorized('yourName', '', values, inspector);
        expect.assertions(5);
        (result as Promise<never>).then(
            () => {
                expect(inspector.mock.calls.length).toBe(1);
                expect(memorized('yourName', '', values, inspector)).toBeNull();
                // it is sync execution because of using memorized result.
                expect(inspector.mock.calls.length).toBe(1);
                expect(memorized('yourName', '', values, inspector)).toBeNull();
                expect(inspector.mock.calls.length).toBe(1);
                done();
            },
            () => {
                done();
            },
        );
    });

    test('async reject', (done) => {
        const validator: InputValidator<State> = (name, newValue, values, inspector) => {
            inspector('test', name, newValue);
            return new Promise((resolve, reject) => setTimeout(() => reject('Error'), 100));
        };
        const memorized = memorizedAdaptor<State>(validator);
        const inspector = jest.fn();
        const result = memorized('yourName', '', values, inspector);
        expect.assertions(5);
        (result as Promise<never>).then(
            () => {
                done();
            },
            () => {
                expect(inspector.mock.calls.length).toBe(1);
                expect(memorized('yourName', '', values, inspector)).toBe('Error');
                // it is sync execution because of using memorized result.
                expect(inspector.mock.calls.length).toBe(1);
                expect(memorized('yourName', '', values, inspector)).toBe('Error');
                expect(inspector.mock.calls.length).toBe(1);
                done();
            },
        );
    });
});
