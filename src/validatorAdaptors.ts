import { fromJS } from 'immutable';
import { HandlerResult, FormHandler, Inspector } from './types';

export interface ValidatorMemory<P> {
    isKnown(currentValues: P): boolean;
    memorize(currentValues: P, result: HandlerResult<P>): void;
    remember(): HandlerResult<P>;
}

export class SimpleMemory<P> implements ValidatorMemory<P> {
    constructor() {
        this.isKnown = this.isKnown.bind(this);
        this.memorize = this.memorize.bind(this);
        this.remember = this.remember.bind(this);
    }

    private args: P | null = null;
    private result: HandlerResult<P> = null;

    isKnown(currentValues: P): boolean {
        return this.args != null && fromJS(this.args).equals(fromJS(currentValues));
    }

    memorize(currentValues: P, result: HandlerResult<P>) {
        this.args = currentValues;
        this.result = result;
    }

    remember(): HandlerResult<P> {
        return this.result;
    }
}

export function memorizedAdaptor<P>(validator: FormHandler<P>, memory: ValidatorMemory<P> = new SimpleMemory<P>()) {
    return (currentValues: P, name: string, inspector: Inspector) => {
        if (!memory.isKnown(currentValues)) {
            let validResult = null;
            try {
                validResult = validator(currentValues, name, inspector);
            } catch (error) {
                // don't memorize.
                return error.message;
            }
            if (Promise.resolve<HandlerResult<P>>(validResult) === validResult) {
                const promise = (validResult as Promise<any>);
                promise.then(
                    () => {
                        // async-resolve, memorize.
                        memory.memorize(currentValues, null);
                    },
                    (reason: HandlerResult<P>) => {
                        // async-reject, memorize.
                        memory.memorize(currentValues, reason);
                        return reason;
                    },
                );
                return promise;
            } else {
                // sync, memorize.
                memory.memorize(currentValues, validResult as HandlerResult<P>);
            }
        }
        return memory.remember();
    };
}
