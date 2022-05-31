import { Resources, ResourcesCache, Scene } from "trident";
import { Component } from "trident/dist/esm/components";
import { FileType, IFile } from "trident/dist/esm/interfaces/IFile";
import { ResourceExtensions } from "trident/dist/esm/resources/Resources";
import { ResourcesCacheEntry } from "trident/dist/esm/resources/ResourcesCache";
import { FileBrowser, MODE } from "./FileBrowser";
import { ImportMapManager } from "./ImportMapManager";
import { SceneDeserializerEditor } from "./SceneDeserializerEditor";
import { StringUtils } from "./StringUtils";

export class ResourcesEditor extends Resources {
    public static LoadComponentAsync(path: string, fileId: string, file?: File): Promise<Component> {
        const promise = new Promise<Component>((resolve, reject) => {
            ImportMapManager.import(path, file).then(component => {
                const componentKeys = Object.keys(component);
                if (componentKeys.length > 0) {
                    const key = componentKeys[0];
                    const userData: IFile = {
                        type: FileType.COMPONENT,
                        fileId: fileId
                    };
                    component[key].prototype.userData = userData;
                    resolve(component[key])
                }
            })
        });
        
        ResourcesCache.set(fileId, promise);

        return promise;
    }

    public static LoadSceneAsync(path: string, fileId: string) {
        const promise = new Promise<Scene>((resolve, reject) => {
            fetch(path)
                .then(response => response.json())
                .then((sceneSerialized) => {
                    SceneDeserializerEditor.Deserialize(sceneSerialized)
                    .then(scene => {
                        scene.name = StringUtils.GetNameForPath(fileId);
                        const userData: IFile = {
                            type: FileType.COMPONENT,
                            fileId: fileId
                        };
                        scene.userData = userData;
                        resolve(scene);
                    })
                })
                .catch(error => {
                    reject(error);
                });
        });
        ResourcesCache.set(fileId, promise);
        return promise;
    }
    
    public static async LoadAsync(path: string): Promise<ResourcesCacheEntry> {
        if (ResourcesCache.has(path)) {
            return ResourcesCache.get(path);
        }

        const fileHandle = await FileBrowser.fopen(path, MODE.R);
        const file = await fileHandle.getFile();

        const extension = path.substr(path.lastIndexOf('.') + 1).toUpperCase();
        const url = URL.createObjectURL(file)
        if (extension == ResourceExtensions.MATERIAL) {
            return ResourcesEditor.LoadMaterialAsync(url, path)
        }
        else if (extension == ResourceExtensions.MESH_OBJ) {
            return ResourcesEditor.LoadMeshAsync(url, ResourceExtensions.MESH_OBJ, path);
        }
        else if (extension == ResourceExtensions.COMPONENT) {
            return ResourcesEditor.LoadComponentAsync(path, path, file);
        }
        else if (extension == ResourceExtensions.SCENE) {
            return ResourcesEditor.LoadSceneAsync(url, path);
        }
        else if (extension == ResourceExtensions.TEXTURE_HDR) {
            return ResourcesEditor.LoadTextureAsync(url, path, ResourceExtensions.TEXTURE_HDR);
        }
        else if (extension == ResourceExtensions.TEXTURE_TGA) {
            return ResourcesEditor.LoadTextureAsync(url, path, ResourceExtensions.TEXTURE_TGA);
        }
        else if (extension == ResourceExtensions.TEXTURE_JPG) {
            return ResourcesEditor.LoadTextureAsync(url, path, ResourceExtensions.TEXTURE_JPG);
        }
        else if (extension == ResourceExtensions.TEXTURE_BMP) {
            return ResourcesEditor.LoadTextureAsync(url, path, ResourceExtensions.TEXTURE_BMP);
        }
        else if (extension == ResourceExtensions.TEXTURE_PNG) {
            return ResourcesEditor.LoadTextureAsync(url, path, ResourceExtensions.TEXTURE_PNG);
        }
    }

    // public static async LoadAsyncFile(path: string, file: File): Promise<ResourcesCacheEntry> {
    //     if (ResourcesCache.has(path)) {
    //         return ResourcesCache.get(path);
    //     }

    //     const extension = path.substr(path.lastIndexOf('.') + 1).toUpperCase();
    //     const url = URL.createObjectURL(file)
    //     if (extension == ResourceExtensions.MATERIAL) {
    //         return Resources.LoadMaterialAsync(url, path)
    //     }
    //     else if (extension == ResourceExtensions.MESH_OBJ) {
    //         return Resources.LoadMeshAsync(url, ResourceExtensions.MESH_OBJ, path);
    //     }
    //     else if (extension == ResourceExtensions.COMPONENT) {
    //         return ResourcesEditor.LoadComponentAsync(path, path, file);
    //     }
    //     else if (extension == ResourceExtensions.SCENE) {
    //         return ResourcesEditor.LoadSceneAsync(url, path);
    //     }
    //     else if (extension == ResourceExtensions.TEXTURE_HDR) {
    //         return Resources.LoadTextureAsync(url, path, ResourceExtensions.TEXTURE_HDR);
    //     }
    //     else if (extension == ResourceExtensions.TEXTURE_TGA) {
    //         return Resources.LoadTextureAsync(url, path, ResourceExtensions.TEXTURE_TGA);
    //     }
    //     else if (extension == ResourceExtensions.TEXTURE_JPG) {
    //         return Resources.LoadTextureAsync(url, path, ResourceExtensions.TEXTURE_JPG);
    //     }
    //     else if (extension == ResourceExtensions.TEXTURE_BMP) {
    //         return Resources.LoadTextureAsync(url, path, ResourceExtensions.TEXTURE_BMP);
    //     }
    //     else if (extension == ResourceExtensions.TEXTURE_PNG) {
    //         return Resources.LoadTextureAsync(url, path, ResourceExtensions.TEXTURE_PNG);
    //     }
    // }
}