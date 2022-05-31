import React from 'react';
import { GameObject, PrimitiveType, Scene, SceneSerializer, Components } from 'trident';
import { EventEmitter } from '../events/IEvents';
import { FileBrowser, MODE } from '../helpers/FileBrowser';
import { Menu } from './Components/MenuDropdown/Menu';
import { MenuDropdown } from './Components/MenuDropdown/MenuDropdown';
import { MenuItem } from './Components/MenuDropdown/MenuItem';

import * as Commands from '../commands';
import { LightTypes } from '../commands/CreateLight';
import { IFile } from 'trident/dist/esm/interfaces/IFile';

const MENU = {
    FILE: {
        text: "File",
        options: {
            OPEN_PROJECT: {
                text: "Open Project..."
            },
            SAVE_PROJECT: {
                text: "Save Project"
            }
        }
    },
    EDIT: {
        text: "Edit",
        options: {
            DELETE: {
                text: "Delete"
            }
        }
    },
    ASSETS: {
        text: "Assets",
        options: {
            CREATE: {
                text: "Create",
                options: {
                    FOLDER: {
                        text: "Folder"
                    },
                    SCRIPT: {
                        text: "Script"
                    },
                    MATERIAL: {
                        text: "Material"
                    },
                    SCENE: {
                        text: "Scene"
                    }
                }
            },
        }
    },
    GAMEOBJECT: {
        text: "GameObject",
        options: {
            CREATE_EMPTY: {
                text: "Create Empty"
            },
            PRIMITIVES: {
                text: "3D Object",
                options: {
                    CUBE: {
                        text: "Cube"
                    },
                    CAPSULE: {
                        text: "Capsule"
                    },
                    PLANE: {
                        text: "Plane"
                    },
                    SPHERE: {
                        text: "Sphere"
                    },
                    CYLINDER: {
                        text: "Cylinder"
                    }
                }
            },
            LIGHTS: {
                text: "Lights",
                options: {
                    DIRECTIONALLIGHT: {
                        text: "Directional Light"
                    },
                    POINTLIGHT: {
                        text: "Point Light"
                    },
                    SPOTLIGHT: {
                        text: "Spot Light"
                    },
                    AREALIGHT: {
                        text: "Area Light"
                    }
                }
            }
        }
    }
}

interface LayoutNavbarProps {};

interface LayoutNavbarState {
    scene: Scene;
    gameObject: GameObject;
};

export class LayoutNavbar extends React.Component<LayoutNavbarProps, LayoutNavbarState> {

    constructor(props) {
        super(props);
        this.state = {scene: null, gameObject: null};

        EventEmitter.on("onSceneChanged", (scene) => {
            this.setState({scene: scene});
        });

        EventEmitter.on("onHierarchySelected", (gameObject) => {
            this.setState({gameObject: gameObject});
        });
    }

    private openProject() {
        console.log("open project");
        FileBrowser.init()
        .then(() => {
            EventEmitter.emit("onFileBrowserInitialized");
        })
    }

    private saveProject() {
        const sceneSerialized = SceneSerializer.Serialize(this.state.scene);
        const file: IFile = this.state.scene.userData;
        const path = this.state.scene.userData && file.fileId ? file.fileId : "Default scene.scene";
        FileBrowser.fopen(path, MODE.W)
        .then(file => {
            FileBrowser.fwrite(file, JSON.stringify(sceneSerialized, null, 2));
        })
    }

    private createEmptyGameObject() {
        const gameObject = Commands.CreateGameObject(this.state.scene);
        EventEmitter.emit("onGameObjectCreated", gameObject);
    }

    private deleteGameObject() {
        EventEmitter.emit("onRequestSelectedItemDeletion");
    }

    private createPrimitive(primitive: PrimitiveType) {
        if (!this.state.scene) return;

        const gameObject = Commands.CreatePrimitive(this.state.scene, primitive);

        EventEmitter.emit("onGameObjectCreated", gameObject);
        EventEmitter.emit("onHierarchySelected", gameObject);
    }

    private createLight(type: LightTypes) {
        if (!this.state.scene) return;

        const gameObject = Commands.CreateLight(this.state.scene, type);

        EventEmitter.emit("onGameObjectCreated", gameObject);
        EventEmitter.emit("onHierarchySelected", gameObject);
    }

    private createFolder() {
        EventEmitter.emit("onRequestCreateFolder");
    }

