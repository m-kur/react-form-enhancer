import * as React from 'react';
import { Map } from 'immutable';

import { FormErrors, HandlerResult, ProviderProps, FormValidator } from './types';
import { invokeHandler } from './handlerEngine';
import { isDefinedName, checkProviderProps } from './definitionChecker';

// API: FormStateProvider supplies below all properties.
export type FormProps<P> = {
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

export type FormComponent<P> = React.ComponentType<Partial<FormProps<P>>>;
export type ProviderComponent<P> = React.ComponentClass<ProviderProps<P>>;

// API: This HOC enhances your form component.
export function formStateProvider<P>(Form: FormComponent<P>): ProviderComponent<P> {
    type ProviderState = {
        values: P,
        errors: FormErrors<P>,
        isSubmitting: boolean,
    };
    type KeyValue = { [name: string]: any };

    return class FormStateProvider extends React.Component<ProviderProps<P>, ProviderState> {
        constructor(props: ProviderProps<P>) {
            super(props);
            this.state = { values: props.defaultValues, errors: {}, isSubmitting: false };
            this.change = this.change.bind(this);
            this.validate = this.validate.bind(this);
            this.submit = this.submit.bind(this);
            this.reset = this.reset.bind(this);
            checkProviderProps(props);
        }

        private canSetStateFromAsync: boolean = false;

        componentWillMount() {
            this.canSetStateFromAsync = true;
        }

        componentWillUnmount() {
            this.canSetStateFromAsync = false;
        }

        private isPristine(): boolean {
            for (const name of Object.keys(this.state.values)) {
                if ((this.state.values as KeyValue)[name] !== (this.props.defaultValues as KeyValue)[name]) {
                    return false;
                }
            }
            return true;
        }

        private hasError(): boolean {
            for (const name of Object.keys(this.state.errors)) {
                if ((this.state.errors as { [name: string]: string | null })[name] != null) {
                    return true;
                }
            }
            return false;
        }

        private updateErrors(errors: HandlerResult<P>, primaryName: string) {
            if (this.canSetStateFromAsync) {
                if (errors == null) {
                    if (primaryName === 'form') {
                        // submit -> resolve
                        this.setState({ errors: {} });
                    } else {
                        // invokeValidator -> resolve
                        this.setState(Map({}).set('errors', Map(this.state.errors).delete(primaryName)).toJS());
                    }
                } else if (typeof errors === 'string') {
                    // reject returns string
                    if (isDefinedName(this.props.defaultValues, primaryName, 'result of a validation', true)) {
                        this.setState(Map({}).set('errors', Map(this.state.errors).set(primaryName, errors)).toJS());
                    }
                } else {
                    // reject returns NOT string, maybe { [name: string]: string | null }
                    const sanitized = Object.keys(errors).reduce<Map<string, string | null>>(
                        (prior, name) => {
                            if (!isDefinedName(this.props.defaultValues, name, 'result of a validation')) {
                                return prior.delete(name);
                            }
                            const reason = (errors as KeyValue)[name];
                            if (reason != null) {
                                return prior.set(name, String(reason));
                            }
                            // don't delete an error whom value is null because of merging with this.state.errors.
                            return prior;
                        },
                        Map({}),
                    );
                    this.setState(Map({}).set('errors', Map(this.state.errors).merge(sanitized)).toJS());
                }
            }
        }

        private invokeValidator(name: string, newValue: any) {
            type Validators = { [name: string]: FormValidator<P> };
            if (this.props.validators != null) {
                const validator = (this.props.validators as Validators)[name];
                if (validator != null) {
                    const validating = Map(this.state.values).set(name, newValue).toJS();
                    invokeHandler(
                        name,
                        () => validator(validating),
                        () => this.updateErrors(null, name),
                        reason => this.updateErrors(reason, name),
                        this.props.inspector,
                    );
                }
            }
        }

        change(name: string, value: any, validateConcurrently: boolean = true) {
            if (isDefinedName(this.props.defaultValues, name, 'props.formChange')) {
                this.setState(Map({}).set('values', Map(this.state.values).set(name, value)).toJS());
                if (validateConcurrently) {
                    this.invokeValidator(name, value);
                }
            }
        }

        validate(name: string) {
            if (isDefinedName(this.props.defaultValues, name, 'props.formValidate')) {
                this.invokeValidator(name, (this.state.values as KeyValue)[name]);
            }
        }

        private endSubmitting() {
            if (this.canSetStateFromAsync) {
                this.setState({ isSubmitting: false });
            }
        }

        submit(event?: React.FormEvent<any>) {
            if (event != null && event.preventDefault != null) {
                event.preventDefault();
            }
            this.setState({ isSubmitting: true });
            invokeHandler(
                'form',
                () => this.props.submitHandler(this.state.values, event),
                () => {
                    this.updateErrors(null, 'form');
                    this.endSubmitting();
                },
                (reason) => {
                    this.updateErrors(reason, 'form');
                    this.endSubmitting();
                },
                this.props.inspector,
            );
        }

        reset() {
            this.setState({ isSubmitting: false, values: this.props.defaultValues, errors: {} });
        }

        render () {
            const Component = Form as React.ComponentClass<FormProps<P>>;
            const props = Map<string, any>(this.props)
                .delete('defaultValues').delete('submitHandler').delete('validators').delete('inspector')
                .set('formValues', this.state.values)
                .set('formErrors', this.state.errors)
                .set('formIsSubmitting', this.state.isSubmitting)
                .set('formIsPristine', this.isPristine())
                .set('formHasError', this.hasError())
                .set('formChange', this.change)
                .set('formValidate', this.validate)
                .set('formSubmit', this.submit)
                .set('formReset', this.reset)
                .toJS();
            return React.createElement<FormProps<P>>(Component, props);
        }
    };
}
