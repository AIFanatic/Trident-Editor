import { Runtime, Scene } from "trident";

export function SetActiveScene(scene: Scene) {
    Runtime.SceneManager.SetActiveScene(scene);
    document.title = "Trident-UI: " + scene.name;
}