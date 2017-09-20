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

## install

Sorry, npm in not yet.

```
$ yarn add https://github.com/masataka-kurihara/react-form-enhancer.git
```

## step 1: use properties which provided by "FormProps".  

Create React form component with properties of "FormProps". 
"FormProps" is support type for accessing to form's state-machine provided automatically, see below.

```JSX
// API
type FormErrors<P> = { [N in keyof P | 'form']?: string | null };
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
};
```

The type parameter "P" is your form structure then component can get form's values via "formValues: P". Here we go!

```JSX
type FormState = { yourName: string };

class YourNameForm extends React.Component<FormProps<FormState>> {
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
```

"changeAdaptor" and "focusAdaptor" are only utility. They convert Events of DOM to arguments of formChange.

## step 2-a: create "FormStateProvider" and render it.

```JSX
// create a form state provider by HOC
const FormStateProvider = formStateProvider<FormState>(YourNameForm);

// validation handler, set it to FormStateProvider's "validators" property 
const validators = {
    yourName: (values: FormState) => {
        // Return a Promise object if you want to do async validation.
        // This sample returns string or null. It's a sync validation.
        if (!values.yourName || values.yourName === 'YOUR NAME?') {
            return 'Please tell me your name.';
        }
        return null;
    },
};

// submit handler, axios send values to your API server.
const handler: SubmitHandler<FormState> = values => {
    if (!values.yourName || values.yourName === 'YOUR NAME?') {
        return 'Can\'t submit.';
    }
    return axios.post('/api', values, { timeout: 3000 }).then(
        () => null, // null means success.
        (reason: any) => ({ form: String(reason) }),
    );    
}

ReactDom.render(
    <FormStateProvider
        submitHandler={handler}
        defaultValues={{ yourName: 'YOUR NAME?' }}
        validators={validators}
    />,
    document.getElementById('application'),
);
```

## step 2-b: redux application.

```JSX
// Redux from 'redux', ReactRedux from 'react-redux'.
const Connect = ReactRedux.connect(
    state => ({
        defaultValues: { yourName: state.yourName || 'YOUR NAME?' },
        validators: validators,
    }),
    (dispatch: Redux.Dispatch<any>) => ({
        handleSubmit: values => dispatch({ type: 'SUBMIT', payload: values }),
    }),
)(formStateProvider<FormState>(YourNameForm));

ReactDom.render(
    <ReactRedux.Provider store={yourStore}>
        <Connect />
    </ReactRedux.Provider>
    document.getElementById('application'),
);
```
