import { HandlerEvent, KeyValue } from './types';
export declare function invokeHandler<Reason, Event>(name: string, handler: () => Promise<Reason> | Reason, onResolve: () => void, onReject: (reason: Reason) => void, inspector?: (e: HandlerEvent) => void): void;
export declare function mergeErrors(definition: any, oldError: KeyValue, name: string, newErrors: any): KeyValue;
