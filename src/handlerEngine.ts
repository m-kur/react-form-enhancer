import { Map } from 'immutable';

import { HandlerEvent, KeyValue } from './types';
import { isDefinedName } from './definitionChecker';

export function invokeHandler<Reason, Event>(
    name: string,
    handler: () => Promise<Reason> | Reason,
    onResolve: () => void,
    onReject: (reason: Reason) => void,
    inspector?: (e: HandlerEvent) => void,
) {
    const onProcessed = inspector != null ? inspector : () => {};
    const result = handler();
    if (Promise.resolve<Reason>(result) === result) {
        onProcessed({ name, type: 'handled', async: true });
        (result as Promise<Reason>).then(
            () => {
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
            onReject(result as Reason);
            onProcessed({ name, type: 'rejected', async: false });
        } else {
            onResolve();
            onProcessed({ name, type: 'resolved', async: false });
        }
    }
}

function sanitizeErrors(definition: any, errors: any, isForm: boolean): KeyValue {
    return Object.keys(errors).reduce<Map<string, string | null>>(
        (prior, name) => {
            if (!isDefinedName(definition, name, 'result of a validation', isForm)) {
                return prior.delete(name);
            }
            const reason = (errors as KeyValue)[name];
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

export function mergeErrors(definition: any, oldError: KeyValue, name: string, newErrors: any): KeyValue {
    const isForm = name === 'form';
    if (newErrors == null) {
        if (isForm) {
            // submit -> resolve
            return {};
        } else {
            // invokeValidator -> resolve
            return Map(oldError).delete(name).toJS();
        }
    } else if (typeof newErrors === 'string' || typeof newErrors === 'number' || typeof newErrors === 'boolean') {
        // reject returns string (or number, boolean)
        if (isDefinedName(definition, name, 'result of a validation', isForm)) {
            return Map(oldError).set(name, String(newErrors)).toJS();
        }
    } else if (newErrors instanceof Error) {
        // reject catch Error
        if (isDefinedName(definition, name, 'catching Error of a validation', isForm)) {
            return Map(oldError).set(name, (newErrors as Error).message).toJS();
        }
    }
    // reject returns NOT string, maybe { [name: string]: any }
    return Map(oldError).merge(sanitizeErrors(definition, newErrors, isForm)).toJS();
}
