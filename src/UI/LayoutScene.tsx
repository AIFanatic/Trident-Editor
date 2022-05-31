import React, { createRef } from 'react';
import { EventEmitter } from '../events/IEvents';

import { Scene } from 'trident';
import { GameObject, Transform } from 'trident/dist/esm/components';
import { Vector3 } from 'trident/node_modules/three';

import { SceneControls } from '../editorcomponents/SceneControls';

import './LayoutScene.css';
interface LayoutSceneProps {};
interface LayoutSceneState {
    scene: Scene;
    selectedTransform: Transform;
    sceneControls: SceneControls;
}

export class LayoutScene extends React.Component<LayoutSceneProps, LayoutSceneState> {
    public canvasRef = createRef<HTMLCanvasElement>();

    constructor(props: LayoutSceneProps) {
        super(props);

        this.state = {scene: null, selectedTransform: null, sceneControls: null};

        EventEmitter.on("onSceneChanged", (scene) => {
            let position = null;
            if (this.state.sceneControls) {
                position = this.state.sceneControls.GetOrbitControlsPosition();
                this.state.sceneControls.DetachTransformControls();
                this.state.sceneControls.gameObject.Destroy();
            }
            const sceneControlsGameObject = new GameObject(scene);
            const sceneControls = sceneControlsGameObject.AddComponent(SceneControls);

            if (position) {
                sceneControls.SetOrbitControlsPosition(position);
            }

            sceneControls.OnTransformSelected = (transform => {
                sceneControls.AttachTransformControls(transform);
                EventEmitter.emit("onSceneGameObjectSelected", transform.gameObject);
                this.setState({selectedTransform: transform});
            });

            sceneControls.OnTransformUpdated = (transform => {
                EventEmitter.emit("onGameObjectComponentUpdated", transform.gameObject);
            });

            this.setState({scene: scene, sceneControls: sceneControls});
        })

        EventEmitter.on("onHierarchySelected", (gameObject) => {
            if (!gameObject) {
                this.setState({selectedTransform: null});
                return;
            }

            this.state.sceneControls.AttachTransformControls(gameObject.transform);
            this.setState({selectedTransform: gameObject.transform});
        });

        EventEmitter.on("onTopbarMoveClicked", () => {
            this.state.sceneControls.ChangeTransformControlsMode("translate");
        });
        EventEmitter.on("onTopbarRotateClicked", () => {
            this.state.sceneControls.ChangeTransformControlsMode("rotate");
        });
        EventEmitter.on("onTopbarScaleClicked", () => {
            this.state.sceneControls.ChangeTransformControlsMode("scale");
        });
        EventEmitter.on("onGameObjectDeleted", (gameObject) => {
            if (this.state.selectedTransform === gameObject.transform) {
                this.state.sceneControls.DetachTransformControls();
                this.setState({selectedTransform: null});
            }
        });

        EventEmitter.on("onPlay", () => {
            this.state.sceneControls.SetEnabled(false);
        });
        EventEmitter.on("onStop", () => {
            this.state.sceneControls.SetEnabled(true);
        });
    }

    public render() {
        return (
            <div
            style={{
                width: "100%",
                height: "100%"
            }}
            >
                {/* <div
                    className="LayoutScene"
                    style={{
                        display: "flex",
                        justifyContent: "space-around",
                    }}
                >
                    <button onClick={() => {this.onGizmosClicked()}}>Gizmos</button>
                </div> */}
                <canvas
                    ref={this.canvasRef}
                    id="scene-canvas"
                />
            </div>
        )
    }
}