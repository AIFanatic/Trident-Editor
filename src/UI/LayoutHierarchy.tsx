import React from "react";

import { EventEmitter } from "../events/IEvents";
import { GameObject, Scene } from "trident";

import { ITreeMap } from './Components/TreeView/ITreeMap';
import { Tree } from './Components/TreeView/Tree';
import { ExtendedDataTransfer } from "../helpers/ExtendedDataTransfer";

import * as Commands from '../commands';

interface LayoutHierarchyProps {}
interface LayoutHierarchyState {
    scene: Scene;
    selectedGameObject: GameObject;
}

export class LayoutHierarchy extends React.Component<LayoutHierarchyProps, LayoutHierarchyState> {
    public state: LayoutHierarchyState;

    constructor(props: LayoutHierarchyProps) {
        super(props);
        this.state = {scene: null, selectedGameObject: null};

        EventEmitter.on("onSceneChanged", (scene) => {
            this.setState({scene: scene});
        })

        EventEmitter.on("onGameObjectNameChanged", (gameObject) => {
            this.setState({selectedGameObject: gameObject});
        })

        EventEmitter.on("onGameObjectCreated", (gameObject) => {
            this.setState({selectedGameObject: gameObject});
        });

        EventEmitter.on("onGameObjectDeleted", (gameObject) => {
            if (this.state.selectedGameObject === gameObject) {
                EventEmitter.emit("onHierarchySelected", null);
                this.setState({selectedGameObject: null});
            }
            this.forceUpdate();
        });

        EventEmitter.on("onSceneGameObjectSelected", (gameObject) => {
            this.setState({selectedGameObject: gameObject});
        });
        EventEmitter.on("onSceneDeserialized", () => {
            this.forceUpdate();
        });
        EventEmitter.on("onSceneGameObjectsCleared", () => {
            EventEmitter.emit("onHierarchySelected", null);
            this.setState({selectedGameObject: null});
            this.forceUpdate();
        });
        EventEmitter.on("onProjectFileSelected", () => {
            if (this.state.selectedGameObject) {
                // EventEmitter.emit("onHierarchySelected", null);
                this.setState({selectedGameObject: null});
                this.forceUpdate();
            }
        });

        EventEmitter.on("onRequestSelectedItemDeletion", () => {
            if (this.state.selectedGameObject) {
                Commands.DestroyGameObject(this.state.selectedGameObject);
                EventEmitter.emit("onGameObjectDeleted", this.state.selectedGameObject);
                EventEmitter.emit("onHierarchySelected", null);
                this.setState({selectedGameObject: null});
            }
        });
    }

    private getGameObjectFromUuid(scene: Scene, uuid: string): GameObject {
        for (let gameObject of this.state.scene.gameObjects) {
            if (gameObject.transform.uuid == uuid) {
                return gameObject;
            }
        }
        return null;
    }

    private onClicked(data: ITreeMap) {
        const gameObject = this.getGameObjectFromUuid(this.state.scene, data.id);
        if (gameObject) {
            this.setState({selectedGameObject: gameObject});
            EventEmitter.emit("onHierarchySelected", gameObject);
            this.forceUpdate();
        }
    }

    private onDropped(from: string, to: string) {
        if (from === to) return;

        const fromGameObject = this.getGameObjectFromUuid(this.state.scene, from);
        const toGameObject = this.getGameObjectFromUuid(this.state.scene, to);

        if (fromGameObject && toGameObject) {
            fromGameObject.transform.parent = toGameObject.transform;
            this.forceUpdate();
        }
    }

    private onDrop(event) {
        const fromUuid = event.dataTransfer.getData("from-uuid");
        const fromGameObject = this.getGameObjectFromUuid(this.state.scene, fromUuid);
        if (fromGameObject) {
            fromGameObject.transform.parent = null;
            this.forceUpdate();
        }
    }

    private onDragOver(event) {
        event.preventDefault();
    }

    private onPanelClicked(event) {
        EventEmitter.emit("onHierarchySelected", null);
        this.setState({selectedGameObject: null});
    }

    private onDragStarted(event, data) {
        console.log("DragStart LayoutHierarchy")
        console.log(data.view)

        const validation = (data, to) => {
            console.log("validation", data, to)
            return false;
        }
        ExtendedDataTransfer.set(event, {
            data: data.view,
            validation: validation
        });
    }

    private buildTreeFromGameObjects(gameObjects: GameObject[]): ITreeMap[] {
        const treeMap: ITreeMap[] = [];
        
        for (let gameObject of gameObjects) {
            treeMap.push({
                id: gameObject.transform.uuid,
                name: gameObject.name,
                isSelected: this.state.selectedGameObject && this.state.selectedGameObject == gameObject ? true : false,
                parent: gameObject.transform.parent ?  gameObject.transform.parent.uuid : "",
                data: gameObject
            })
        }
        return treeMap;
    }

    public render() {
        if (!this.state.scene) return;

        const nodes = this.buildTreeFromGameObjects(this.state.scene.gameObjects);

        return (
            <div
                style={{
                    height: "100%"
                }}
                onDrop={(event) => this.onDrop(event)}
                onDragOver={(event) => this.onDragOver(event)}
                onClick={(event) => { this.onPanelClicked(event)}}
            >
                <Tree
                    onDropped={(from, to) => this.onDropped(from, to)}
                    onClicked={(data) => this.onClicked(data)}
                    onDragStarted={(event, data) => this.onDragStarted(event, data)}
                    data={nodes}
                />
            </div>
        );
    }

};