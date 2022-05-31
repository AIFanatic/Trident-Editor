import React, { createRef } from 'react';
import {createRoot} from 'react-dom/client';

import { Layout } from "./ui/Layout";

import { Runtime, ArticulationJointType, Components, GameObject, PrimitiveType, Scene } from "trident";
import { EventEmitter } from "./events/IEvents";
import { IConfiguration } from 'trident/dist/esm/interfaces/IConfiguration';

import * as Commands from './commands';

export class App extends React.Component {
    private layoutRef = createRef<Layout>();
    private scene: Scene;

    constructor(props) {
        super(props);

        EventEmitter.on("onLayoutLoaded", () => {
            const config: IConfiguration = {
                renderer: {
                    containerId: this.layoutRef.current.layoutSceneRef.current.canvasRef.current.id,
                },
                physics: {
                    physxWasmURL: "./trident-physx-js-webidl.wasm.wasm",
                },
            }

            const runtime = new Runtime(config);
            runtime.OnLoaded = () => {
                const scene = Runtime.SceneManager.CreateScene("New Scene")
                this.scene = scene;
                Commands.SetActiveScene(scene);
                const cameraGameObject = new GameObject(this.scene);
                cameraGameObject.name = "Main Camera";
                const camera = cameraGameObject.AddComponent(Components.Camera);

                const directionalLightGameObject = new GameObject(this.scene);
                directionalLightGameObject.name = "Directional Light";
                directionalLightGameObject.transform.position.set(0, 3, 0);
                directionalLightGameObject.transform.eulerAngles.set(50, 30, 0);
                const directionalLight = directionalLightGameObject.AddComponent(Components.DirectionalLight);
                directionalLight.intensity = 0.5;
                directionalLight.shadows = true;

                const blockerCubeGameobjectX = new GameObject(this.scene);
                blockerCubeGameobjectX.name = "BlockerCube";
                blockerCubeGameobjectX.CreatePrimitive(PrimitiveType.Cube);
                blockerCubeGameobjectX.transform.position.set(0, -5, 0);
                blockerCubeGameobjectX.transform.localScale.set(0.5, 0.5, 0.5);

                let i = 0;
                const rootArticulationGameobject = new GameObject(this.scene);
                rootArticulationGameobject.name = "Articulation-" + i;
                rootArticulationGameobject.CreatePrimitive(PrimitiveType.Cube);
                const rootArticulation = rootArticulationGameobject.AddComponent(Components.ArticulationBody);
                rootArticulation.immovable = true;
            
                let parentGameobject = rootArticulationGameobject;
                for (let x = 2; x < 10; x+=2) {
                    i++;
                    const articulationGameobject = new GameObject(this.scene);
                    articulationGameobject.name = "Articulation-" + i;
                    articulationGameobject.transform.position.set(x, 0, 0);
                    articulationGameobject.transform.parent = parentGameobject.transform;
                    articulationGameobject.CreatePrimitive(PrimitiveType.Cube);

                    const articulation = articulationGameobject.AddComponent(Components.ArticulationBody);
                    articulation.jointType = ArticulationJointType.SphericalJoint;
                    articulation.mass = (1/x)*10
                    articulation.xDrive.stiffness = 100;
                    articulation.yDrive.stiffness = 100;
                    articulation.zDrive.stiffness = 100;

                    parentGameobject = articulationGameobject
                }

                EventEmitter.emit("onSceneChanged", this.scene);
                EventEmitter.emit("onRuntimeLoaded", runtime);
            }
        })
    }

    public render() {
        return <Layout ref={this.layoutRef}/>
    }
}

const rootElement = document.getElementById("app");
const root = createRoot(rootElement);
root.render(<App />);