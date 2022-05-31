import { ResourcesCache, Runtime, Scene, SceneSerializer } from "trident";
import { SceneDeserializerEditor } from "../helpers/SceneDeserializerEditor";
import * as Commands from './';

export function ReloadScene(scene: Scene): Promise<Scene> {
    return new Promise((resolve, reject) => {
        const currentSceneSerialized = SceneSerializer.Serialize(scene);
        Commands.ClearGameObjects(scene);
        ResourcesCache.clear();
        SceneDeserializerEditor.Deserialize(currentSceneSerialized)
        .then(scene => {
            Commands.SetActiveScene(scene);
            resolve(scene);
        })
    })
}