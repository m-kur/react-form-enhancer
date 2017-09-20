import * as React from 'react';
import { mount } from 'enzyme';

import { HandlerEvent } from '../types';
import { formStateProvider } from '../formStateProvider';
import { YourNameForm, FormState } from './YourNameForm';

describe('FormStateProvider', () => {
    const FormStateProvider = formStateProvider<FormState>(YourNameForm);

    test('init, change, reset', () => {
        const form = mount(
            <FormStateProvider
                submitHandler={() => null}
                defaultValues={{ gently: false, yourName: 'Mitsuha', greeting: 'have' }}
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
        const validators = {
            yourName: (values: Partial<FormState>) => {
                if (values.yourName == null || values.yourName === '') {
                    return 'Please tell me your name.';
                }
                return null;
            },
        };
        const form = mount(
            <FormStateProvider
                submitHandler={() => null}
                defaultValues={{ gently: false, yourName: 'Mitsuha', greeting: 'have' }}
                validators={validators}
            />);
        expect(form.state().errors).toEqual({});
        form.find('#1').simulate('change', { target: { name: 'yourName', value: '' } });
        expect(form.state().errors.yourName).toBe('Please tell me your name.');
        expect(form.find('#2').text()).toBe('Please tell me your name.');
        form.find('#0').simulate('change', { target: { name: 'gently', type: 'checkbox', checked: true } });
    });

    test('submit, but error(simple string)', () => {
        const submitHandler = jest.fn().mockReturnValue('Sorry, can\'t submit.');
        const form = mount(
            <FormStateProvider
                submitHandler={submitHandler}
                defaultValues={{ gently: false, yourName: 'Mitsuha', greeting: 'have' }}
            />);
        form.find('#1').simulate('change', { target: { name: 'yourName', value: 'Taki' } });
        form.find('#3').simulate('change', { target: { name: 'greeting', value: 'bye' } });
        form.find('form').simulate('submit');
        expect(submitHandler.mock.calls[0][0].gently).toBeFalsy();
        expect(submitHandler.mock.calls[0][0].yourName).toBe('Taki');
        expect(submitHandler.mock.calls[0][0].greeting).toBe('bye');
        expect(form.state().errors.form).toBe('Sorry, can\'t submit.');
        expect(form.find('#7').text()).toBe('Sorry, can\'t submit.');
    });

    test('async submitHandler rejects', (done) => {
        const submitHandler = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => setTimeout(
                () => reject('Sorry, can\'t submit.'),
                100,
            )),
        );
        const inspector = (e: HandlerEvent) => {
            if (e.name === 'form') {
                if (e.type === 'rejected') {
                    expect(e.async).toBeTruthy();
                    expect(form.state().errors.form).toBe('Sorry, can\'t submit.');
                    done();
                } else if (e.type === 'resolved') {
                    done();
                }
            }
        };
        const form = mount(
            <FormStateProvider
                submitHandler={submitHandler}
                defaultValues={{ gently: false, yourName: 'Mitsuha', greeting: 'have' }}
                inspector={inspector}
            />);
        expect.assertions(2);
        form.find('form').simulate('submit');
    });

    test('async validator rejects', (done) => {
        const validators = {
            yourName: jest.fn().mockReturnValue(
                new Promise((resolve, reject) => setTimeout(
                    () => reject('Please tell me your name.'),
                    100,
                )),
            ),
        };
        const inspector = (e: HandlerEvent) => {
            if (e.name === 'yourName') {
                if (e.type === 'rejected') {
                    expect(e.async).toBeTruthy();
                    expect(form.state().errors.yourName).toBe('Please tell me your name.');
                    done();
                } else if (e.type === 'resolved') {
                    done();
                }
            }
        };
        const form = mount(
            <FormStateProvider
                submitHandler={() => null}
                defaultValues={{ gently: false, yourName: 'Mitsuha', greeting: 'have' }}
                validators={validators}
                inspector={inspector}
            />);
        expect.assertions(2);
        form.find('#1').simulate('change', { target: { name: 'yourName', value: '' } });
    });
});
