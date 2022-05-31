export enum ITreeMapType {
    Folder,
    File
}

export interface ITreeMap {
    name: string;
    id: string;
    isSelected: boolean;
    parent: string;
    type?: ITreeMapType;
    data?: any;
}