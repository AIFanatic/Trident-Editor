import React from 'react';
import { Scene, SceneSerializer, THREE } from 'trident';
import { EventEmitter } from '../events/IEvents';
import { ExtendedDataTransfer } from '../helpers/ExtendedDataTransfer';
import { ITreeMap, ITreeMapType } from './Components/TreeView/ITreeMap';
import { Tree } from './Components/TreeView/Tree';

import * as Commands from '../commands';
import { RegisteredComponents } from '../helpers/RegisteredComponents';
import { FileWatcher } from '../helpers/FileWatcher';
import { StringUtils } from '../helpers/StringUtils';
import { ResourcesCacheEntry } from 'trident/dist/esm/resources/ResourcesCache';
import { FileBrowser } from '../helpers/FileBrowser';

export interface FileData {
    file: FileSystemDirectoryHandle | FileSystemFileHandle;
    instance: any;
}

interface ProjectTreeMap extends ITreeMap {
    data?: FileData
};

interface LayoutProjectProps {};
interface LayoutProjectState {
    currentTreeMap: Map<string, ProjectTreeMap>;
    selectedItem: ProjectTreeMap;
    scene: Scene;
};

export class LayoutProject extends React.Component<LayoutProjectProps, LayoutProjectState> {
    private fileWatcher: FileWatcher;

    private SerializeMeshStandardMaterial(material: THREE.MeshStandardMaterial) {
        let map = material.map ? material.map : null;
        // let normalMap...
        // ....

        if (map) material.map = null;

        const materialJson = material.toJSON();

        if (map && material.map && material.map["userData"]) {
            materialJson.map = material.map["userData"];
            material.map = map;
        }

        return materialJson;
    }

    constructor(props) {
        super(props);

        /********TEST */
        const meshStandardMaterial = new THREE.MeshStandardMaterial();
        const loader = new THREE.TextureLoader();
        loader.load("./crate.jpg", (texture) => {
            console.time("run");
            meshStandardMaterial.map = texture;
            
            const materialJson = this.SerializeMeshStandardMaterial(meshStandardMaterial);

            console.log("materialJson", materialJson)
            // const meta = {
            //     textures: {},
            //     images: {}
            // };

            // console.log("meta", meta)
            // const json = meshStandardMaterial.toJSON(meta);

            // // json.textures = meta.textures;
            // // json.images = meta.images;
            
            // console.log(meshStandardMaterial)
            // console.log("json", json)
            // console.timeEnd("run");

            // // const loader = new THREE.MaterialLoader();
            // // const texts = {};
            // // texts[meshStandardMaterial.map.uuid] = meta.textures[meshStandardMaterial.map.uuid]
            // // console.log("texts", texts)
            // // loader.setTextures(texts)
            // // const mat = loader.parse(json)
            // // console.log(mat)
        } );
        /********TEST */
        this.fileWatcher = new FileWatcher();
        this.state = {selectedItem: null, currentTreeMap: new Map(), scene: null};

        EventEmitter.on("onFileBrowserInitialized", () => {
            this.fileWatcher.onFileCreated((path, file) => {
                this.onFileOrDirectoryCreated(path, file);
            })
            this.fileWatcher.onFileChanged((path, file) => {
                this.onFileOrDirectoryChanged(path, file);
            })
            this.fileWatcher.onFileDeleted((path, file) => {
                this.onFileOrDirectoryDeleted(path, file);
            })
            this.fileWatcher.onDirectoryCreated((path, file) => {
                this.fileWatcher.watch(path);
                this.onFileOrDirectoryCreated(path, file);
            })
            this.fileWatcher.onDirectoryDeleted((path, file) => {
                this.onFileOrDirectoryDeleted(path, file);
            })

            this.fileWatcher.watch("");
            this.forceUpdate();


            const a = FileBrowser.opendir("/Assets/Resources");
            console.log(a)
        })

        EventEmitter.on("onSceneChanged", (scene) => {
            this.setState({scene: scene});
        })

        EventEmitter.on("onRequestCreateFolder", () => {
            const folderPath = this.state.selectedItem && this.state.selectedItem.data.file.kind == "directory" ? this.state.selectedItem.id : "";
            Commands.CreateFolder(folderPath, "New Folder")
            // .then(folderHandle => {
            //     this.addFilesFromPathToCurrentTreeMap(folderPath)
            //     .then(() => {
            //         this.forceUpdate();
            //     })
            // })
        });

        EventEmitter.on("onRequestCreateMaterial", () => {
            const materialPath = this.state.selectedItem && this.state.selectedItem.data.file.kind == "directory" ? this.state.selectedItem.id : "";
            const material = new THREE.MeshStandardMaterial();

            Commands.CreateMaterialFile(materialPath, "New Material", material);
        });

        EventEmitter.on("onRequestCreateScript", () => {
            const scriptPath = this.state.selectedItem && this.state.selectedItem.data.file.kind == "directory" ? this.state.selectedItem.id : "";
            Commands.CreateScriptFile(scriptPath, "NewComponent");
        });

        EventEmitter.on("onRequestCreateScene", () => {
            const scenePath = this.state.selectedItem && this.state.selectedItem.data.file.kind == "directory" ? this.state.selectedItem.id : "";
            Commands.CreateSceneFile(scenePath, "New Scene");
        });

        EventEmitter.on("onHierarchySelected", () => {
            if (this.state.selectedItem) {
                this.state.selectedItem.isSelected = false;
                // EventEmitter.emit("onProjectFileSelected", null);
                this.setState({selectedItem: null});
            }
        });

        EventEmitter.on("onRequestSelectedItemDeletion", () => {
            if (this.state.selectedItem) {

                const currentSceneSerialized = SceneSerializer.Serialize(this.state.scene);

                Commands.DeleteFile(this.state.selectedItem.id)
                .then(() => {
                })
            }
        });
    }

