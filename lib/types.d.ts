import * as React from 'react';
export declare type FormErrors<P> = {
    [N in keyof P | 'form']?: string | null;
};
export declare type HandlerResult<P> = FormErrors<P> | string | null;
export declare type HandlerEvent = {
    name: string;
    type: 'handled' | 'resolved' | 'rejected';
    async: boolean;
};
export interface SubmitHandler<P> {
    (values: P, event?: React.FormEvent<any>): Promise<HandlerResult<P>> | HandlerResult<P>;
}
export interface FormValidator<P> {
    (values: Partial<P>): Promise<HandlerResult<P>> | HandlerResult<P>;
}
export declare type ProviderProps<P> = {
    defaultValues: P;
    submitHandler: SubmitHandler<P>;
    validators?: {
        [N in keyof P]?: FormValidator<P>;
    };
    inspector?: (e: HandlerEvent) => void;
};
