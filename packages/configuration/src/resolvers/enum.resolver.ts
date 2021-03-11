import {ResolverInterface} from "../interfaces/resolver.interface";
import {ConfigurationResolverError} from "../errors/configuration-resolver.error";

/**
 * This class takes either another resolver or a scalar (number or string) and returns an enum value.
 */
export class EnumResolver implements ResolverInterface<number | string> {
    public constructor(
        private readonly valueOrResolver: string | number | ResolverInterface<string> | ResolverInterface<number> | ResolverInterface<number | string>,
        private readonly enumClass: any,
    ) {
    }

    /**
     * This method takes a string and transforms it into an enum value. This is useful in configurations when the system, for example environment variables, only
     * support string but the configuration expects an enum value.
     * @param value
     * @param enumClass
     * @private
     */
    private resolveString (value: string, enumClass: any): number | string {
        const normalizedValue = value.toLowerCase();

        const keys = Object.keys(enumClass).filter(key => isNaN(Number(key)));
        for(const key of keys){
            if (key.toLowerCase() === normalizedValue || enumClass[key] === value){
                return enumClass[key];
            }
        }

        throw new ConfigurationResolverError("Cannot convert the string to a key of the enum. Value: '" + value + "'");
    }

    /**
     * This method takes a number and transforms it into a boolean. This is useful when you receive a number but expect
     * an enum value in the end.
     *
     * @param value
     * @param enumClass
     * @private
     */
    private resolveNumber (value: number, enumClass: any): number | string {
        const keys = Object.keys(enumClass);
        for(const key of keys){
            if (enumClass[key] === value){
                return enumClass[key];
            }
        }

        throw new ConfigurationResolverError("Cannot convert the number to a value of the enum. Value: '" + value + "'");
    }

    /**
     * This method checks the type of the argument and calls the proper individual method.
     *
     * @param value
     * @param enumClass
     * @private
     */
    private async resolveValueOrResolver(value:  string | number | ResolverInterface<string> | ResolverInterface<number> | ResolverInterface<number | string>, enumClass: any): Promise<number | string> {
        value = !isNaN(+value) && typeof value !== "object" ? +value : value;
        if(typeof value === "string") {
            return this.resolveString(value, enumClass);
        }

        if(typeof value === "number") {
            return this.resolveNumber(value, enumClass);
        }

        if(typeof value === "object" && typeof value.resolve === "function") {
            return this.resolveValueOrResolver(await value.resolve(), enumClass);
        }

        throw new ConfigurationResolverError("Cannot resolve the value passed: '" + value + "'. It isn't of type string, number or ResolverInterface. We saw type: '" + typeof value + "'");
    }

    /**
     * This method resolve the value whether it's a scalar or a Resolver.
     */
    async resolve(): Promise<number | string> {
        return this.resolveValueOrResolver(this.valueOrResolver, this.enumClass);
    }

}