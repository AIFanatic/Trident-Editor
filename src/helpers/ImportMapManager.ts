import { FileBrowser, MODE } from "./FileBrowser";

class _ImportMapManager {
    private element: HTMLElement;
    private importMap: {imports: {}};

    constructor(id) {
        this.element = document.getElementById(id);
        this.importMap = JSON.parse(this.element.textContent);
    }

    public set(name, path) {
        this.importMap.imports[name] = path;
        this.element.textContent = JSON.stringify(this.importMap, null, 2);
    }

    private relativeToAbsolutePath(base, rel) {
        var st = base.split("/");
        var arr = rel.split("/");
        st.pop(); // ignore the current file name (or no string)
       // (ignore if "base" is the current folder without having slash in trail)
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == ".")
                continue;
            if (arr[i] == "..")
                st.pop();
            else
                st.push(arr[i]);
        }
        return st.join("/");
    }

    private async replaceAsync(str, regex, asyncFn) {
        const promises = [];
        str.replace(regex, (match, ...args) => {
            const promise = asyncFn(match, ...args);
            promises.push(promise);
        });
        const data = await Promise.all(promises);
        return str.replace(regex, () => data.shift());
    }

    // TODO: Clean this
    private replaceImportsWithImportMap(path, importStr, importMap) {
        const directory = path.split("/").slice(0, -1).join("/") + "/";
        const filename = path.split("/").slice(-1)[0];
        const importStrReplaced = this.replaceAsync(importStr, /(import\s+(?:[^;]*\s+from\s+)?['"])(.+)(['"](?:;|$))/mg, async (match, p1, p2, p3) => {
            console.log("Resolving import for", match);
            if (importMap.imports[p2]) {
                return `${p1}${importMap.imports[p2]}${p3}`;
            }
            else if (p2[0] == "." || p2[0] == "/") {
                // Resolve relative import path
                const base = p2[0] == "." ? directory : "/";
                const absolutePath = this.relativeToAbsolutePath(base, p2);
                if (importMap.imports[absolutePath]) {
                    return `${p1}${importMap.imports[absolutePath]}${p3}`;
                }
                else {
                    console.log("Attempting to load", absolutePath);
                    // Import still not found, attempt to load it
                    const dependencyFileHandle = await FileBrowser.fopen(absolutePath, MODE.R);
                    if (dependencyFileHandle) {
                        console.log("Got it", dependencyFileHandle)
                        const file = await dependencyFileHandle.getFile()
                        const instance = await this.import(absolutePath, file);

                        return `${p1}${importMap.imports[absolutePath]}${p3}`;
                    }
                }
            }
            return match;
        });
        return importStrReplaced;
    }

    public async import(path, file) {
        return new Promise((resolve, reject) => {
            // Get file text contents
            file.text()
            .then(async text => {
                // Replace "imports" with their equivalents from importMap
                const mappedText = await this.replaceImportsWithImportMap(path, text, this.importMap)
                // Create a new file with the modified contents
                const newFile = new File([mappedText], file.name, {type: "text/javascript"})
                // Create a url so it can be imported later
                const url = URL.createObjectURL(newFile);
                // Import the newly created file using the native api.
                // All the imports should be mapped according to importMaps
                import(url)
                .then(componentModule => {
                    // Update the importMap with the new file so other files can use/import it.
                    this.set(path, url);

                    resolve(componentModule);
                    // // Get the module export
                    // // TODO: Multiple exports not supported
                    // const keys = Object.keys(componentModule);
                    // if (keys.length > 0) {
                    //     const component = componentModule[keys[0]];
                    //     // Update the importMap with the new file so other files can use/import it.
                    //     this.set(path, url);

                    //     resolve(component);
                    // }
                })
            })
            
        })
    }
}

export const ImportMapManager = new _ImportMapManager("importmap");