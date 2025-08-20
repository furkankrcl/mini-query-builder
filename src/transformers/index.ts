import { IValueTransformer } from "../types";

/**
 * Common value transformers for frequently used data types
 */
export class CommonTransformers {
  /**
   * JSON transformer for arrays and objects
   */
  static readonly JSON: IValueTransformer<any, string | null> = {
    to: (value: any): string | null => {
      return value ? JSON.stringify(value) : null;
    },
    from: (value: string | null): any => {
      return value ? JSON.parse(value) : undefined;
    },
  };

  /**
   * Number array transformer
   */
  static readonly NUMBER_ARRAY: IValueTransformer<number[], string | null> = {
    to: (value: number[]): string | null => {
      return value && value.length > 0 ? JSON.stringify(value) : null;
    },
    from: (value: string | null): number[] => {
      return value ? JSON.parse(value) : [];
    },
  };

  /**
   * String array transformer
   */
  static readonly STRING_ARRAY: IValueTransformer<string[], string | null> = {
    to: (value: string[]): string | null => {
      return value && value.length > 0 ? JSON.stringify(value) : null;
    },
    from: (value: string | null): string[] => {
      return value ? JSON.parse(value) : [];
    },
  };
}
