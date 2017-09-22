import * as React from 'react';
import { mount } from 'enzyme';

import { Inspector } from '../types';
import { YourNameComponent } from './YourName';

describe('sync', () => {
    test('init, change, reset', () => {
        const form = mount(
            <YourNameComponent
                defaultValues={{ gently: false, yourName: 'Mitsuha', greeting: 'have' }}
                submitter={() => null}
            />);
        // init
        expect(form.state().values.gently).toBeFalsy();
        expect(form.state().values.yourName).toBe('Mitsuha');
        expect(form.state().values.greeting).toBe('have');
        expect(form.find('#0').props().checked).toBe(false);
        expect(form.find('#1').props().value).toBe('Mitsuha');
        expect(form.find('#3').props().value).toBe('have');
        // check
        form.find('#0').simulate('change', { target: { name: 'gently', type: 'checkbox', checked: true } });
        const state = form.state();
        expect(state.values.gently).toBeTruthy();
        expect(form.find('#0').props().checked).toBeTruthy();
        // change
        form.find('#1').simulate('change', { target: { name: 'yourName', value: 'Taki' } });
        form.find('#3').simulate('change', { target: { name: 'greeting', value: 'hello' } });
        expect(form.state().values.yourName).toBe('Taki');
        expect(form.state().values.greeting).toBe('hello');
        expect(form.find('#1').props().value).toBe('Taki');
        expect(form.find('#3').props().value).toBe('hello');
        // reset
        form.find('#6').simulate('click');
        expect(form.state().values).toEqual({ gently: false, yourName: 'Mitsuha', greeting: 'have' });
    });

    test('validator for yourName.onChange', () => {
        const validator = (name: string, newValue: any) => {
            if (name === 'yourName') {
                if (newValue == null || newValue === '') {
                    return 'Please tell me your name.';
                }
            }
            return null;
        };

        const form = mount(
            <YourNameComponent
                defaultValues={{ gently: false, yourName: 'Mitsuha', greeting: 'have' }}
                submitter={() => null}
                validators={validator}
            />);
        expect(form.state().errors).toEqual({});
        form.find('#1').simulate('change', { target: { name: 'yourName', value: '' } });
        expect(form.state().errors.yourName).toBe('Please tell me your name.');
        expect(form.find('#2').text()).toBe('Please tell me your name.');
        form.find('#0').simulate('change', { target: { name: 'gently', type: 'checkbox', checked: true } });
    });

    test('submit, but error(simple string)', () => {
        const submitter = jest.fn().mockReturnValue('Sorry, can\'t submit.');
        const form = mount(
            <YourNameComponent
                defaultValues={{ gently: false, yourName: 'Mitsuha', greeting: 'have' }}
                submitter={submitter}
            />);
        form.find('#1').simulate('change', { target: { name: 'yourName', value: 'Taki' } });
        form.find('#3').simulate('change', { target: { name: 'greeting', value: 'bye' } });
        form.find('form').simulate('submit');
        expect(submitter.mock.calls[0][0].gently).toBeFalsy();
        expect(submitter.mock.calls[0][0].yourName).toBe('Taki');
        expect(submitter.mock.calls[0][0].greeting).toBe('bye');
        expect(form.state().errors.form).toBe('Sorry, can\'t submit.');
        expect(form.find('#7').text()).toBe('Sorry, can\'t submit.');
    });
});

describe('async', () => {
    test('submitter rejects', (done) => {
        const submitter = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => setTimeout(
                () => reject('Sorry, can\'t submit.'),
                100,
            )),
        );
        const inspector: Inspector = (on, name, async) => {
            if (name === 'form') {
                if (on === 'async-rejected') {
                    expect(async).toBeTruthy();
                    expect(form.state().errors.form).toBe('Sorry, can\'t submit.');
                    done();
                } else if (on === 'async-resolved') {
                    done();
                }
            }
        };
        const form = mount(
            <YourNameComponent
                defaultValues={{ gently: false, yourName: 'Mitsuha', greeting: 'have' }}
                submitter={submitter}
                inspector={inspector}
            />);
        expect.assertions(2);
        form.find('form').simulate('submit');
    });

    test('validator rejects', (done) => {
        const validator = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => setTimeout(() => reject('Please tell me your name.'), 100)),
        );
        const inspector: Inspector = (on, name, async) => {
            if (name === 'yourName') {
                if (on === 'async-rejected') {
                    expect(async).toBeTruthy();
                    expect(form.state().errors.yourName).toBe('Please tell me your name.');
                    done();
                } else if (on === 'async-resolved') {
                    done();
                }
            }
        };
        const form = mount(
            <YourNameComponent
                defaultValues={{ gently: false, yourName: 'Mitsuha', greeting: 'have' }}
                submitter={() => null}
                validators={validator}
                inspector={inspector}
            />);
        expect.assertions(2);
        form.find('#1').simulate('change', { target: { name: 'yourName', value: '' } });
    });
});
