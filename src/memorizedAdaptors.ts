import { fromJS } from 'immutable';
import { HandlerResult, InputValidator, Inspector } from './types';

export function simpleMemorized<P>(validator: InputValidator<P>): InputValidator<P> {
    let args: { name: string, newValue: any } | null = null;
    let reason: HandlerResult<P> = null;

    return (name: string, newValue: any, currentValues: P, inspector: Inspector) => {
        const currentArgs = { name, newValue };
        if (args == null || !fromJS(args).equals(fromJS(currentArgs))) {
            args = currentArgs;
            const r = validator(name, newValue, currentValues, inspector);
            if (Promise.resolve<HandlerResult<P>>(r) === r) {
                (r as Promise<HandlerResult<P>>).then(
                    () => {
                        // async-resolve, memorize.
                        return reason = null;
                    },
                    (rr: HandlerResult<P>) => {
                        // async-reject, memorize.
                        return reason = rr;
                    },
                );
                // return Promise object.
                return r;
            }
            // sync, memorize.
            reason = (r as HandlerResult<P>);
        }
        return reason;
    };
}
