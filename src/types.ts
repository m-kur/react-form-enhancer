import * as React from 'react';

export type FormErrors<P> = { [N in keyof P | 'form']?: string | null };

export type HandlerResult<P> = FormErrors<P> | string | null;

export type HandlerEvent = {
    name: string,
    type: 'handled' | 'resolved' | 'rejected';
    async: boolean,
};

// API: the submitting interface for a form.
export interface SubmitHandler<P> {
    (values: P, event?: React.FormEvent<any>): Promise<HandlerResult<P>> | HandlerResult<P>;
}

// API: the validation interface for inputs.
export interface FormValidator<P> {
    (values: Partial<P>): Promise<HandlerResult<P>> | HandlerResult<P>;
}

export type ProviderProps<P> = {
    defaultValues: P,
    submitHandler: SubmitHandler<P>,
    validators?: { [N in keyof P]?: FormValidator<P> },
    inspector?: (e: HandlerEvent) => void;
};

export type KeyValue = { [name: string]: any };
