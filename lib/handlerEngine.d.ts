import { HandlerResult, FormErrors, Inspector } from './types';
export declare function invokeHandler<P>(name: string, handle: () => Promise<never> | HandlerResult<P>, onResolve: () => void, onReject: (reason: any) => void, notify: Inspector): void;
export declare function sanitizeErrors<P>(definition: P, newErrors: any, isForm: boolean): FormErrors<P>;
export declare function mergeErrors<P>(definition: P, oldError: FormErrors<P>, name: string, newErrors: any): FormErrors<P>;
