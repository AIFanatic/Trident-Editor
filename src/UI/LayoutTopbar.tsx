import React from 'react';
import { Runtime, Scene, SceneSerializer } from 'trident';
import { EventEmitter } from '../events/IEvents';

import { BsArrowsMove, BsArrowsAngleExpand, BsFillPlayFill, BsFillStopFill, BsFillPauseFill } from 'react-icons/bs';
import { FiRefreshCw } from 'react-icons/fi';

import './LayoutTopbar.css';
import { ISceneSerialized } from 'trident/dist/esm/serializer/ISceneSerialized';
import { SceneDeserializerEditor } from '../helpers/SceneDeserializerEditor';

import * as Commands from '../commands';

interface LayoutTopbarProps {};

interface LayoutTopbarState {
    runtime: Runtime;
    isPlaying: boolean;
    sceneState: ISceneSerialized;
};

export class LayoutTopbar extends React.Component<LayoutTopbarProps, LayoutTopbarState> {
    public state: LayoutTopbarState;

    constructor(props: LayoutTopbarProps) {
        super(props);
        this.state = {runtime: null, isPlaying: false, sceneState: null};

        EventEmitter.on("onRuntimeLoaded", (runtime) => {
            this.setState({runtime: runtime});
        })
    }

    private onPlayClicked() {
        const activeScene = Runtime.SceneManager.GetActiveScene();
        const sceneSerialized = SceneSerializer.Serialize(activeScene);
        this.state.runtime.Load();
        EventEmitter.emit("onLoad");
        this.state.runtime.Play();
        EventEmitter.emit("onPlay");
        this.setState({isPlaying: true, sceneState: sceneSerialized});
    }
    
    private onStopClicked() {
        const activeScene = Runtime.SceneManager.GetActiveScene();
        this.state.runtime.Stop();
        EventEmitter.emit("onStop");
        Commands.ClearGameObjects(activeScene);
        EventEmitter.emit("onSceneGameObjectsCleared", activeScene);
        SceneDeserializerEditor.Deserialize(this.state.sceneState)
        .then(scene => {
            Commands.SetActiveScene(scene);
            EventEmitter.emit("onSceneDeserialized", scene);
            EventEmitter.emit("onSceneChanged", scene);
            this.setState({isPlaying: false, sceneState: null});
        })
    }
    
    private onMoveClicked() {
        EventEmitter.emit("onTopbarMoveClicked");
    }
    
    private onRotateClicked() {
        EventEmitter.emit("onTopbarRotateClicked");
    }

    private onScaleClicked() {
        EventEmitter.emit("onTopbarScaleClicked");
    }

    public render() {
        return (
            <div
                className="LayoutTopbar"
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    height: "100%"
                }}
                >
                   <div style={{width: "33%", justifyContent:"center", display: "flex", padding: "2px"}}>
                        <button onClick={() => {this.onMoveClicked()}}><BsArrowsMove /></button>
                        <button onClick={() => {this.onRotateClicked()}}><FiRefreshCw /></button>
                        <button onClick={() => {this.onScaleClicked()}}><BsArrowsAngleExpand /></button>
                    </div>

                    <div style={{width: "33%", justifyContent:"center", display: "flex", padding: "2px"}}>
                        {this.state.isPlaying ? 
                        <button onClick={() => {this.onStopClicked()}}><BsFillStopFill /></button> :
                        <button onClick={() => {this.onPlayClicked()}}><BsFillPlayFill /></button>}
                        <button><BsFillPauseFill /></button>
                    </div>

                    <div style={{width: "33%", justifyContent:"center", display: "flex", padding: "2px"}}>
                    </div>
            </div>
        )
    }
}