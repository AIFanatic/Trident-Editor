import { Scene } from "trident";

export function ClearGameObjects(scene: Scene) {
    for (let i = scene.gameObjects.length - 1; i >= 0; i--) {
        const gameObject = scene.gameObjects[i];
        gameObject.Destroy();
    }
}