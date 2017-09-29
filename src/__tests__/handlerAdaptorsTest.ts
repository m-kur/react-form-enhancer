import { memorizedAdaptor } from '../handlerAdaptors';
import { FormHandler } from '../types';

describe('memorizedAdaptor', () => {
    type State = { yourName: string, age: number };

    test('sync', () => {
        const validator: FormHandler<State> = (values, name, inspector) => {
            inspector('test', name, values);
            return name === 'yourName' && (values.yourName == null || values.yourName === '') ? 'Error' : null;
        };
        const memorized = memorizedAdaptor<State>(validator);
        const inspector = jest.fn();
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

    test('async resolve', (done) => {
        const validator: FormHandler<State> = (values, name, inspector) => {
            inspector('test', name, values);
            return new Promise((resolve, reject) => setTimeout(() => resolve(), 100));
        };
        const memorized = memorizedAdaptor<State>(validator);
        const inspector = jest.fn();
        const result = memorized({ yourName: 'Mitsuha', age: 18 }, 'yourName', inspector);
        expect.assertions(5);
        (result as Promise<never>).then(
            () => {
                expect(inspector.mock.calls.length).toBe(1);
                expect(memorized({ yourName: 'Mitsuha', age: 18 }, 'yourName', inspector)).toBeNull();
                // it is sync execution because of using memorized result.
                expect(inspector.mock.calls.length).toBe(1);
                expect(memorized({ yourName: 'Mitsuha', age: 18 }, 'yourName', inspector)).toBeNull();
                expect(inspector.mock.calls.length).toBe(1);
                done();
            },
            () => {
                done();
            },
        );
    });

    test('async reject', (done) => {
        const validator: FormHandler<State> = (values, name, inspector) => {
            inspector('test', name, values);
            return new Promise((resolve, reject) => setTimeout(() => reject('Error'), 100));
        };
        const memorized = memorizedAdaptor<State>(validator);
        const inspector = jest.fn();
        const result = memorized({ yourName: '', age: 18 }, 'yourName', inspector);
        expect.assertions(5);
        (result as Promise<never>).then(
            () => {
                done();
            },
            () => {
                expect(inspector.mock.calls.length).toBe(1);
                expect(memorized({ yourName: '', age: 18 }, 'yourName', inspector)).toBe('Error');
                // it is sync execution because of using memorized result.
                expect(inspector.mock.calls.length).toBe(1);
                expect(memorized({ yourName: '', age: 18 }, 'yourName', inspector)).toBe('Error');
                expect(inspector.mock.calls.length).toBe(1);
                done();
            },
        );
    });
});
