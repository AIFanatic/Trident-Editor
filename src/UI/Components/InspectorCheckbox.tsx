import React from 'react';

import './InspectorComponent.css';

interface InspectorCheckboxProps {
    title: string;
    selected?: boolean;
    onChanged?: (value: boolean) => void;
};

export class InspectorCheckbox extends React.Component<InspectorCheckboxProps> {
    constructor(props: InspectorCheckboxProps) {
        super(props);
    }

    private onChanged(event: React.ChangeEvent<HTMLInputElement>) {
        if (this.props.onChanged) {
            const input = event.currentTarget as HTMLInputElement;
            this.props.onChanged(input.checked)
        }
    }

    public render() {
        return <div className="InspectorComponent">
            <span className="title">{this.props.title}</span>
            <div
                style={{
                    width: "70%"
                }}
            >

                <input
                    style={{marginLeft: "0px"}}
                    type="checkbox"
                    checked={this.props.selected}
                    onChange={(event) => {this.onChanged(event)}}
                />
            </div>
        </div>
    }
}