import * as PropTypes from 'prop-types';
import { ProviderProps } from './types';
declare module 'prop-types' {
    function checkPropTypes<T>(typeSpecs: PropTypes.ValidationMap<T>, values: T, location: string, componentName: string): void;
}
export declare function isDefinedName(definition: any, name: string, warnFor: string, isForm?: boolean): boolean;
export declare function checkProviderProps(props: ProviderProps<any>): void;
