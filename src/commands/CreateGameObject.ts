import { GameObject, Scene } from "trident";

export function CreateGameObject(scene: Scene): GameObject {
    return new GameObject(scene);
}