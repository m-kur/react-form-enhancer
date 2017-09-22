declare const process: any;

export function isDefinedName<P>(definition: P, name: string, warnFor: string, isForm: boolean = false): boolean {
    const defined = isForm && name === 'form' || definition.hasOwnProperty(name);
    if (!defined && warnFor !== '') {
        if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
            console.error(`Warning: \'${warnFor}\' accessed \'${name}\' which is a non-predefined name.`);
        }
    }
    return defined;
}
