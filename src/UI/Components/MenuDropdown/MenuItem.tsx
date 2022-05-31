import React from 'react';
import { Menu } from './Menu';

interface MenuItemProps {
    onClicked?: () => void;
    name: string;
    disabled?: boolean;
    closeMenu?: () => void;
}

export class MenuItem extends React.Component<MenuItemProps> {
    constructor(props: MenuItemProps) {
        super(props);
    }

    private onClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        if(this.props.closeMenu) {
            this.props.closeMenu();
        }
        if(this.props.onClicked) {
            this.props.onClicked();
        }
    }

    public render() {
        return (
            <button
                className="dropdown-btn dropdown-item-btn"
                onClick={(event) => {this.onClicked(event)}}
                disabled={this.props.disabled ? this.props.disabled : false}
            >
                {this.props.name}
            </button>
        )
    }
}