    private ReloadScene() {
        if (this.state.selectedItem && this.state.selectedItem.data) {
            if (this.state.selectedItem.data.file.kind == "file" && this.state.selectedItem.data.instance) {
                this.state.selectedItem.data.instance = null;
            }
            if (this.state.currentTreeMap.has(this.state.selectedItem.id)) {
                this.state.currentTreeMap.delete(this.state.selectedItem.id);
            }
        }

        Commands.ReloadScene(this.state.scene).then(newScene => {
            EventEmitter.emit("onSceneChanged", newScene);
            this.forceUpdate();
        })
    }

    private onFileOrDirectoryCreated(path: string, file: FileSystemDirectoryHandle | FileSystemFileHandle) {
        if (!this.state.currentTreeMap.has(path)) {
            this.state.currentTreeMap.set(path, {
                id: path,
                name: file.name,
                isSelected: false,
                parent: StringUtils.Dirname(path) == path ? null : StringUtils.Dirname(path),
                type: file instanceof FileSystemFileHandle ? ITreeMapType.File : ITreeMapType.Folder,
                data: {
                    file: file,
                    instance: null
                }
            })
            this.forceUpdate();
        }
    }

    private onFileOrDirectoryDeleted(path: string, file: FileSystemDirectoryHandle | FileSystemFileHandle) {
        if (this.state.currentTreeMap.has(path)) {
            this.state.currentTreeMap.delete(path);
            this.ReloadScene()
        }
    }

    private onFileOrDirectoryChanged(path: string, file: FileSystemDirectoryHandle | FileSystemFileHandle) {
        if (this.state.currentTreeMap.has(path)) {
            this.state.currentTreeMap.set(path, {
                id: path,
                name: file.name,
                isSelected: false,
                parent: StringUtils.Dirname(path) == path ? null : StringUtils.Dirname(path),
                type: file instanceof FileSystemFileHandle ? ITreeMapType.File : ITreeMapType.Folder,
                data: {
                    file: file,
                    instance: null
                }
            })
            this.forceUpdate();
        }
    }

