import * as React from 'react';

import { FormHandler, Inspector } from '../types'; // for TS4023.
import { FormProps, formStateProvider } from '../formStateProvider';
import { FormPropsEx } from '../eventAdaptors';

export type YourNameState = {
    gently: boolean,
    yourName: string,
    greeting: string,
};

export class YourNameForm extends React.Component<FormProps<YourNameState> & FormPropsEx> {
    render() {
        return (
            <form onSubmit={this.props.formSubmit}>
                <input
                    id="zero"
                    name="gently"
                    type="checkbox"
                    checked={this.props.formValues.gently}
                    onChange={this.props.formOnChange}
                />
                <input
                    id="one"
                    name="yourName"
                    type="text"
                    value={this.props.formValues.yourName}
                    onChange={this.props.formOnChange}
                    onBlur={this.props.formOnValidate}
                />
                <div id="two">{this.props.formErrors.yourName}</div>
                <select
                    id="three"
                    name="greeting"
                    value={this.props.formValues.greeting}
                    onChange={this.props.formOnChange}
                >
                    <option value="hello">hello!</option>
                    <option value="bye">bye.</option>
                    <option value="how">how are you?</option>
                    <option value="have">have a good day.</option>
                    <option value="4x">FxxK!</option>
                </select>
                <div id="four">{this.props.formErrors.greeting}</div>
                <input
                    id="five"
                    type="submit"
                    disabled={this.props.formIsSubmitting || this.props.formHasError}
                />
                <input
                    id="six"
                    type="button"
                    onClick={this.props.formReset}
                />
                <div id="seven">{this.props.formErrors.form}</div>
            </form>
        );
    }
}

export const YourNameComponent = formStateProvider<YourNameState>(YourNameForm);
