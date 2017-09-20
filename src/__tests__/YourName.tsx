import * as React from 'react';

import { SubmitHandler, FormValidator } from '../types'; // for TS4023.
import { FormProps, formStateProvider } from '../formStateProvider';
import { focusAdaptor, changeAdaptor } from '../eventAdaptors';

export type YourNameState = {
    gently: boolean,
    yourName: string,
    greeting: string,
};

export class YourNameForm extends React.Component<FormProps<YourNameState>> {
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
                    name="yourName"
                    type="text"
                    value={this.props.formValues.yourName}
                    onChange={onChange}
                    onBlur={focusAdaptor(this.props.formValidate)}
                />
                <div id="2">{this.props.formErrors.yourName}</div>
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

export const YourNameComponent = formStateProvider<YourNameState>(YourNameForm);
