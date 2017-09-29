import * as React from 'react';
import { FormHandler, Inspector } from '../types';
import { FormProps } from '../formStateProvider';
import { FormPropsEx } from '../eventAdaptors';
export declare type YourNameState = {
    gently: boolean;
    yourName: string;
    greeting: string;
};
export declare class YourNameForm extends React.Component<FormProps<YourNameState> & FormPropsEx> {
    render(): JSX.Element;
}
export declare const YourNameComponent: React.ComponentClass<{
    defaultValues: YourNameState;
    submitter: FormHandler<YourNameState>;
    validators?: {
        gently?: FormHandler<YourNameState> | undefined;
        yourName?: FormHandler<YourNameState> | undefined;
        greeting?: FormHandler<YourNameState> | undefined;
    } | undefined;
    inspector?: Inspector | undefined;
}>;
