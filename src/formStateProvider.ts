import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Map } from 'immutable';

import { FormErrors, ProviderProps, InputValidator, Inspector } from './types';
import { invokeHandler, mergeErrors } from './handlerEngine';
import { isDefinedName } from './definitionChecker';

/**
 * FormStateProvider(=return of {formStateProvider<P>}) supplies all this properties.
 */
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

/**
 * This HOC enhances your form component.
 * @param {FormComponent<P>} Form target component of manage. Wrapped component provides {FormProps<P>} properties.
 * @return {ProviderComponent<P>} FormStateProvider, a managed component which has {ProviderProps<P>} properties.
 */
export function formStateProvider<P>(Form: FormComponent<P>): ProviderComponent<P> {
    type ProviderState = {
        values: P,
        errors: FormErrors<P>,
        isSubmitting: boolean,
    };

    return class FormStateProvider extends React.Component<ProviderProps<P>, ProviderState> {
        // runtime properties check for Redux or/and ECMA applications.
        static propTypes = {
            defaultValues: PropTypes.object.isRequired,
            submitter: PropTypes.func.isRequired,
            validators: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
            inspector: PropTypes.func,
        };

        constructor(props: ProviderProps<P>) {
            super(props);
            const values = props.defaultValues != null ? props.defaultValues : {} as P;
            this.state = { values, errors: {}, isSubmitting: false };
            this.change = this.change.bind(this);
            this.validate = this.validate.bind(this);
            this.submit = this.submit.bind(this);
            this.reset = this.reset.bind(this);
            this.notify = props.inspector != null ? props.inspector : () => {};
        }

        private canSetStateFromAsync: boolean = false;
        private notify: Inspector;

        componentWillMount() {
            this.canSetStateFromAsync = true;
            this.notify('mount', 'form');
        }

        componentWillUnmount() {
            this.notify('unmount', 'form');
            this.canSetStateFromAsync = false;
        }

        private isPristine(): boolean {
            for (const name of Object.keys(this.state.values)) {
                if ((this.state.values as any)[name] !== (this.props.defaultValues as any)[name]) {
                    return false;
                }
            }
            return true;
        }

        private hasError(): boolean {
            for (const name of Object.keys(this.state.errors)) {
                if ((this.state.errors as any)[name] != null) {
                    return true;
                }
            }
            return false;
        }

        private updateErrors(name: string, newErrors: any) {
            if (this.canSetStateFromAsync) {
                const errors = mergeErrors<P>(this.props.defaultValues, this.state.errors, name, newErrors);
                this.setState({ errors });
            }
        }

        private invokeValidator(name: string, newValue: any) {
            if (this.props.validators != null) {
                const arrayOfValidators = Array.isArray(this.props.validators) ?
                    this.props.validators as InputValidator<P>[] :
                    [(this.props.validators as InputValidator<P>)];
                arrayOfValidators.forEach((validator) => {
                    const currentValues = Map(this.state.values).toJS();
                    invokeHandler<P>(
                        name,
                        () => validator(name, newValue, currentValues, this.notify),
                        () => this.updateErrors(name, null),
                        reason => this.updateErrors(name, reason),
                        this.notify,
                    );
                });
            }
        }

        private change(name: string, value: any, validateConcurrently: boolean = true) {
            if (isDefinedName<P>(this.props.defaultValues, name, 'props.formChange')) {
                this.setState(Map({}).set('values', Map(this.state.values).set(name, value)).toJS());
                this.notify('props.formChange', name, value);
                if (validateConcurrently) {
                    this.invokeValidator(name, value);
                }
            }
        }

        private validate(name: string) {
            if (isDefinedName<P>(this.props.defaultValues, name, 'props.formValidate')) {
                this.invokeValidator(name, (this.state.values as any)[name]);
                this.notify('props.formValidate', name);
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
            this.notify('form', 'props.formSubmit');
            invokeHandler<P>(
                'form',
                () => {
                    const values = Map(this.state.values).toJS();
                    return this.props.submitter(values, this.hasError(), this.isPristine(), this.notify);
                },
                () => {
                    this.updateErrors('form', null);
                    this.endSubmitting();
                },
                (reason) => {
                    this.updateErrors('form', reason);
                    this.endSubmitting();
                },
                this.notify,
            );
        }

        private reset() {
            if (this.canSetStateFromAsync) {
                this.setState({ values: this.props.defaultValues, errors: {}, isSubmitting: false });
                this.notify('props.formReset', 'form');
            }
        }

        render () {
            const Component = Form as React.ComponentClass<FormProps<P>>;
            const props = Map<string, any>(this.props)
                .delete('defaultValues').delete('submitter').delete('validators').delete('inspector')
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
