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
export declare type WellknownElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export declare const focusAdaptor: FireEventAdaptor<WellknownElement>;
export declare const changeAdaptor: ChangeEventAdaptor<WellknownElement>;
