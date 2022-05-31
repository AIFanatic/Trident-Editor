import React from 'react';
import {THREE} from 'trident';

import './InspectorComponent.css';

interface InspectorColorProps {
    title: string;
    color: THREE.Color;
    onChanged?: (value: THREE.Color) => void;
};

interface InspectorColorState {
};

export class InspectorColor extends React.Component<InspectorColorProps, InspectorColorState> {
    constructor(props: InspectorColorProps) {
        super(props);
    }

    private onChanged(event: React.ChangeEvent<HTMLInputElement>) {
        if (this.props.onChanged) {
            const input = event.currentTarget as HTMLInputElement;
            const color = new THREE.Color(input.value);
            this.props.onChanged(color);
        }
    }

    public render() {
        let title;
        if (this.props.title != "") {
            title = <div className="title">
                {this.props.title}
            </div>
        }
        return <div className="InspectorComponent">
            {title}

            <input
                className="input"
                type="color"
                onChange={(event) => {this.onChanged(event)}}
                value={`#${this.props.color.getHexString()}`}
            />
        </div>
    }
}

// import React from 'react';

// import './InspectorComponent.css';

// interface InspectorColorProps {
//     title: string;
//     color: THREE.Color;
//     onChanged?: (value: THREE.Color) => void;
// };

// interface InspectorColorState {
//     color: THREE.Color;
// };

// export class InspectorColor extends React.Component<InspectorColorProps, InspectorColorState> {
//     constructor(props: InspectorColorProps) {
//         super(props);

//         this.state = {color: this.props.color.clone()};
//     }

//     private onChanged(event: React.ChangeEvent<HTMLInputElement>) {
//         if (this.props.onChanged) {
//             const input = event.currentTarget as HTMLInputElement;
//             this.state.color.set(input.value);
//             this.props.onChanged(this.state.color);
//         }
//     }

//     public render() {
//         return <div className="InspectorComponent">
//         <span className="title">{this.props.title}</span>

//             <input
//                 className="input"
//                 type="color"
//                 onChange={(event) => {this.onChanged(event)}}
//                 value={`#${this.state.color.getHexString()}`}
//             />
//         </div>
//     }
// }