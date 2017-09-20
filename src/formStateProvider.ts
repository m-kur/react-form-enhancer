import * as React from 'react';
import { Map } from 'immutable';

import { FormErrors, HandlerResult, ProviderProps, FormValidator } from './types';
import { KeyValue } from './utils';
import { invokeHandler, mergeErrors } from './handlerEngine';
import { isDefinedName, checkProviderProps } from './definitionChecker';

// API: FormStateProvider supplies all below properties.
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

    return class FormStateProvider extends React.Component<ProviderProps<P>, ProviderState> {
        constructor(props: ProviderProps<P>) {
            super(props);
            checkProviderProps(props);
            const values = props.defaultValues != null ? props.defaultValues : {} as P;
            this.state = { values, errors: {}, isSubmitting: false };
            this.change = this.change.bind(this);
            this.validate = this.validate.bind(this);
            this.submit = this.submit.bind(this);
            this.reset = this.reset.bind(this);
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
                if ((this.state.errors as KeyValue)[name] != null) {
                    return true;
                }
            }
            return false;
        }

        private updateErrors(name: string, newErrors: HandlerResult<P>) {
            if (this.canSetStateFromAsync) {
                const errors = mergeErrors(this.props.defaultValues, this.state.errors, name, newErrors);
                this.setState({ errors: (errors as FormErrors<P>) });
            }
        }

        private invokeValidator(name: string, newValue: any) {
            type Validators = { [name: string]: FormValidator<P> };
            if (this.props.validators != null) {
                const validator = (this.props.validators as Validators)[name];
                if (validator != null) {
                    const newValues = Map(this.state.values).set(name, newValue).toJS();
                    invokeHandler(
                        name,
                        () => validator(newValues),
                        () => this.updateErrors(name, null),
                        reason => this.updateErrors(name, reason),
                        this.props.inspector,
                    );
                }
            }
        }

        private change(name: string, value: any, validateConcurrently: boolean = true) {
            if (isDefinedName(this.props.defaultValues, name, 'props.formChange')) {
                this.setState(Map({}).set('values', Map(this.state.values).set(name, value)).toJS());
                if (validateConcurrently) {
                    this.invokeValidator(name, value);
                }
            }
        }

        private validate(name: string) {
            if (isDefinedName(this.props.defaultValues, name, 'props.formValidate')) {
                this.invokeValidator(name, (this.state.values as KeyValue)[name]);
            }
        }

        private endSubmitting() {
            if (this.canSetStateFromAsync) {
                this.setState({ isSubmitting: false });
            }
        }

        private submit(event?: React.FormEvent<any>) {
            if (event != null && event.preventDefault != null) {
                event.preventDefault();
            }
            this.setState({ isSubmitting: true });
            invokeHandler(
                'form',
                () => this.props.submitHandler(this.state.values, event),
                () => {
                    this.updateErrors('form', null);
                    this.endSubmitting();
                },
                (reason) => {
                    this.updateErrors('form', reason);
                    this.endSubmitting();
                },
                this.props.inspector,
            );
        }

        private reset() {
            if (this.canSetStateFromAsync) {
                this.setState({ values: this.props.defaultValues, errors: {}, isSubmitting: false });
            }
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
                .set('formReset', this.reset).toJS();
            return React.createElement<FormProps<P>>(Component, props);
        }
    };
}
