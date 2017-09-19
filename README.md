# react-form-enhancer

This library enhances React form applications with React's basic state and property.

## motivation

Recently we are developing React application in combination with Redux.
we can quickly create simple and flexible UI with React and connect it with "react-redux" 
with the data structure of Redux which was tested well on a standalone basis.

If we develop in the same way in some way, some disturbance will arise.

- Should Redux manage UI local data including form's temporal state? Is it a little exaggerated?
- I'd like to do many tests using Jest and Enzyme enough to draw the headless.
- I want to write in TypeScript.

## solution

- This library uses React component's state and property simply.
- I think this library make tests for forms easy. Please see ./src/\_\_tests\_\_/*Test.tsx
- Yes, TypeScript, and this library supports Promise. You can write in both way, sync or async.

## sample

```JSX
// yourName.tsx
import * as React from 'react';
import { connect } from 'react-redux';
import { FormProps, formStateProvider, changeAdaptor, focusAdaptor } from 'react-form-enhancer';

type FormState = { yourName: string };

class TargetForm extends React.Component<FormProps<FormState>> {
    render() {
        return (
            <form onSubmit={this.props.formSubmit}>
                <input 
                    name="yourName"
                    type="text"
                    value={this.props.formValues.yourName}
                    onChange={changeAdaptor(this.props.formChange)}
                    onBlur={focusAdaptor(this.props.formValidate)}
                />
                <div>{this.props.formErrors.yourName}</div>
                <input
                    value="OK"
                    type="submit"
                    disabled={this.props.formIsSubmitting || this.props.formHasError}
                />
                <input
                    value="Clear"
                    type="button"
                    onClick={this.props.formReset}
                />
                <div>{this.props.formErrors.form}</div>
            </form>
        );
    }
}

// create a form state provider by HOC
export const FormStateProvider = formStateProvider<FormState>(TargetForm);

// validation handler, set it to FormStateProvider's "validators" property 
export const validators = {
    yourName: (values: FormState) => {
        // Return a Promise object if you want to do async validation.
        // This sample returns string or null. It's a sync validation.
        if (!values.yourName || values.yourName === 'YOUR NAME?') {
            return 'Please tell me your name.';
        }
        return null;
    },
};
```

```JSX
// usage #1: stand alone
import axios from 'axios';
import { FormStateProvider, validators } from './yourName';

const handler: SubmitHandler<FormState> = values => {
    if (!values.yourName || values.yourName === 'YOUR NAME?') {
        return 'Can\'t submit.';
    }
    return axios.post('/api', values, { timeout: 3000 }).then(
        () => null,
        (reason: any) => ({ form: String(reason) }),
    );    
}

export default function () => (
    <FormStateProvider
        submitHandler={handler}
        defaultValues={{ yourName: 'YOUR NAME?' }}
        validators={validators}
    />);
);
```

```JSX
// usage #2: connect by 'react-redux'
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { FormStateProvider, validators } from './yourName';

export default connect(
    state => ({
        ...state,
        defaultValues: { yourName: state.yourName || 'YOUR NAME?' },
        validators: validators,
    }),
    (dispatch: Dispatch<any>) => {
        return { handleSubmit: values => dispatch({ type: 'SUBMIT', payload: values })) };
    },
)(FormStateProvider);
```
