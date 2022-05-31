import { createNanoEvents } from "nanoevents";
import { GameObject, Runtime, Scene } from "trident";
import { FileData } from "../UI/LayoutProject";

export interface IEvents {
    onLayoutLoaded: () => void;
    
    onRuntimeLoaded: (runtime: Runtime) => void;

    onSceneChanged: (scene: Scene) => void;
    onSceneGameObjectSelected: (gameObject: GameObject) => void;
    onSceneDeserialized: (scene: Scene) => void;
    onSceneGameObjectsCleared: (scene: Scene) => void;
    
    onHierarchySelected: (gameObject: GameObject) => void;
    
    onGameObjectCreated: (gameObject: GameObject) => void;
    onGameObjectDeleted: (gameObject: GameObject) => void;
    onGameObjectNameChanged: (gameObject: GameObject, name: string) => void;
    onGameObjectComponentsChanged: (gameObject: GameObject) => void;
    onGameObjectComponentUpdated: (gameObject: GameObject) => void;

    onFileBrowserInitialized: () => void;

    onProjectFileSelected: (item: FileData) => void;

    onTopbarMoveClicked: () => void;
    onTopbarRotateClicked: () => void;
    onTopbarScaleClicked: () => void;

    onRequestSelectedItemDeletion: () => void;
    onRequestCreateFolder: () => void;
    onRequestCreateMaterial: () => void;
    onRequestCreateScript: () => void;
    onRequestCreateScene: () => void;

    onLoad: () => void;
    onPlay: () => void;
    onStop: () => void;

    onDebugMessage: (message: string, type: "error" | "warn" | "log") => void;
}


export const EventEmitter = createNanoEvents<IEvents>();