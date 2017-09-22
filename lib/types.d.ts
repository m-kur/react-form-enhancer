export interface Inspector {
    /**
     * It is for inspection of the handler engine.
     * @param {string} on 'handled', 'resolved', 'rejected', 'props.*(from {FormProps<P>})'.
     * @param {string} name current handling target name.
     * @param {boolean} value for many purposes.
     */
    (on: string, name: string, value?: any): void;
}
export declare type FormErrors<P> = {
    [N in keyof P | 'form']?: string | null;
};
export declare type HandlerResult<P> = FormErrors<P> | string | null;
export interface FormSubmitter<P> {
    /**
     * the submitting interface for a form.
     * @param {P} values values form,s current values.
     * @param {boolean} hasError This form has errors.
     * @param {boolean} isPristine This form is pristine, as same as default values.
     * @param {Inspector} inspector see {ProviderProps<P>}. a submitter debugging tool.
     * @return {Promise<never> | HandlerResult<P>}
     *     an error message, supposes Promise or FormErrors<P> or string or null(=success).
     */
    (values: P, hasError: boolean, isPristine: boolean, inspector: Inspector): Promise<never> | HandlerResult<P>;
}
export interface InputValidator<P> {
    /**
     * the validation interface for inputs.
     * @param {string} name target name.
     * @param {any} newValue the new, incoming value of "name".
     * @param {P} currentValues form's current values, the value of "name" is old.
     * @param {Inspector} inspector see {ProviderProps<P>}. a validator debugging tool.
     * @return {Promise<never> | HandlerResult<P>}
     *     an error message, supposes Promise or FormErrors<P> or string or null(=success).
     */
    (name: string, newValue: any, currentValues: P, inspector: Inspector): Promise<never> | HandlerResult<P>;
}
export declare type ProviderProps<P> = {
    defaultValues: P;
    submitter: FormSubmitter<P>;
    validators?: InputValidator<P>[] | InputValidator<P>;
    inspector?: Inspector;
};
