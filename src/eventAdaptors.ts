import * as React from 'react';

export interface FireEventHandler {
    (name: string): void;
}

export interface FireEventAdaptor<E> {
    (prop: FireEventHandler): (e: React.FocusEvent<E>) => void;
}

export interface ChangeEventHandler {
    (name: string, value: any, validateConcurrently?: boolean): void;
}

export interface ChangeEventAdaptor<E> {
    (prop: ChangeEventHandler, validateConcurrently?: boolean): (e: React.ChangeEvent<E>) => void;
}

export type WellknownElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export const focusAdaptor: FireEventAdaptor<WellknownElement> =
        prop => e => prop(e.currentTarget.name);

export const changeAdaptor: ChangeEventAdaptor<WellknownElement> =
    (prop, validateConcurrently = true) => (e) => {
        const value = e.target.type !== 'checkbox' ? e.target.value :
            (e as React.ChangeEvent<HTMLInputElement>).target.checked;
        prop(e.target.name, value, validateConcurrently);
    };
