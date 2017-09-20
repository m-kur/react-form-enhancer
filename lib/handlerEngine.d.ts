import { HandlerEvent } from './types';
export declare function invokeHandler<Reason, Event>(name: string, handler: () => Promise<Reason> | Reason, onResolve: () => void, onReject: (reason: Reason) => void, inspector?: (e: HandlerEvent) => void): void;
