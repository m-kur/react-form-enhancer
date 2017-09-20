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
export declare const focusAdaptor: FocusEventAdaptor<WellknownElement>;
export declare const changeAdaptor: ChangeEventAdaptor<WellknownElement>;
