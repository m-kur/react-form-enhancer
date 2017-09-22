import * as React from 'react';

export interface ChangeEventHandler {
    (name: string, value: any, validateConcurrently?: boolean): void;
}

export interface ChangeEventAdaptor<E> {
    (prop: ChangeEventHandler, validateConcurrently?: boolean): (e: React.ChangeEvent<E>) => void;
}

/**
 * They have "name" and "value" property.
 */
export type HasNameAndValueElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;

/**
 * An adaptor for DOM onChange event converts element's name and value attribute.
 * @param {ChangeEventHandler} prop this.props.formChange, etc.
 * @param {boolean} validateConcurrently do concurrent validation.
 */
export const changeAdaptor: ChangeEventAdaptor<HasNameAndValueElement> =
    (prop, validateConcurrently = true) => (e) => {
        type EI = React.ChangeEvent<HTMLInputElement>;
        const value = e.target.type === 'checkbox' ? (e as EI).target.checked :
            (e.target.value != null ? e.target.value : e.currentTarget.value);
        const name = e.target.name != null ? e.target.name : e.currentTarget.name;
        prop(name, value, validateConcurrently);
    };

export interface FocusEventHandler {
    (name: string): void;
}

export interface FocusEventAdaptor<E> {
    (prop: FocusEventHandler): (e: React.FocusEvent<E>) => void;
}

/**
 * They have "name" property.
 */
export type HasNameElement = HasNameAndValueElement | HTMLFormElement | HTMLMapElement;

/**
 * An adaptor for DOM onFocus event converts element's name attribute.
 * @param {FocusEventHandler} prop this.props.formValidate, etc.
 */
export const focusAdaptor: FocusEventAdaptor<HasNameElement> =
    prop => (e) => {
        const name = e.currentTarget.name != null ? e.currentTarget.name : (e.target as any).name;
        prop(name);
    };

export type FormPropsEx = {
    formOnChange: (e: React.ChangeEvent<HasNameAndValueElement>, validateConcurrently?: boolean) => void,
    formOnValidate: (e: React.FocusEvent<HasNameElement>) => void,
};