    private createMaterial() {
        EventEmitter.emit("onRequestCreateMaterial");
    }

    private createScript() {
        EventEmitter.emit("onRequestCreateScript");
    }

    private createScene() {
        EventEmitter.emit("onRequestCreateScene");
    }

    public render() {
        return <div>

            <Menu
                name={MENU.FILE.text}
            >
                <MenuItem
                    name={MENU.FILE.options.OPEN_PROJECT.text}
                    onClicked={() => {this.openProject()}}
                />
                <MenuItem
                    name={MENU.FILE.options.SAVE_PROJECT.text}
                    onClicked={() => {this.saveProject()}}
                />
            </Menu>

            <Menu
                name={MENU.EDIT.text}
            >
                <MenuItem
                    name={MENU.EDIT.options.DELETE.text}
                    // disabled={this.state.gameObject ? false : true}
                    onClicked={() => {this.deleteGameObject()}}
                />
            </Menu>
            
            <Menu
                name={MENU.ASSETS.text}
            >
                <MenuDropdown
                    name={MENU.ASSETS.options.CREATE.text}
                >
                    <MenuItem
                        name={MENU.ASSETS.options.CREATE.options.FOLDER.text}
                        onClicked={() => {this.createFolder()}}
                    />
                    <MenuItem
                        name={MENU.ASSETS.options.CREATE.options.MATERIAL.text}
                        onClicked={() => {this.createMaterial()}}
                    />
                    <MenuItem
                        name={MENU.ASSETS.options.CREATE.options.SCRIPT.text}
                        onClicked={() => {this.createScript()}}
                    />
                    <MenuItem
                        name={MENU.ASSETS.options.CREATE.options.SCENE.text}
                        onClicked={() => {this.createScene()}}
                    />
                </MenuDropdown>
            </Menu>
            
            <Menu
                name={MENU.GAMEOBJECT.text}
            >
                <MenuItem
                    name={MENU.GAMEOBJECT.options.CREATE_EMPTY.text}
                    onClicked={() => {this.createEmptyGameObject()}}
                />
                <MenuDropdown
                    name={MENU.GAMEOBJECT.options.PRIMITIVES.text}
                >
                    <MenuItem
                        name={MENU.GAMEOBJECT.options.PRIMITIVES.options.CUBE.text}
                        onClicked={() => {this.createPrimitive(PrimitiveType.Cube)}}
                    />
                    <MenuItem
                        name={MENU.GAMEOBJECT.options.PRIMITIVES.options.CAPSULE.text}
                        onClicked={() => {this.createPrimitive(PrimitiveType.Capsule)}}
                    />
                    <MenuItem
                        name={MENU.GAMEOBJECT.options.PRIMITIVES.options.PLANE.text}
                        onClicked={() => {this.createPrimitive(PrimitiveType.Plane)}}
                    />
                    <MenuItem
                        name={MENU.GAMEOBJECT.options.PRIMITIVES.options.SPHERE.text}
                        onClicked={() => {this.createPrimitive(PrimitiveType.Sphere)}}
                    />
                    <MenuItem
                        name={MENU.GAMEOBJECT.options.PRIMITIVES.options.CYLINDER.text}
                        onClicked={() => {this.createPrimitive(PrimitiveType.Cylinder)}}
                    />
                </MenuDropdown>

                <MenuDropdown
                    name={MENU.GAMEOBJECT.options.LIGHTS.text}
                >
                    <MenuItem
                        name={MENU.GAMEOBJECT.options.LIGHTS.options.DIRECTIONALLIGHT.text}
                        onClicked={() => {this.createLight(LightTypes.Directional)}}
                    />
                    <MenuItem
                        name={MENU.GAMEOBJECT.options.LIGHTS.options.POINTLIGHT.text}
                        onClicked={() => {this.createLight(LightTypes.Point)}}
                    />
                    <MenuItem
                        name={MENU.GAMEOBJECT.options.LIGHTS.options.SPOTLIGHT.text}
                        onClicked={() => {this.createLight(LightTypes.Spot)}}
                    />
                    <MenuItem
                        name={MENU.GAMEOBJECT.options.LIGHTS.options.AREALIGHT.text}
                        onClicked={() => {this.createLight(LightTypes.Area)}}
                    />
                </MenuDropdown>
            </Menu>
        </div>
    }
}