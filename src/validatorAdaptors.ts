import { fromJS } from 'immutable';
import { HandlerResult, InputValidator, Inspector } from './types';

export interface ValidatorMemory<P> {
    isKnown(name: string, newValue: any, currentValues: P): boolean;
    memorize(result: HandlerResult<P>, name: string, newValue: any, currentValues: P): void;
    remember(): HandlerResult<P>;
}

export class SimpleMemory<P> implements ValidatorMemory<P> {
    constructor() {
        this.isKnown = this.isKnown.bind(this);
        this.memorize = this.memorize.bind(this);
        this.remember = this.remember.bind(this);
    }

    private args: { name: string, newValue: any } | null = null;
    private result: HandlerResult<P> = null;

    isKnown(name: string, newValue: any, currentValues: P): boolean {
        return this.args != null && fromJS(this.args).equals(fromJS({ name, newValue }));
    }

    memorize(result: HandlerResult<P>, name: string, newValue: any, currentValues: P) {
        this.args = { name, newValue };
        this.result = result;
    }

    remember(): HandlerResult<P> {
        return this.result;
    }
}

export function memorizedAdaptor<P>(validator: InputValidator<P>, memory: ValidatorMemory<P> = new SimpleMemory<P>()) {
    return (name: string, newValue: any, currentValues: P, inspector: Inspector) => {
        if (!memory.isKnown(name, newValue, currentValues)) {
            let validResult = null;
            try {
                validResult = validator(name, newValue, currentValues, inspector);
            } catch (error) {
                // don't memorize.
                return error.message;
            }
            if (Promise.resolve<HandlerResult<P>>(validResult) === validResult) {
                const promise = (validResult as Promise<any>);
                promise.then(
                    () => {
                        // async-resolve, memorize.
                        memory.memorize(null, name, newValue, currentValues);
                    },
                    (reason: HandlerResult<P>) => {
                        // async-reject, memorize.
                        memory.memorize(reason, name, newValue, currentValues);
                        return reason;
                    },
                );
                return promise;
            } else {
                // sync, memorize.
                memory.memorize(validResult as HandlerResult<P>, name, newValue, currentValues);
            }
        }
        return memory.remember();
    };
}
