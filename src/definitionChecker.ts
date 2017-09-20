import { Map } from 'immutable';
import * as PropTypes from 'prop-types';

import { ProviderProps } from './types';

declare const process: any;

// PropTypes.checkPropTypes is not declared in @types/prop-types.
declare module 'prop-types' {
    function checkPropTypes<T>(
        typeSpecs: PropTypes.ValidationMap<T>,
        values: T,
        location: string,
        componentName: string,
    ): void;
}

export function isDefinedName(definition: any, name: string, warnFor: string, isForm: boolean = false): boolean {
    const defined = isForm && name === 'form' || definition.hasOwnProperty(name);
    if (!defined && warnFor != null && warnFor !== '') { // "!= null" is for non-TypeScript code.
        if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
            console.error(`Warning: \'${warnFor}\' accessed \'${name}\' which is a non-predefined name.`);
        }
    }
    return defined;
}


export function checkProviderProps(props: ProviderProps<any>) {
    if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
        PropTypes.checkPropTypes<ProviderProps<{}>>(
            {
                defaultValues: PropTypes.object.isRequired,
                submitHandler: PropTypes.func.isRequired,
                validators: PropTypes.object,
                inspector: PropTypes.func,
            },
            props, 'props', 'FormStateProvider',
        );
        if (props.validators != null) {
            const checker: PropTypes.ValidationMap<any> = Object.keys(props.validators).reduce(
                (prior, name) => {
                    if (isDefinedName(props.defaultValues, name, '')) {
                        return Map(prior).set(name, PropTypes.func).toJS();
                    }
                    console.error('Warning: The \`validators\` property of \`FormStateProvider\` ' +
                        `has a validator named \'${name}\' without name in \'defaultValues\'.`);
                    return prior;
                },
                {},
            );
            PropTypes.checkPropTypes(checker, props.validators, 'props.validators', 'FormStateProvider');
        }
    }
}
