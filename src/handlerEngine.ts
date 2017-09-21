import { Map } from 'immutable';

import { HandlerEvent, HandlerResult, FormErrors } from './types';
import { isDefinedName } from './definitionChecker';

export function invokeHandler<P>(
    name: string,
    handler: () => Promise<never> | HandlerResult<P>,
    onResolve: () => void,
    onReject: (reason: any) => void,
    inspector?: (e: HandlerEvent) => void,
) {
    const onProcessed = inspector != null ? inspector : () => {};
    const result = handler();
    if (Promise.resolve<HandlerResult<P>>(result) === result) {
        onProcessed({ name, type: 'handled', async: true });
        (result as Promise<never>).then(
            () => {
                // ignore returns when Promise is resolved.
                onResolve();
                onProcessed({ name, type: 'resolved', async: true });
            },
            (reason) => {
                // don't catch Error.
                if (reason instanceof Error) throw reason;
                onReject(reason);
                onProcessed({ name, type: 'rejected', async: true });
            },
        );
    } else {
        onProcessed({ name, type: 'handled', async: false });
        if (result != null) {
            onReject(result);
            onProcessed({ name, type: 'rejected', async: false });
        } else {
            onResolve();
            onProcessed({ name, type: 'resolved', async: false });
        }
    }
}

function sanitizeErrors<P>(definition: P, newErrors: any, isForm: boolean): FormErrors<P> {
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
