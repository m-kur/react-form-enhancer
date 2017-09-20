import { HandlerEvent } from './types';

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
