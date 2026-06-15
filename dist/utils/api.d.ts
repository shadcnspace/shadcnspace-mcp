export declare function fetchUIComponents(): Promise<any>;
export declare function fetchUIPages(): Promise<any>;
export declare function fetchUIBlocks(): Promise<any>;
export declare function fetchComponentDetails(name: string): Promise<any>;
type BlockMetadata = {
    name: string;
    title: string;
    files: string[];
};
export declare function fetchMultipleComponentDetails(nameOrNames?: string | string[]): Promise<BlockMetadata[]>;
export {};
