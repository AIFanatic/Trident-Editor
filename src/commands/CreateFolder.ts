import { FileBrowser, MODE } from "../helpers/FileBrowser";

export function CreateFolder(path: string, name:string): Promise<FileSystemDirectoryHandle> {
    return FileBrowser.mkdir(`${path}/${name}`);
}