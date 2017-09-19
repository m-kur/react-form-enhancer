import * as React from 'react';
import { mount } from 'enzyme';

import { formStateProvider, FormProps } from '../formStateProvider';
import {  focusAdaptor, changeAdaptor } from '../eventAdaptors';

describe('FormStateProvider', () => {
    type FormState = { gently: boolean, you: string, greeting: string };

    class TargetForm extends React.Component<FormProps<FormState>> {
        render() {
            const onChange = changeAdaptor(this.props.formChange);
            return (
                <form onSubmit={this.props.formSubmit}>
                    <input
                        id="0"
                        name="gently"
                        type="checkbox"
                        checked={this.props.formValues.gently}
                        onChange={onChange}
                    />
                    <input
                        id="1"
                        name="you"
                        type="text"
                        value={this.props.formValues.you}
                        onChange={onChange}
                        onBlur={focusAdaptor(this.props.formValidate)}
                    />
                    <div id="2">{this.props.formErrors.you}</div>
                    <select
                        id="3"
                        name="greeting"
                        value={this.props.formValues.greeting}
                        onChange={onChange}
                    >
                        <option value="hello">hello!</option>
                        <option value="bye">bye.</option>
                        <option value="how">how are you?</option>
                        <option value="have">have a good day.</option>
                        <option value="4x">FxxK!</option>
                    </select>
                    <div id="4">{this.props.formErrors.greeting}</div>
                    <input
                        id="5"
                        type="submit"
                        disabled={this.props.formIsSubmitting || this.props.formHasError}
                    />
                    <input
                        id="6"
                        type="button"
                        onClick={this.props.formReset}
                    />
                    <div id="7">{this.props.formErrors.form}</div>
                </form>
            );
        }
    }
    const FormStateProvider = formStateProvider<FormState>(TargetForm);

    test('init, change, reset', () => {
        const form = mount(
            <FormStateProvider
                submitHandler={() => null}
                defaultValues={{ gently: false, you: 'YOU', greeting: 'have' }}
            />);
        // init
        expect(form.state().values.gently).toBeFalsy();
        expect(form.state().values.you).toBe('YOU');
        expect(form.state().values.greeting).toBe('have');
        expect(form.find('#0').props().checked).toBe(false);
        expect(form.find('#1').props().value).toBe('YOU');
        expect(form.find('#3').props().value).toBe('have');
        // check
        form.find('#0').simulate('change', { target: { name: 'gently', type: 'checkbox', checked: true } });
        const state = form.state();
        expect(state.values.gently).toBeTruthy();
        expect(form.find('#0').props().checked).toBeTruthy();
        // change
        form.find('#1').simulate('change', { target: { name: 'you', value: 'Jack' } });
        form.find('#3').simulate('change', { target: { name: 'greeting', value: 'hello' } });
        expect(form.state().values.you).toBe('Jack');
        expect(form.state().values.greeting).toBe('hello');
        expect(form.find('#1').props().value).toBe('Jack');
        expect(form.find('#3').props().value).toBe('hello');
        // reset
        form.find('#6').simulate('click');
        expect(form.state().values).toEqual({ gently: false, you: 'YOU', greeting: 'have' });
    });

    test('validator for you.onChange', () => {
        const validators = {
            you: (values: FormState) => {
                if (!values.you) {
                    return 'Please tell me your name.';
                }
                return null;
            },
        };
        const form = mount(
            <FormStateProvider
                submitHandler={() => null}
                defaultValues={{ gently: false, you: 'YOU', greeting: 'have' }}
                validators={validators}
            />);
        expect(form.state().errors).toEqual({});
        form.find('#1').simulate('change', { target: { name: 'you', value: '' } });
        expect(form.state().errors.you).toBe('Please tell me your name.');
        expect(form.find('#2').text()).toBe('Please tell me your name.');
        form.find('#0').simulate('change', { target: { name: 'gently', type: 'checkbox', checked: true } });
    });

    test('submit, but error(simple string)', () => {
        const submitHandler = jest.fn().mockReturnValue('Sorry, can\'t submit.');
        const form = mount(
            <FormStateProvider
                submitHandler={submitHandler}
                defaultValues={{ gently: false, you: 'YOU', greeting: 'have' }}
            />);
        form.find('#1').simulate('change', { target: { name: 'you', value: 'Jack' } });
        form.find('#3').simulate('change', { target: { name: 'greeting', value: 'bye' } });
        form.find('form').simulate('submit');
        expect(submitHandler.mock.calls[0][0].gently).toBeFalsy();
        expect(submitHandler.mock.calls[0][0].you).toBe('Jack');
        expect(submitHandler.mock.calls[0][0].greeting).toBe('bye');
        expect(form.state().errors.form).toBe('Sorry, can\'t submit.');
        expect(form.find('#7').text()).toBe('Sorry, can\'t submit.');
    });
});
