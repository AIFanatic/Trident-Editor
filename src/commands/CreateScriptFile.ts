import { FileBrowser, MODE } from "../helpers/FileBrowser";

const DefaultScript = `import { Components } from '/Packages/Trident/trident-esm-bundle.js';

export class DefaultScript extends Components.Component{
    Awake() {
    }

    Start() {
    }
}`

export function CreateScriptFile(path: string, name:string): Promise<FileSystemHandle> {
    return FileBrowser.fopen(`${path}/${name}.js`, MODE.W)
    .then((fileHandle) => {
        const script = DefaultScript.replace("DefaultScript", name);
        return FileBrowser.fwrite(fileHandle, script)
        .then(() => {
            return fileHandle;
        })
    })
}