import React from 'react';
import { InspectorColor } from './Components/InspectorColor';
import { FileData } from './LayoutProject';
import { MeshStandardMaterial } from 'trident/node_modules/three';
import { FileBrowser } from '../helpers/FileBrowser';
import { InspectorInput } from './Components/InspectorInput';
import { InspectorRange } from './Components/InspectorRange';
import { InspectorTexture } from './Components/InspectorTexture';
import * as Commands from '../commands';


import {THREE} from 'trident';

import { Layout3DPreview } from './Layout3DPreview';
import { StringUtils } from '../helpers/StringUtils';
import { InspectorVector2 } from './Components/InspectorVector2';

interface LayoutInspectorProps {
    item: FileData;
};

interface LayoutInspectorState {};

export class LayoutInspectorMaterial extends React.Component<LayoutInspectorProps, LayoutInspectorState> {
    constructor(props) {
        super(props);
    }

    private saveFileFromInstance(item: FileData) {
        if (item.file instanceof FileSystemFileHandle) {
            const path = StringUtils.Dirname(item.file.name);
            const name = StringUtils.GetNameForPath(item.file.name);
            Commands.SaveMaterial(path, name, item.instance);
        }
    }

    // public componentWillUnmount() {
    //     this.saveFileFromInstance(this.props.item);
    // }

    private onComponentPropertyChanged(instance: MeshStandardMaterial, property: string, value: any) {
        instance[property] = value;
        if (value instanceof THREE.Texture) {
            instance.needsUpdate = true;
        }
        this.saveFileFromInstance(this.props.item);
        this.forceUpdate();
    }

    public render() {
        const instance: MeshStandardMaterial = this.props.item.instance;
        
        const repeat = {
            tiling: instance.map ? instance.map.repeat : new THREE.Vector2()
        }

        return (
            <div>
                <InspectorTexture title="Albedo" component={instance} property={"map"} acceptedType={new THREE.Texture()} onChanged={(value) => {this.onComponentPropertyChanged(instance, "map", value)}}>
                    <InspectorColor key="albedoColor" title="" color={instance["color"]} onChanged={(value) => {this.onComponentPropertyChanged(instance, "color", value)}}/>
                </InspectorTexture>

                <InspectorTexture title="Metallic" component={instance} property={"metalnessMap"} acceptedType={new THREE.Texture()} onChanged={(value) => {this.onComponentPropertyChanged(instance, "metalnessMap", value)}}>
                    <InspectorRange title="" value={instance["metalness"]} onChanged={(value) => {this.onComponentPropertyChanged(instance, "metalness", value)}}/>
                </InspectorTexture>

                <InspectorTexture title="Normal Map" component={instance} property={"normalMap"} acceptedType={new THREE.Texture()} onChanged={(value) => {this.onComponentPropertyChanged(instance, "normalMap", value)}}>
                </InspectorTexture>

                <InspectorTexture title="Height Map" component={instance} property={"bumpMap"} acceptedType={new THREE.Texture()} onChanged={(value) => {this.onComponentPropertyChanged(instance, "bumpMap", value)}}>
                </InspectorTexture>

                <InspectorTexture title="Occlusion" component={instance} property={"aoMap"} acceptedType={new THREE.Texture()} onChanged={(value) => {this.onComponentPropertyChanged(instance, "aoMap", value)}}>
                </InspectorTexture>

                <InspectorTexture title="Emissive" component={instance} property={"emissiveMap"} acceptedType={new THREE.Texture()} onChanged={(value) => {this.onComponentPropertyChanged(instance, "emissiveMap", value)}}>
                    <InspectorColor key="emissionColor" title="" color={instance["emissive"]} onChanged={(value) => {this.onComponentPropertyChanged(instance, "emissive", value)}}/>
                </InspectorTexture>
                
                <InspectorInput title="Emission amount" value={instance["emissiveIntensity"]} type="number" onChanged={(value) => {this.onComponentPropertyChanged(instance, "emissiveIntensity", value)}}/>

                {
                    instance.map ?
                    <InspectorVector2 title="Tiling" vector2={instance["map"]["repeat"]} onChanged={(value) => {this.onComponentPropertyChanged(instance["map"], "repeat", value)}}/>
                    :
                    ""
                }


                <Layout3DPreview instance={instance}/>
            </div>
        )
    }
}