    private onDropped(from, to) {
    }

    private async onItemDoubleClicked(item: ProjectTreeMap) {
        const extension = item.id.substr(item.id.lastIndexOf('.') + 1).toUpperCase();
        if (extension == "SCENE") {
            if (item.data.instance) {
                const scene = item.data.instance;
                Commands.SetActiveScene(scene);
                EventEmitter.emit("onSceneChanged", scene);
            }
        }
    }

    private LoadFile(item: ProjectTreeMap) {
        return new Promise<ResourcesCacheEntry>((resolve, reject) => {
            console.log("loading instance for", item)
            Commands.LoadFile(item.id).then(instance => {
                item.data.instance = instance;
                // Scripts get added to RegisteredComponents
                if (typeof item.data.instance == "function") {
                    RegisteredComponents.set(item.id, item.data.instance);
                }
    
                resolve(instance);
            })
        })
    }

    private async onItemClicked(item: ProjectTreeMap) {
        if (!item.data.instance) {
            await this.LoadFile(item);
        }
        EventEmitter.emit("onProjectFileSelected", item.data);

        if (this.state.selectedItem) {
            this.state.selectedItem.isSelected = false;
        }
        item.isSelected = true;
        this.setState({selectedItem: item});
    }
    
    private onToggled(item: ProjectTreeMap) {
        // this.addFilesFromPathToCurrentTreeMap(item.id)
        // .then(() => {
        //     this.forceUpdate();
        // })
    }

    private onDragStarted(event: React.DragEvent<HTMLDivElement>, item: ProjectTreeMap) {

        const validation = (fileInstance, existingProperty: Function) => {
            console.log("validation", fileInstance, existingProperty)
            if (fileInstance instanceof THREE.BufferGeometry) {
                if (existingProperty instanceof THREE.Geometry || existingProperty instanceof THREE.BufferGeometry) {
                    return true;
                }
            }
            else if (fileInstance instanceof THREE.Material) {
                if (existingProperty instanceof THREE.Material) {
                    return true;
                }
            }
            else if (fileInstance instanceof THREE.Texture) {
                if (existingProperty instanceof THREE.Texture) {
                    return true;
                }
            }

            return false;
        }

        if (!item.data.instance) {
            this.LoadFile(item).then(() => {
                ExtendedDataTransfer.set({
                    data: item.data.instance,
                    validation: validation
                })
            })
        }

        ExtendedDataTransfer.set({
            data: item.data.instance,
            validation: validation
        });
    }

    private onPanelClicked(event) {
        this.state.selectedItem.isSelected = false;
        this.setState({selectedItem: null});
        EventEmitter.emit("onProjectFileSelected", null);
        this.forceUpdate();
    }

    public render() {
        if (this.state.currentTreeMap.size == 0) return;

        // Temp
        let treeMapArr: ProjectTreeMap[] = [];
        for (let entry of this.state.currentTreeMap) {
            treeMapArr.push(entry[1]);
        }

        treeMapArr.sort(function(a, b) {
            if ((a.type == ITreeMapType.Folder) != (b.type == ITreeMapType.Folder)) {        // Is one a folder and
               return (a.type == ITreeMapType.Folder ? -1 : 1);       //  the other a file?
            }                                      // If not, compare the
            return a.name.localeCompare(b.name);   //  the names.
        });

        return (
            <div
                style={{
                    overflow: "auto",
                    height: "100%"
                }}
                onClick={(event) => { this.onPanelClicked(event)}}
            >
                <Tree 
                    onToggled={(item) => this.onToggled(item)}
                    onDropped={(from, to) => this.onDropped(from, to)}
                    onClicked={(data) => this.onItemClicked(data)}
                    onDoubleClicked={(data) => this.onItemDoubleClicked(data)}
                    data={treeMapArr}
                    onDragStarted={(event, data) => this.onDragStarted(event, data)}
                />
            </div>
        )
    }
}