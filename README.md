# react-form-enhancer

This library enhances React form components with React's basic state and property.

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

## install

```
$ yarn add react-form-enhancer
```

## step 1: use properties which provided by "FormProps".  

Create React form component with properties of "FormProps". 
"FormProps" is supporting type to access to form's state-machine provided automatically, see below.

```JSX
// API
type FormErrors<P> = { [N in keyof P | 'form']?: string | null };
type WellknownElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type FormProps<P> = {
    formValues: P,
    formErrors: FormErrors<P>,
    formIsSubmitting: boolean,
    formIsPristine: boolean,
    formHasError: boolean,
    formChange: (name: string, value: any, validate?: boolean) => void,
    formValidate: (name: string) => void,
    formSubmit: (event?: React.FormEvent<any>) => void,
    formReset: () => void,
    formChangeOnChange: (e: React.ChangeEvent<WellknownElement>, validateConcurrently?: boolean) => void,
    formValidateOnFocus: (e: React.FocusEvent<WellknownElement>) => void,
};
```

The type parameter "P" is your form structure then component can get form's values via "formValues: P". Here we go!

```JSX
type FormState = { yourName: string };

// Simple and NOT magical.
class YourNameForm extends React.Component<FormProps<FormState>> {
    render() {
        return (
            <form onSubmit={this.props.formSubmit}>
                <input 
                    name="yourName"
                    type="text"
                    value={this.props.formValues.yourName}
                    onChange={this.props.formChangeOnChange}
                    onBlur={this.props.formValidateOnFocus}
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
```

"changeAdaptor" and "focusAdaptor" are only utility. They convert Events of DOM to arguments of formChange.

## step 2-a: create "FormStateProvider" and render it.

```JSX
// create a form state provider by HOC
const FormStateProvider = formStateProvider<FormState>(YourNameForm);

// submit handler, axios send values to your API server.
const submitter: FormSubmitter<FormState> = values => {
    if (values.yourName == null || values.yourName === '' || values.yourName === 'YOUR NAME?') {
        return 'Can\'t submit.';
    }
    return axios.post('/api', values, { timeout: 3000 }).then(
        () => null, // null means success.
        (reason: any) => ({ form: reason }),
    );    
}

// validation handler, set it to FormStateProvider's "validators" property 
const validator = (name: string, newValue: any) => {
    if (name === 'yourName') { 
        // Return a Promise object if you want to do async validation.
        // This sample returns string or null. It's a sync validation.
        if (newValue == null || newValue === '' || newValue === 'YOUR NAME?') {
            return 'Please tell me your name.';
        }
    }
    return null;
};

ReactDom.render(
    <FormStateProvider
        defaultValues={{ yourName: 'YOUR NAME?' }}
        submitter={submitter}
        validators={validator}
    />,
    document.getElementById('application'),
);
```

submitter and validators are implement below interfaces.

```JSX
type HandlerResult<P> = FormErrors<P> | string | null;

// the submitting interface for a form.
interface FormSubmitter<P> {
    (values: P, hasError: boolean, isPristine: boolean): Promise<never> | HandlerResult<P>;
}

// the validation interface for inputs.
interface InputValidator<P> {
    (name: string, newValue: any, currentValues: P): Promise<never> | HandlerResult<P>;
}
```

## step 2-b: redux application.

```JSX
// Redux from 'redux', ReactRedux from 'react-redux'.
const Connect = ReactRedux.connect(
    state => ({
        defaultValues: { yourName: state.yourName || 'YOUR NAME?' },
        validators: validator,
    }),
    (dispatch: Redux.Dispatch<any>) => ({
        submitter: values => dispatch({ type: 'SUBMIT', payload: values }),
    }),
)(formStateProvider<FormState>(YourNameForm));

ReactDom.render(
    <ReactRedux.Provider store={yourStore}>
        <Connect />
    </ReactRedux.Provider>
    document.getElementById('application'),
);
```
