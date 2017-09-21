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
export declare type WellknownElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
/**
 * An adaptor for DOM onFocus event converts element's name attribute.
 * @param {FocusEventHandler} prop this.props.formValidate, etc.
 */
export declare const focusAdaptor: FocusEventAdaptor<WellknownElement>;
/**
 * An adaptor for DOM onChange event converts element's name and value attribute.
 * @param {ChangeEventHandler} prop this.props.formChange, etc.
 * @param {boolean} validateConcurrently do concurrent validation.
 */
export declare const changeAdaptor: ChangeEventAdaptor<WellknownElement>;
