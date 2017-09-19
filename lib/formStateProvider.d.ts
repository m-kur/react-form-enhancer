import * as React from 'react';
export declare type FormErrors<P> = {
    [N in keyof P | 'form']?: string | null;
};
export declare type HandlerResult<P> = FormErrors<P> | string | null;
export interface SubmitHandler<P> {
    (values: P, event?: React.FormEvent<any>): Promise<HandlerResult<P>> | HandlerResult<P>;
}
export interface FormValidator<P> {
    (values: Partial<P>): Promise<HandlerResult<P>> | HandlerResult<P>;
}
export declare type HandlerEvent = {
    name: string;
    type: 'handled' | 'resolved' | 'rejected';
    async: boolean;
};
export declare type ProviderProps<P> = {
    defaultValues: P;
    submitHandler: SubmitHandler<P>;
    validators?: {
        [N in keyof P]?: FormValidator<P>;
    };
    inspector?: (e: HandlerEvent) => void;
};
export declare type FormProps<P> = {
    formValues: P;
    formErrors: FormErrors<P>;
    formHasError: boolean;
    formIsPristine: boolean;
    formIsSubmitting: boolean;
    formCancelError: (name: string) => void;
    formReset: () => void;
    formSubmit: (event?: React.FormEvent<any>) => void;
    formChange: (name: string, value: any, validate?: boolean) => void;
    formValidate: (name: string) => void;
};
export declare type FormComponent<P> = React.ComponentType<Partial<FormProps<P>>>;
export declare type ProviderComponent<P> = React.ComponentClass<ProviderProps<P>>;
export declare function formStateProvider<P>(Form: FormComponent<P>): ProviderComponent<P>;
