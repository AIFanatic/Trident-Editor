import { THREE } from "trident";
import { FileBrowser, MODE } from "../helpers/FileBrowser";

export function SaveMaterial(path: string, name:string, material: THREE.MeshStandardMaterial) {
    return FileBrowser.fopen(`${path}/${name}.mat`, MODE.W).then((fileHandle) => {
        /**
         * albedo -> map
         * metallic -> metalnessMap
         * normal map -> normalMap
         * height map -> bumpMap?
         * occlusion -> aoMap
         * detail mask -> displacementMap?
         * emissive -> emissiveMap
         */
        let map = material.map ? material.map : null;
        let metalnessMap = material.metalnessMap ? material.metalnessMap : null;
        let normalMap = material.normalMap ? material.normalMap : null;
        let bumpMap = material.bumpMap ? material.bumpMap : null;
        let aoMap = material.aoMap ? material.aoMap : null;
        let displacementMap = material.displacementMap ? material.displacementMap : null;
        let emissiveMap = material.emissiveMap ? material.emissiveMap : null;
    
        const materialJson = material.toJSON({
            textures: [],
            images: []
        });
    
        if (map && material.map && material.map["userData"]) {
            materialJson.map = material.map["userData"];
        }
        if (metalnessMap && material.metalnessMap && material.metalnessMap["userData"]) {
            materialJson.metalnessMap = material.metalnessMap["userData"];
        }
        if (normalMap && material.normalMap && material.normalMap["userData"]) {
            materialJson.normalMap = material.normalMap["userData"];
        }
        if (bumpMap && material.bumpMap && material.bumpMap["userData"]) {
            materialJson.bumpMap = material.bumpMap["userData"];
        }
        if (aoMap && material.aoMap && material.aoMap["userData"]) {
            materialJson.aoMap = material.aoMap["userData"];
        }
        // if (displacementMap && material.displacementMap && material.displacementMap["userData"]) {
        //     materialJson.displacementMap = material.displacementMap["userData"];
        // }
        if (emissiveMap && material.emissiveMap && material.emissiveMap["userData"]) {
            materialJson.emissiveMap = material.emissiveMap["userData"];
        }

        if (material.userData) {
            materialJson.userData = material.userData;
        }
    
        FileBrowser.fwrite(fileHandle, JSON.stringify(materialJson, null, 2));
    
        return materialJson;
    });
}