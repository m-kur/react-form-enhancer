import { HandlerResult, FormHandler, Inspector } from './types';
export interface HandlerMemory<P> {
    isKnown(currentValues: P): boolean;
    memorize(currentValues: P, result: HandlerResult<P>): void;
    remember(): HandlerResult<P>;
}
export declare class SimpleMemory<P> implements HandlerMemory<P> {
    constructor();
    private args;
    private result;
    isKnown(currentValues: P): boolean;
    memorize(currentValues: P, result: HandlerResult<P>): void;
    remember(): HandlerResult<P>;
}
export declare function memorizedAdaptor<P>(validator: FormHandler<P>, memory?: HandlerMemory<P>): (currentValues: P, name: string, inspector: Inspector) => any;
