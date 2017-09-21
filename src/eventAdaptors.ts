import * as React from 'react';

export interface FocusEventHandler {
    (name: string): void;
}

export interface FocusEventAdaptor<E> {
    (prop: FocusEventHandler): (e: React.FocusEvent<E>) => void;
}

export interface ChangeEventHandler {
    (name: string, value: any, validateConcurrently?: boolean): void;
}

export interface ChangeEventAdaptor<E> {
    (prop: ChangeEventHandler, validateConcurrently?: boolean): (e: React.ChangeEvent<E>) => void;
}

export type WellknownElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * An adaptor for DOM onFocus event converts element's name attribute.
 * @param {FocusEventHandler} prop this.props.formValidate, etc.
 */
export const focusAdaptor: FocusEventAdaptor<WellknownElement> =
        prop => e => prop(e.currentTarget.name);

/**
 * An adaptor for DOM onChange event converts element's name and value attribute.
 * @param {ChangeEventHandler} prop this.props.formChange, etc.
 * @param {boolean} validateConcurrently do concurrent validation.
 */
export const changeAdaptor: ChangeEventAdaptor<WellknownElement> =
    (prop, validateConcurrently = true) => (e) => {
        type EI = React.ChangeEvent<HTMLInputElement>;
        const value = e.target.type !== 'checkbox' ? e.target.value : (e as EI).target.checked;
        prop(e.target.name, value, validateConcurrently);
    };
