import React from 'react';
import { Layout3DPreview } from './Layout3DPreview';
import { FileData } from './LayoutProject';

import { BufferGeometry } from 'trident/node_modules/three';

interface LayoutInspectorProps {
    item: FileData;
};

interface LayoutInspectorState {
};

export class LayoutInspectorMesh extends React.Component<LayoutInspectorProps, LayoutInspectorState> {
    constructor(props) {
        super(props);
    }

    public render() {
        const instance: BufferGeometry = this.props.item.instance;
        return (
            <div>
                <Layout3DPreview instance={instance}/>
            </div>
        )
    }
}