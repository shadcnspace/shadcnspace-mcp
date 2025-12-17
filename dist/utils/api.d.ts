export declare function fetchUIComponents(): Promise<any>;
export declare function fetchComponentDetails(name: string): Promise<{
    name: string;
    type: string;
    files: {
        content: string;
    }[];
}>;
export declare function fetchExampleComponents(): Promise<any>;
export declare function fetchExampleDetails(exampleName: string): Promise<{
    description: string;
    name: string;
    type: string;
    files: {
        content: string;
    }[];
}>;
