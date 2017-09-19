import * as React from 'react';

declare module 'react-form-enhancer' {

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

    export type ProviderProps<P> = {
        defaultValues: P,
        submitHandler: SubmitHandler<P>,
        validators?: { [N in keyof P]?: FormValidator<P> },
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

    // API: This HOC enhances your form component.
    export function formStateProvider<P>(Form: React.ComponentType<Partial<FormProps<P>>>):
        React.ComponentClass<ProviderProps<P>>;

    export interface FormFocus {
        (name: string): void;
    }

    export interface FormFocusAdaptor<E> {
        (prop: FormFocus): (e: React.FocusEvent<E>) => void;
    }

    export interface FormChange {
        (name: string, value: any, validateConcurrently?: boolean): void;
    }

    export interface FormChangeAdaptor<E> {
        (prop: FormChange, validateConcurrently?: boolean): (e: React.ChangeEvent<E>) => void;
    }

    export type WellknownElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

    export const focusAdaptor: FormFocusAdaptor<WellknownElement>;

    export const changeAdaptor: FormChangeAdaptor<WellknownElement>;

}
