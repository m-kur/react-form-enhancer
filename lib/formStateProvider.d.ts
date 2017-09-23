import * as React from 'react';
import { FormErrors, ProviderProps } from './types';
/**
 * FormStateProvider(=return of {formStateProvider<P>}) supplies all this properties.
 */
export declare type FormProps<P> = {
    formValues: P;
    formErrors: FormErrors<P>;
    formIsSubmitting: boolean;
    formIsPristine: boolean;
    formHasError: boolean;
    formChange: (name: string, value: any, validate?: boolean) => void;
    formValidate: (name: string) => void;
    formSubmit: (event?: React.FormEvent<any>) => void;
    formReset: () => void;
};
export declare type FormComponent<P> = React.ComponentType<Partial<FormProps<P>>>;
export declare type ProviderComponent<P> = React.ComponentClass<ProviderProps<P>>;
/**
 * This HOC enhances your form component.
 * @param {FormComponent<P>} Form target component of manage. Wrapped component provides {FormProps<P>} properties.
 * @return {ProviderComponent<P>} FormStateProvider, a managed component which has {ProviderProps<P>} properties.
 */
export declare function formStateProvider<P>(Form: FormComponent<P>): ProviderComponent<P>;
