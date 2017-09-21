import * as React from 'react';
export declare type FormErrors<P> = {
    [N in keyof P | 'form']?: string | null;
};
export declare type HandlerResult<P> = FormErrors<P> | string | null;
export interface FormSubmitter<P> {
    /**
     * the submitting interface for a form.
     * @param {P} values values form,s current values.
     * @param {React.FormEvent<any>} event event DOM/submit event.
     * @return {Promise<never> | HandlerResult<P>}
     *     an error message, supposes Promise or FormErrors<P> or string or null(=success).
     */
    (values: P, event?: React.FormEvent<any>): Promise<never> | HandlerResult<P>;
}
export interface InputValidator<P> {
    /**
     * the validation interface for inputs.
     * @param {Partial<P>} values form's current values.
     * @return {Promise<never> | HandlerResult<P>}
     *     an error message, supposes Promise or FormErrors<P> or string or null(=success).
     */
    (values: Partial<P>): Promise<never> | HandlerResult<P>;
}
export interface Inspector {
    /**
     * It is for inspection of the handler engine.
     * @param {string} name current handling target name.
     * @param {string} on 'handled' or 'resolved' or 'rejected'.
     * @param {boolean} async
     */
    (name: string, on: string, async: boolean): void;
}
export declare type InputValidatorsMap<P> = {
    [N in keyof P]?: InputValidator<P>;
};
export declare type ProviderProps<P> = {
    defaultValues: P;
    submitHandler: FormSubmitter<P>;
    validators?: InputValidatorsMap<P>;
    inspector?: Inspector;
};
