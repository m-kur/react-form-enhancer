export interface Inspector {
    /**
     * It is for inspection of the handler engine.
     * @param {string} on 'handled', 'resolved', 'rejected', 'props.*(from {FormProps<P>})'.
     * @param {string} name current handling target name.
     * @param {boolean} value for many purposes.
     */
    (on: string, name: string, value?: any): void; // "on" is intentional string, not union.
}

export type FormErrors<P> = { [N in keyof P | 'form']?: string | null };

export type HandlerResult<P> = FormErrors<P> | string | null;

export interface FormHandler<P> {
    /**
     * the submitting and validating interface for a form.
     * @param {P} values form,s current values.
     * @param {string} name handling target. when submit, name is "form".
     * @param {Inspector} inspector see {ProviderProps<P>}. a submitter debugging tool.
     * @return {Promise<any> | HandlerResult<P>}
     *     an error message, supposes Promise or FormErrors<P> or string or null(=success).
     */
    (values: P, name: string, inspector: Inspector): Promise<any> | HandlerResult<P>;
}

export type ProviderProps<P> = {
    defaultValues: P,
    submitter: FormHandler<P>,
    validators?: { [N in keyof P]?: FormHandler<P> },
    inspector?: Inspector;
};
