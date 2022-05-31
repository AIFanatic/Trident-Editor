import React, { createRef } from 'react';
import { ITreeMap } from './ITreeMap';

interface FolderProps {
    data: ITreeMap[];
    item: ITreeMap;
    onClicked: (data: ITreeMap) => void;
    onDoubleClicked?: (data: ITreeMap) => void;
    onDropped: (from: string, to: string) => void;
    onToggled: (data: ITreeMap) => void;
}

interface FolderState {
    isOpen: boolean;
    isSelected: boolean;
}

export class Folder extends React.Component<FolderProps, FolderState> {
    private folderRef = createRef<HTMLDivElement>();

    constructor(props: FolderProps) {
        super(props);
        this.state = {isOpen: false, isSelected: false};
    }

    private handleToggle(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onToggled) {
            this.props.onToggled(this.props.item);
        }
        this.setState({isOpen: !this.state.isOpen});
    };

    private onDragStart(event: React.DragEvent<HTMLDivElement>) {
        event.dataTransfer.setData("from-uuid", this.props.item.id);
    }

    private onDrop(event: React.DragEvent<HTMLDivElement>) {
        this.folderRef.current.style.backgroundColor = "";
        
        const fromUuid = event.dataTransfer.getData("from-uuid");

        if (fromUuid != "") {
            this.props.onDropped(fromUuid, this.props.item.id);
        }
        event.preventDefault();
        event.stopPropagation();
    }

    private onDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
    }
    
    private onClicked(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.props.onClicked(this.props.item);
        event.preventDefault();
        event.stopPropagation();
    }
    
    private onDoubleClicked(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (this.props.onDoubleClicked) {
            this.props.onDoubleClicked(this.props.item);
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private onDragEnter(event: React.DragEvent<HTMLDivElement>) {
        this.folderRef.current.style.backgroundColor = "#3498db80";
    }

    private onDragLeave(event: React.DragEvent<HTMLDivElement>) {
        this.folderRef.current.style.backgroundColor = "";
    }

    public render() {
        let classes = "item-title";
        if (this.props.item.isSelected) classes += " active";

        return (
            <div
                className = "item"
                ref={this.folderRef}
            >
                <div
                    style={{display: "flex", alignItems: "center"}}
                    className={classes}
                    draggable={true}
                    onDragStart={(event) => this.onDragStart(event)}
                    onDragEnter={(event) => this.onDragEnter(event)}
                    onDragLeave={(event) => this.onDragLeave(event)}
                    onDrop={(event) => this.onDrop(event)}
                    onDragOver={(event) => this.onDragOver(event)}
                    onClick={(event) => this.onClicked(event)}
                    onDoubleClick={(event) => this.onDoubleClicked(event)}
                >
                    <span
                        style={{width: "15px", height: "15px", fontSize: "10px"}}
                        onClick={(event) => {this.handleToggle(event)}}
                    >{this.state.isOpen ? "▼ " : "▶ "}</span>

                    <span>{this.props.item.name}</span>
                </div>

                <div
                    className = "item-content"
                    style={{
                        height: this.state.isOpen ? "auto" : "0",
                    }}
                >
                    {this.props.children}
                </div>
            </div>
        );
    }
}