import * as React from 'react';

export type FormErrors<P> = { [N in keyof P | 'form']?: string | null };

export type HandlerResult<P> = FormErrors<P> | string | null;

export type HandlerEvent = {
    name: string,
    type: 'handled' | 'resolved' | 'rejected';
    async: boolean,
};

/**
 * the submitting interface for a form.
 * @param values form,s current values.
 * @param event DOM/submit event.
 * @return an error message, supposes Promise or FormErrors<P> or string or null(=success).
 */
export interface SubmitHandler<P> {
    (values: P, event?: React.FormEvent<any>): Promise<never> | HandlerResult<P>;
}

/**
 * the validation interface for inputs.
 * @param values form,s current values.
 * @return an error message, supposes Promise or FormErrors<P> or string or null(=success).
 */
export interface FormValidator<P> {
    (values: Partial<P>): Promise<never> | HandlerResult<P>;
}

export type FormValidatorMap<P> = { [N in keyof P]?: FormValidator<P> };

export type ProviderProps<P> = {
    defaultValues: P,
    submitHandler: SubmitHandler<P>,
    validators?: FormValidatorMap<P>,
    inspector?: (e: HandlerEvent) => void;
};
