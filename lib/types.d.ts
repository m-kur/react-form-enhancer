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
     * @return {Promise<never> | HandlerResult<P>}
     *     an error message, supposes Promise or FormErrors<P> or string or null(=success).
     */
    (values: P, hasError: boolean, isPristine: boolean): Promise<never> | HandlerResult<P>;
}
export interface InputValidator<P> {
    /**
     * the validation interface for inputs.
     * @param {string} name target name.
     * @param {any} newValue the new, incoming value of "name".
     * @param {P} currentValues form's current values, the value of "name" is old.
     * @return {Promise<never> | HandlerResult<P>}
     *     an error message, supposes Promise or FormErrors<P> or string or null(=success).
     */
    (name: string, newValue: any, currentValues: P): Promise<never> | HandlerResult<P>;
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
export declare type ProviderProps<P> = {
    defaultValues: P;
    submitter: FormSubmitter<P>;
    validators?: InputValidator<P>[] | InputValidator<P>;
    inspector?: Inspector;
};
