import React from "react";
import { EventEmitter } from "../events/IEvents";

interface LayoutDebugProps {};
interface LayoutDebugState {
    message: string;
    type: "error" | "warn" | "log";
};

export class LayoutDebug extends React.Component<LayoutDebugProps, LayoutDebugState> {
    constructor(props) {
        super(props);

        this.state = {message: null, type: null};

        EventEmitter.on("onDebugMessage", (message, type) => {
            this.setState({message: message, type: type});
        })
    };

    public render() {
        let element: JSX.Element = <div></div>;
        if (this.state.type == "warn") {
            element = <span style={{color: "#f1c40f"}}>{this.state.message}</span>
        }
        else if (this.state.type == "error") {
            element = <span style={{color: "#e74c3c"}}>{this.state.message}</span>
        }
        return (
            <div
            style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                paddingLeft: "10px",
                paddingRight: "10px"
            }}
            >
                {element}
            </div>
        )
    }
}