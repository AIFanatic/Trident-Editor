import React, { createRef } from 'react';
import { ITreeMap } from './ITreeMap';

interface FileProps {
    data: ITreeMap;
    onClicked: (data: ITreeMap) => void;
    onDoubleClicked?: (data: ITreeMap) => void;
    onDropped: (from: string, to: string) => void;
    onDragStarted?: (event: React.DragEvent<HTMLDivElement>, data: ITreeMap) => void;
}

interface FileState {
    isSelected: boolean;
}

export class File extends React.Component<FileProps, FileState> {
    private FileRef = createRef<HTMLDivElement>();

    constructor(props: FileProps) {
        super(props);
        this.state = {isSelected: false};
    }

    private onDragStart(event: React.DragEvent<HTMLDivElement>) {
        event.dataTransfer.setData("from-uuid", this.props.data.id);

        if (this.props.onDragStarted) {
            this.props.onDragStarted(event, this.props.data);
        }
    }

    private onDrop(event: React.DragEvent<HTMLDivElement>) {
        this.FileRef.current.style.backgroundColor = "";
        
        const fromUuid = event.dataTransfer.getData("from-uuid");

        if (fromUuid != "") {
            this.props.onDropped(fromUuid, this.props.data.id);
        }
        event.preventDefault();
        event.stopPropagation();
    }

    private onDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
    }
    
    private onClicked(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.props.onClicked(this.props.data);
        event.preventDefault();
        event.stopPropagation();
    }

    private onDoubleClicked(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (this.props.onDoubleClicked) {
            this.props.onDoubleClicked(this.props.data);
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private onDragEnter(event: React.DragEvent<HTMLDivElement>) {
        this.FileRef.current.style.backgroundColor = "#3498db80";
    }

    private onDragLeave(event: React.DragEvent<HTMLDivElement>) {
        this.FileRef.current.style.backgroundColor = "";
    }

    public render() {
        let classes = "item-title";
        if (this.props.data.isSelected) classes += " active";

        return (
            <div
                className = "item"
                ref={this.FileRef}
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
                        style={{paddingLeft: "15px"}}
                    ></span>
                    
                    <span>{this.props.data.name}</span>
                </div>

                <div
                    className = "item-content"
                >
                </div>
            </div>
        );
    }
}