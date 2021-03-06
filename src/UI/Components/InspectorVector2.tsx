import React from 'react';

import './InspectorComponent.css';

interface InspectorVector2Props {
    title: string;
    vector2: THREE.Vector2
    onChanged?: (value: THREE.Vector2) => void;
};

interface InspectorVector2State {
    vector2: THREE.Vector2;
}

enum ChangedProperty {
    X,
    Y,
    Z
};

export class InspectorVector2 extends React.Component<InspectorVector2Props, InspectorVector2State> {
    public state: InspectorVector2State;

    constructor(props: InspectorVector2Props) {
        super(props);
        this.state = {vector2: this.props.vector2.clone()};
    }

    private onChanged(property: ChangedProperty, event: React.ChangeEvent<HTMLInputElement>) {
        if (this.props.onChanged) {
            const input = event.currentTarget as HTMLInputElement;
            if (input.value == "") return;
            const value = parseFloat(input.value);

            if (property == ChangedProperty.X) this.state.vector2.x = value;
            else if (property == ChangedProperty.Y) this.state.vector2.y = value;

            this.props.onChanged(this.state.vector2)
        }
    }
      
    private vector2Equals(v1: THREE.Vector2, v2: THREE.Vector2, epsilon = Number.EPSILON ) {
        return ( ( Math.abs( v1.x - v2.x ) < epsilon ) && ( Math.abs( v1.y - v2.y ) < epsilon ) );
    }

    public componentDidUpdate() {
        if (!this.vector2Equals(this.props.vector2, this.state.vector2)) {
            this.setState({vector2: this.props.vector2.clone()});
        }
    }

    public render() {
        return <div className="InspectorComponent">
        <span className="title">{this.props.title}</span>

            <div style={{
                width: "35%",
                display: "flex",
                alignItems: "center"
            }}>
                <span style={{
                    fontSize: "12px",
                }}>X</span>
                <input 
                    className="input"
                    type="number"
                    onChange={(event) => {this.onChanged(ChangedProperty.X, event)}}
                    value={this.state.vector2.x}
                />
            </div>

            <div style={{
                width: "35%",
                display: "flex",
                alignItems: "center"
            }}>
                <span style={{
                    fontSize: "12px",
                }}>Y</span>
                <input
                    className="input"
                    type="number"
                    onChange={(event) => {this.onChanged(ChangedProperty.Y, event)}}
                    value={this.state.vector2.y}
                />
            </div>
        </div>
    }
}