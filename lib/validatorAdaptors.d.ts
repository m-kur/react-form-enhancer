import { HandlerResult, InputValidator, Inspector } from './types';
export interface ValidatorMemory<P> {
    isKnown(name: string, newValue: any, currentValues: P): boolean;
    memorize(result: HandlerResult<P>, name: string, newValue: any, currentValues: P): void;
    remember(): HandlerResult<P>;
}
export declare class SimpleMemory<P> implements ValidatorMemory<P> {
    constructor();
    private args;
    private result;
    isKnown(name: string, newValue: any, currentValues: P): boolean;
    memorize(result: HandlerResult<P>, name: string, newValue: any, currentValues: P): void;
    remember(): HandlerResult<P>;
}
export declare function memorizedAdaptor<P>(validator: InputValidator<P>, memory?: ValidatorMemory<P>): (name: string, newValue: any, currentValues: P, inspector: Inspector) => any;
