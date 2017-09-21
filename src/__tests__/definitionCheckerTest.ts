import { isDefinedName } from '../definitionChecker';

describe('isDefineName', () => {
    const definition = { age: 45, yourName: 'YOUR NAME?' };

    test('defined', () => {
        expect(isDefinedName(definition, 'yourName', 'test', false)).toBeTruthy();
    });

    test('not defined', () => {
        const origin = console.error;
        const error = jest.fn();
        console.error = error;
        expect(isDefinedName(definition, 'notPredefined', 'test', false)).toBeFalsy();
        expect(error).toBeCalled();
        console.error = origin;
    });
});
