export declare function fetchUIComponents(): Promise<any>;
export declare function fetchUIBlocks(): Promise<any>;
export declare function fetchComponentDetails(name: string): Promise<{
    name: string;
    type: string;
    files: {
        content: string;
    }[];
}>;
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
    files: {
        content: string;
    }[];
    description: string;
}>;
export {};
