import { Map } from 'immutable';

import { HandlerResult, FormErrors, Inspector } from './types';
import { isDefinedName } from './definitionChecker';

export function invokeHandler<P>(
    name: string,
    handle: () => Promise<any> | HandlerResult<P>, // <- Promise's type arg is intentional never.
    onResolve: () => void,
    onReject: (reason: any) => void,
    notify: Inspector,
) {
    let result = null;
    try {
        result = handle();
    } catch (error) {
        onReject(error);
        notify('rejected', name, error);
    }
    if (Promise.resolve<HandlerResult<P>>(result) === result) { // <- type arg is intentional P.
        notify('async-handled', name);
        const promise = (result as Promise<any>);
        promise.then(
            () => {
                onResolve();
                notify('async-resolved', name);
            },
            (reason) => {
                onReject(reason);
                notify('async-rejected', name, reason);
            },
        );
    } else {
        notify('handled', name);
        if (result == null) {
            onResolve();
            notify('resolved', name);
        } else {
            onReject(result);
            notify('rejected', name, result);
        }
    }
}

export function sanitizeErrors<P>(definition: P, newErrors: any, isForm: boolean): FormErrors<P> {
    return Object.keys(newErrors).reduce<Map<string, string | null>>(
        (prior, name) => {
            if (!isDefinedName(definition, name, 'result of a validation', isForm)) {
                return prior.delete(name);
            }
            const reason = newErrors[name];
            if (reason == null) {
                // null or undefined means no-error.
                return prior.set(name, null);
            } else if (typeof reason === 'string' || typeof reason === 'number' || typeof reason === 'boolean') {
                return prior.set(name, String(reason));
            }
            // ignore 'function' etc
            return prior;
        },
        Map({}),
    ).toJS();
}

export function mergeErrors<P>(definition: P, oldError: FormErrors<P>, name: string, newErrors: any): FormErrors<P> {
    const isForm = name === 'form';
    const type = isForm ? 'submitting' : 'validation';
    if (newErrors == null) {
        if (isForm) {
            // submit -> resolve
            return {};
        } else {
            // invokeValidator -> resolve
            return Map<any>(oldError).delete(name).toJS();
        }
    } else if (typeof newErrors === 'string' || typeof newErrors === 'number' || typeof newErrors === 'boolean') {
        // reject returns string (or number, boolean)
        if (isDefinedName(definition, name, `result of a ${type}`, isForm)) {
            return Map<any>(oldError).set(name, String(newErrors)).toJS();
        }
    } else if (newErrors instanceof Error) {
        if (isDefinedName(definition, name, `Error of a ${type}`, isForm)) {
            return Map<any>(oldError).set(name, (newErrors as Error).message).toJS();
        }
    }
    // reject returns NOT string, maybe { [name: string]: any }
    // newErrors isn't Error object because invokeHandler doesn't catch Error.
    return Map<any>(oldError).merge(sanitizeErrors<P>(definition, newErrors, isForm)).toJS();
}
