import React, { createRef } from 'react';

import './MenuDropdown.css';

interface MenuButtonState {
    isDropdownVisible: boolean;
}

interface MenuButtonProps {
    onOptionClicked?: (option: string) => void;
    onToggled?: (isOpen: boolean) => void;
    name: string;
    enabled?: boolean;
    closeMenu?: () => void;
}

export class MenuDropdown extends React.Component<MenuButtonProps, MenuButtonState> {
    private contentRef = createRef<HTMLDivElement>();

    constructor(props: MenuButtonProps) {
        super(props);

        this.state = {isDropdownVisible: false};
    }

    private toggleDropdown() {
        if (this.props.onToggled) this.props.onToggled(!this.state.isDropdownVisible);

        this.setState({isDropdownVisible: !this.state.isDropdownVisible});
    }

    private onOptionClicked(option: string) {
        this.toggleDropdown();

        if (this.props.onOptionClicked) {
            this.props.onOptionClicked(option);
        }
    }

    componentDidUpdate() {
        // TODO: I'm sure there is a better way of doing this.
        if (!this.contentRef.current) return;
        const w = this.contentRef.current.parentElement.clientWidth;
        const h = this.contentRef.current.parentElement.clientHeight;

        console.log("W", w)

        if (this.props.children) {
            this.contentRef.current.style.marginLeft = w + "px";
            this.contentRef.current.style.marginTop = -25 + "px";
        }
    }

    public render() {
        return (<div
            className="dropdown-menu">
                <button
                    className="dropdown-btn dropdown-item-btn"
                    onClick={(event) => this.toggleDropdown()}
                >
                    {this.props.name}
                </button>
                <span className="dropdown-right-icon">{"▶"}</span>
                {
                    this.state.isDropdownVisible ?
                    <div>
                        <div ref={this.contentRef} className="dropdown-content">
                            {/* {this.props.children} */}
                            {
                                React.Children.map(this.props.children, (child) =>
                                {
                                    const childCast = child as React.ReactElement;
                                    if (this.props.closeMenu) {
                                        return React.cloneElement(childCast, {closeMenu: () => {this.props.closeMenu()}});
                                    }
                                    return childCast;
                                }
                            )}
                        </div>
                    </div>
                    : ""
                }
            </div>)
    }
}