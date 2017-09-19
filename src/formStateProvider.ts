import * as React from 'react';
import { Map } from 'immutable';

export type FormErrors<P> = { [N in keyof P | 'form']?: string | null };
export type HandlerResult<P> = FormErrors<P> | string | null;

// API: the submitting interface for a form.
export interface SubmitHandler<P> {
    (values: P, event?: React.FormEvent<any>): Promise<HandlerResult<P>> | HandlerResult<P>;
}

// API: the validation interface for a form and inputs.
export interface FormValidator<P> {
    (values: Partial<P>): Promise<HandlerResult<P>> | HandlerResult<P>;
}

export type HandlerEvent = {
    name: string,
    type: 'handled' | 'resolved' | 'rejected';
    async: boolean,
};

export type ProviderProps<P> = {
    defaultValues: P,
    submitHandler: SubmitHandler<P>,
    validators?: { [N in keyof P]?: FormValidator<P> },
    inspector?: (e: HandlerEvent) => void;
};

// API: FormStateProvider supplies below all properties.
export type FormProps<P> = {
    formValues: P,
    formErrors: FormErrors<P>,
    formHasError: boolean,
    formIsPristine: boolean,
    formIsSubmitting: boolean,
    formCancelError: (name: string) => void,
    formReset: () => void,
    formSubmit: (event?: React.FormEvent<any>) => void,
    formChange: (name: string, value: any, validate?: boolean) => void,
    formValidate: (name: string) => void,
};

export type FormComponent<P> = React.ComponentType<Partial<FormProps<P>>>;
export type ProviderComponent<P> = React.ComponentClass<ProviderProps<P>>;

