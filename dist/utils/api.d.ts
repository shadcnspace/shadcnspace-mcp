export declare function fetchUIComponents(): Promise<any>;
export declare function fetchUIBlocks(): Promise<any>;
export declare function fetchComponentDetails(name: string): Promise<any>;
type BlockMetadata = {
    name: string;
    title: string;
    files: string[];
};
export declare function fetchMultipleComponentDetails(nameOrNames?: string | string[]): Promise<BlockMetadata[]>;
export declare function fetchExampleComponents(): Promise<any>;
export declare function fetchExampleDetails(exampleName: string): Promise<{
    name: string;
    type: string;
    description: string;
    files: {
        content: string;
    }[];
}>;
export {};
