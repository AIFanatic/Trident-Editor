import { Physics, Renderer, Scene } from "trident";
import { ISceneSerialized } from "trident/dist/esm/serializer/ISceneSerialized";
import { UUID } from "trident/dist/esm/utils/UUID";
import { FileBrowser, MODE } from "../helpers/FileBrowser";

const DefaultScene = {
    "gameObjects": [
        {
            "uuid": "37b8c6f4-eaf7-43bf-8b38-ce030af78bc2",
            "name": "Main Camera",
            "transform": {
                "uuid": "25c75b7b-7ced-4531-b74e-5ac9a8d6354c",
                "position": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "rotation": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "scale": {
                    "x": 1,
                    "y": 1,
                    "z": 1
                },
                "parent": ""
            },
            "components": [
                {
                    "uuid": "a3a95f4c-c39e-43e0-8048-5a2a863fb29f",
                    "component": "Camera",
                    "properties": [
                        {
                            "name": "far",
                            "value": 1000,
                            "type": "NUMBER"
                        },
                        {
                            "name": "near",
                            "value": 0.1,
                            "type": "NUMBER"
                        },
                        {
                            "name": "fieldOfView",
                            "value": 60,
                            "type": "NUMBER"
                        }
                    ],
                    "file": null
                }
            ]
        },
        {
            "uuid": "b2b4eb78-9bca-46a4-b175-50d5ea7bc1fa",
            "name": "Directional Light",
            "transform": {
                "uuid": "2dab6d2c-e6d1-45c3-95cd-7dbe4ce24863",
                "position": {
                    "x": 0,
                    "y": 3,
                    "z": 0
                },
                "rotation": {
                    "x": 50,
                    "y": 30,
                    "z": 0
                },
                "scale": {
                    "x": 1,
                    "y": 1,
                    "z": 1
                },
                "parent": ""
            },
            "components": [
                {
                    "uuid": "473292c5-7c16-4265-8a0e-8c51b7e07a79",
                    "component": "DirectionalLight",
                    "properties": [
                        {
                            "name": "color",
                            "value": 16777215,
                            "type": "COLOR"
                        },
                        {
                            "name": "intensity",
                            "value": 0.5,
                            "type": "NUMBER"
                        },
                        {
                            "name": "shadows",
                            "value": true,
                            "type": "BOOLEAN"
                        }
                    ],
                    "file": null
                }
            ]
        }
    ]
};

export function CreateSceneFile(path: string, name:string): Promise<FileSystemHandle> {
    return FileBrowser.fopen(`${path}/${name}.scene`, MODE.W)
    .then((fileHandle) => {
        // Kinda dodgy but easiest way to create a blank scene
        const DefaultSceneClone: ISceneSerialized = JSON.parse(JSON.stringify(DefaultScene));
        DefaultSceneClone.gameObjects[0].uuid = UUID.v4();
        DefaultSceneClone.gameObjects[0].transform.uuid = UUID.v4();
        DefaultSceneClone.gameObjects[0].components[0].uuid = UUID.v4();
        DefaultSceneClone.gameObjects[1].uuid = UUID.v4();
        DefaultSceneClone.gameObjects[1].transform.uuid = UUID.v4();
        DefaultSceneClone.gameObjects[1].components[0].uuid = UUID.v4();
        return FileBrowser.fwrite(fileHandle, JSON.stringify(DefaultSceneClone, null, 2))
        .then(() => {
            return fileHandle;
        })
    })
}