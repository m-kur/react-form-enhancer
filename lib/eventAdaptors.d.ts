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
export declare type HasNameAndValueElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;
/**
 * An adaptor for DOM onChange event converts element's name and value attribute.
 * @param {ChangeEventHandler} prop this.props.formChange, etc.
 * @param {boolean} validateConcurrently do concurrent validation.
 */
export declare const changeAdaptor: ChangeEventAdaptor<HasNameAndValueElement>;
export interface FocusEventHandler {
    (name: string): void;
}
export interface FocusEventAdaptor<E> {
    (prop: FocusEventHandler): (e: React.FocusEvent<E>) => void;
}
/**
 * They have "name" property.
 */
export declare type HasNameElement = HasNameAndValueElement | HTMLFormElement | HTMLMapElement;
/**
 * An adaptor for DOM onFocus/onBlur event converts element's name attribute.
 * @param {FocusEventHandler} prop this.props.formValidate, etc.
 */
export declare const focusAdaptor: FocusEventAdaptor<HasNameElement>;
export declare type FormPropsEx = {
    formOnChange: (e: React.ChangeEvent<HasNameAndValueElement>, validateConcurrently?: boolean) => void;
    formOnValidate: (e: React.FocusEvent<HasNameElement>) => void;
};
