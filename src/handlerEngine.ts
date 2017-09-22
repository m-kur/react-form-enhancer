import { Map } from 'immutable';

import { HandlerResult, FormErrors, Inspector } from './types';
import { isDefinedName } from './definitionChecker';

export function invokeHandler<P>(
    name: string,
    handle: () => Promise<never> | HandlerResult<P>, // <- Promise's type arg is intentional never.
    resolve: () => void,
    reject: (reason: any) => void,
    inspect: Inspector,
) {
    const result = handle();
    // don't catch Error.
    if (Promise.resolve<HandlerResult<P>>(result) === result) { // <- type arg is intentional P.
        inspect('handled', name);
        (result as Promise<never>).then( // <- type arg is intentional never.
            () => {
                // ignore returns when Promise is resolved.
                resolve();
                inspect('async-resolved', name);
            },
            (reason) => {
                // don't catch Error.
                if (reason instanceof Error) throw reason;
                reject(reason);
                inspect('async-rejected', name, reason);
            },
        );
    } else {
        inspect('handled', name);
        if (result == null) {
            resolve();
            inspect('resolved', name);
        } else {
            reject(result);
            inspect('rejected', name, result);
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
        if (isDefinedName(definition, name, 'result of a validation', isForm)) {
            return Map<any>(oldError).set(name, String(newErrors)).toJS();
        }
    }
    // reject returns NOT string, maybe { [name: string]: any }
    // newErrors isn't Error object because invokeHandler doesn't catch Error.
    return Map<any>(oldError).merge(sanitizeErrors<P>(definition, newErrors, isForm)).toJS();
}