// API: This HOC enhances your form component.
export function formStateProvider<P>(Form: FormComponent<P>): ProviderComponent<P> {

    type ProviderState = {
        isSubmitting: boolean,
        values: P,
        errors: FormErrors<P>,
    };

    type Values = { [name: string]: any };
    type Errors = { [name: string]: string | null };
    type Validators = { [name: string]: FormValidator<P> };

    return class FormStateProvider extends React.Component<ProviderProps<P>, ProviderState> {
        constructor(props: ProviderProps<P>) {
            super(props);
            if (props.defaultValues == null) {
                throw new Error('"defaultValues" property isn\'t set.');
            }
            if (props.submitHandler == null) {
                throw new Error('"submitHandler" property isn\'t set.');
            }
            this.state = { isSubmitting: false, values: props.defaultValues, errors: {} };
            this.cancelError = this.cancelError.bind(this);
            this.reset = this.reset.bind(this);
            this.submit = this.submit.bind(this);
            this.change = this.change.bind(this);
            this.validate = this.validate.bind(this);
        }

        private canSetStateFromAsync: boolean = false;

        componentWillMount() {
            this.canSetStateFromAsync = true;
        }

        componentWillUnmount() {
            this.canSetStateFromAsync = false;
        }

        private isDefinedName(name: string): boolean {
            return name === 'form' || this.props.defaultValues.hasOwnProperty(name);
        }

        private setErrors(errors: HandlerResult<P>, primaryName: string) {
            if (this.canSetStateFromAsync && this.isDefinedName(primaryName)) {
                if (errors == null) {
                    if (primaryName === 'form') {
                        // submit -> resolve
                        this.setState({ errors: {} });
                    } else {
                        // invokeValidator -> resolve
                        this.cancelError(primaryName);
                    }
                } else if (typeof errors === 'string') {
                    // reject returns string
                    this.setState(Map({}).set('errors', Map(this.state.errors).set(primaryName, errors)).toJS());
                } else {
                    // reject returns NOT string, maybe { [name: string]: string | null }
                    const sanitized = Object.keys(errors).reduce<Map<string, any>>(
                        (result, name) => {
                            if (!this.isDefinedName(name)) {
                                return result.delete(name);
                            }
                            const reason: string | null = (errors as Errors)[name];
                            if (reason != null) {
                                return result.set(name, String(reason));
                            }
                            // don't delete an error whom value is null because of merging with this.state.errors.
                            return result;
                        },
                        Map<string, any>(errors),
                    );
                    this.setState(Map({}).set('errors', Map(this.state.errors).merge(sanitized)).toJS());
                }
            }
        }

        cancelError(name: string) {
            if (this.canSetStateFromAsync && this.isDefinedName(name)) {
                this.setState(Map({}).set('errors', Map(this.state.errors).delete(name)).toJS());
            }
        }

        private hasError(): boolean {
            for (const name of Object.keys(this.state.errors)) {
                if ((this.state.errors as { [name: string]: string | null })[name] != null) {
                    return true;
                }
            }
            return false;
        }

        private isPristine(): boolean {
            for (const name of Object.keys(this.state.values)) {
                if ((this.state.values as Values)[name] !== (this.props.defaultValues as Values)[name]) {
                    return false;
                }
            }
            return true;
        }

        reset() {
            this.setState({ isSubmitting: false, values: this.props.defaultValues, errors: {} });
        }

        private endSubmitting() {
            if (this.canSetStateFromAsync) {
                this.setState({ isSubmitting: false });
            }
        }

        private invoke(
            name: string,
            handler: () => Promise<HandlerResult<P>> | HandlerResult<P>,
            onResolve: () => void,
            onReject: (reason: HandlerResult<P>) => void,
        ) {
            const onHandled = (this.props.inspector != null) ? this.props.inspector : () => {};
            const result = handler();
            if (Promise.resolve<HandlerResult<P>>(result) === result) {
                onHandled({ name, type: 'handled', async: true });
                (result as Promise<HandlerResult<P>>).then(
                    () => {
                        onResolve();
                        onHandled({ name, type: 'resolved', async: true });
                    },
                    (reason) => {
                        // This component doesn't catch Error.
                        if (reason instanceof Error) throw reason;
                        onReject(reason);
                        onHandled({ name, type: 'rejected', async: true });
                    },
                );
            } else {
                onHandled({ name, type: 'handled', async: false });
                if (result != null) {
                    onReject(result as HandlerResult<P>);
                    onHandled({ name, type: 'rejected', async: false });
                } else {
                    onResolve();
                    onHandled({ name, type: 'resolved', async: false });
                }
            }
        }

        submit(event?: React.FormEvent<any>) {
            if (event != null && event.preventDefault != null) {
                event.preventDefault();
            }
            this.setState({ isSubmitting: true });
            this.invoke(
                'form',
                () => this.props.submitHandler(this.state.values, event),
                () => this.endSubmitting(),
                (reason) => {
                    this.setErrors(reason, 'form');
                    this.endSubmitting();
                },
            );
        }

        private invokeValidator(name: string, newValue: any) {
            if (this.props.validators != null) {
                const validator = (this.props.validators as Validators)[name];
                if (validator != null) {
                    const validating = Map(this.state.values).set(name, newValue).toJS();
                    this.invoke(
                        name,
                        () => validator(validating),
                        () => this.cancelError(name),
                        reason => this.setErrors(reason, name),
                    );
                }
            }
        }

        change(name: string, value: any, validateConcurrently: boolean = true) {
            if (this.isDefinedName(name)) {
                this.setState(Map({}).set('values', Map(this.state.values).set(name, value)).toJS());
                if (validateConcurrently) {
                    this.invokeValidator(name, value);
                }
            }
        }

        validate(name: string) {
            if (this.isDefinedName(name)) {
                this.invokeValidator(name, (this.state.values as Values)[name]);
            }
        }

        render () {
            const Component = Form as React.ComponentClass<FormProps<P>>;
            const props = Map<string, any>(this.props)
                .delete('defaultValues').delete('submitHandler').delete('validators')
                .set('formValues', this.state.values)
                .set('formErrors', this.state.errors)
                .set('formHasError', this.hasError())
                .set('formIsPristine', this.isPristine())
                .set('formIsSubmitting', this.state.isSubmitting)
                .set('formCancelError', this.cancelError)
                .set('formReset', this.reset)
                .set('formSubmit', this.submit)
                .set('formChange', this.change)
                .set('formValidate', this.validate).toJS();
            return React.createElement<FormProps<P>>(Component, props);
        }
    };
}
