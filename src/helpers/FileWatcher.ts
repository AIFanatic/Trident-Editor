import { createNanoEvents, Emitter } from "nanoevents";
import { FileBrowser } from "./FileBrowser";


export interface IWatchFile {
    path: string;
    handle: FileSystemFileHandle | FileSystemDirectoryHandle;
    lastModified: number;
};

export interface IWatchDirectory {
    path: string;
    handle: FileSystemDirectoryHandle;
    files: Map<string, IWatchFile>;
};

interface FileWatcherEvents {
    onFileCreated: (path: string, file: FileSystemFileHandle) => void;
    onFileChanged: (path: string, file: FileSystemFileHandle) => void;
    onFileDeleted: (path: string, file: FileSystemFileHandle) => void;

    onDirectoryCreated: (path: string, directory: FileSystemDirectoryHandle) => void;
    onDirectoryDeleted: (path: string, directory: FileSystemDirectoryHandle) => void;
};

export class FileWatcher {
    private watches: Map<string, IWatchDirectory>;
    private eventEmitter: Emitter<FileWatcherEvents>;

    constructor() {
        this.watches = new Map();
        this.eventEmitter = createNanoEvents<FileWatcherEvents>();

        // setInterval(() => {
        this.updateV2();
        // }, 1000);
    }

    public onFileCreated(callback: FileWatcherEvents["onFileCreated"]) {
        console.log("onFileCreated")
        this.eventEmitter.on("onFileCreated", (path, file) => {callback(path, file)});
    }
    public onFileChanged(callback: FileWatcherEvents["onFileChanged"]) {
        console.log("onFileChanged")
        this.eventEmitter.on("onFileChanged", (path, file) => {callback(path, file)});
    }
    public onFileDeleted(callback: FileWatcherEvents["onFileDeleted"]) {
        console.log("onFileDeleted")
        this.eventEmitter.on("onFileDeleted", (path, file) => {callback(path, file)});
    }

    public onDirectoryCreated(callback: FileWatcherEvents["onDirectoryCreated"]) {
        console.log("onDirectoryCreated")
        this.eventEmitter.on("onDirectoryCreated", (path, directory) => {callback(path, directory)});
    }
    public onDirectoryDeleted(callback: FileWatcherEvents["onDirectoryDeleted"]) {
        console.log("onDirectoryDeleted")
        this.eventEmitter.on("onDirectoryDeleted", (path, directory) => {callback(path, directory)});
    }

    public watch(directoryPath: string) {
        FileBrowser.opendir(directoryPath).then(directoryHandle => {
            this.watches.set(directoryPath, {
                path: directoryPath,
                handle: directoryHandle,
                files: new Map()
            });
        })
        .catch(error => {
            console.warn ("error", error)
        })
    }

    public unwatch(directoryPath: string) {
        if (this.watches.has(directoryPath)) {
            this.watches.delete(directoryPath);
        }
    }

    public getWatchMap(): Map<string, IWatchDirectory> {
        return this.watches;
    }

    private async updateV2() {
        return new Promise<void>(async (resolve, reject) => {
            for (let watchPair of this.watches) {
                const directoryPath = watchPair[0];
                const directoryWatch = watchPair[1];

                if (directoryPath[0] == ".") continue;
    
                const directoryPathExists = await FileBrowser.exists(directoryPath);
                if (!directoryPathExists) {
                    this.watches.delete(directoryPath);
                    this.eventEmitter.emit("onDirectoryDeleted", directoryPath, directoryWatch.handle);
                    continue;
                }
    
                for (let watchFilesPair of directoryWatch.files) {
                    const watchFilePath = watchFilesPair[0];
                    const watchFile = watchFilesPair[1];

                    const fileExists = await FileBrowser.exists(watchFilePath);
                    if (!fileExists) {
                        directoryWatch.files.delete(watchFile.path);
                        if (watchFile.handle instanceof FileSystemFileHandle) {
                            this.eventEmitter.emit("onFileDeleted", watchFile.path, watchFile.handle);
                        }
                    }
                }
    
                const files = await FileBrowser.readdir(directoryWatch.handle);
                for (let file of files) {
                    if (file.name[0] == ".") continue;

                    if (file.kind == "file") {
                        const fileHandle = await file.getFile();
                        const filePath = directoryPath + "/" + file.name;
    
                        if (!directoryWatch.files.has(filePath)) {
                            directoryWatch.files.set(filePath, {
                                path: filePath,
                                handle: file,
                                lastModified: fileHandle.lastModified
                            })
                            this.eventEmitter.emit("onFileCreated", filePath, file as FileSystemFileHandle);
                        }
                        else {
                            const storedFile = directoryWatch.files.get(filePath);
                            if (storedFile.lastModified != fileHandle.lastModified) {
                                storedFile.lastModified = fileHandle.lastModified;
                                this.eventEmitter.emit("onFileChanged", filePath, file as FileSystemFileHandle);
                            }
                        }
                    }
                    else if (file.kind == "directory") {
                        const directoryDirectoryPath = directoryPath + "/" + file.name;
                        if (!directoryWatch.files.has(directoryDirectoryPath)) {
                            directoryWatch.files.set(directoryDirectoryPath, {
                                path: directoryDirectoryPath,
                                handle: file,
                                lastModified: 0
                            })
                            this.eventEmitter.emit("onDirectoryCreated", directoryDirectoryPath, file);
                        }
                    }
                }
            }

            resolve();
        }).then(() => {
            setTimeout(() => {
                this.updateV2();
            }, 1000);
        })
    }
}