import React from "react";
import { EventEmitter } from "../events/IEvents";

interface DebugMessage {
    message: string;
    type: "error" | "warn" | "log";    
};

interface LayoutConsoleProps {};
interface LayoutConsoleState {
    messages: DebugMessage[]
};

export class LayoutConsole extends React.Component<LayoutConsoleProps, LayoutConsoleState> {
    constructor(props) {
        super(props);

        this.state = {messages: []};

        EventEmitter.on("onDebugMessage", (message, type) => {
            this.state.messages.push({
                message: message,
                type: type
            })
            this.setState({messages: this.state.messages});
            this.forceUpdate();
        })
    };

    private renderMessages(): JSX.Element[] {
        let elements: JSX.Element[] = [];

        let c = 0;
        for (let entry of this.state.messages) {
            if (entry.type == "warn") {
                elements.push(<div key={c} style={{color: "#f1c40f", paddingBottom: "10px"}}>{entry.message}</div>)
            }
            else if (entry.type == "error") {
                elements.push(<div key={c} style={{color: "#e74c3c", paddingBottom: "10px"}}>{entry.message}</div>)
            }
            c++;
        }

        return elements;
    }

    public render() {
        const messages = this.renderMessages();

        return (
            <div
            style={{
                padding: "10px",
            }}
            >
                {...messages}
            </div>
        )
    }
}