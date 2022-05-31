import React from 'react';
import { GameObject } from 'trident';
import { ResourceExtensions } from 'trident/dist/esm/resources/Resources';

import { EventEmitter } from '../events/IEvents';
import { LayoutInspectorGameObject } from './LayoutInspectorGameObject';
import { LayoutInspectorMaterial } from './LayoutInspectorMaterial';
import { LayoutInspectorMesh } from './LayoutInspectorMesh';
import { FileData } from './LayoutProject';

interface LayoutInspectorProps {
};

interface LayoutInspectorState {
    selected: GameObject | FileData;
};

export class LayoutInspector extends React.Component<LayoutInspectorProps, LayoutInspectorState> {
    public state: LayoutInspectorState;

    constructor(props) {
        super(props);

        this.state = {selected: null};

        EventEmitter.on("onHierarchySelected", (gameObject) => {
            this.setState({selected: gameObject});
            this.forceUpdate();
        })
        EventEmitter.on("onSceneGameObjectSelected", (gameObject) => {
            this.setState({selected: gameObject});
            this.forceUpdate();
        });
        EventEmitter.on("onProjectFileSelected", (item) => {
            this.setState({selected: item});
            this.forceUpdate();
        })
    }

    public render() {
        if (!this.state.selected) return;

        if (this.state.selected instanceof GameObject) {
            return <LayoutInspectorGameObject gameObject={this.state.selected}/>
        }
        else if (this.state.selected.instance) {
            const extension = this.state.selected.file.name.substr(this.state.selected.file.name.lastIndexOf('.') + 1).toUpperCase();

            if (extension == ResourceExtensions.MATERIAL) {
                return <LayoutInspectorMaterial item={this.state.selected}/>
            }
            else if (extension == ResourceExtensions.MESH_OBJ) {
                return <LayoutInspectorMesh item={this.state.selected}/>
            }
        }
    }
}