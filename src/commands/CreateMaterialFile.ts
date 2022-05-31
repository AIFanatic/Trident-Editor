import { THREE } from "trident";
import { FileBrowser, MODE } from "../helpers/FileBrowser";

export function CreateMaterialFile(path: string, name:string, material: THREE.Material): Promise<FileSystemHandle> {
    return FileBrowser.fopen(`${path}/${name}.mat`, MODE.W)
    .then((fileHandle) => {
        return FileBrowser.fwrite(fileHandle, JSON.stringify(material.toJSON(), null, 2))
        .then(() => {
            return fileHandle;
        })
    })
}