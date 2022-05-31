import React, { createRef } from 'react';

import { LayoutScene } from "./LayoutScene";
import { LayoutProject } from "./LayoutProject";
import { LayoutHierarchy } from "./LayoutHierarchy";
import { LayoutInspector } from "./LayoutInspector";
import { LayoutTopbar } from "./LayoutTopbar";
import { LayoutNavbar } from "./LayoutNavbar";
import { LayoutDebug } from "./LayoutDebug";
import { LayoutConsole } from "./LayoutConsole";
import { EventEmitter } from '../events/IEvents';

import {Layout as FlexLayout, Model, TabNode, IJsonModel} from 'flexlayout-react';

import 'flexlayout-react/style/dark.css';
import './Layout.css';

enum LayoutComponents {
    LayoutNavbar = "LayoutNavbar",
    LayoutTopbar = "LayoutTopbar",
    LayoutScene = "LayoutScene",
    LayoutHierarchy = "LayoutHierarchy",
    LayoutInspector = "LayoutInspector",
    LayoutProject = "LayoutProject",
	LayoutDebug = "LayoutDebug",
	// LayoutConsole = "LayoutConsole"
};

export interface LayoutProps {}

export interface LayoutState {
    isLoaded: boolean;
}

var json : IJsonModel= {
    global: {
        splitterSize: 2,
        tabSetEnableMaximize: false,
        tabEnableClose: false,
    },
    borders: [],
    layout: {
		type: "row",
		children: [
			{
				type: "row",
				children: [
					{
						type: "tabset",
                        enableTabStrip: false,
                        enableDrag: false,
                        height: 23,
                        minHeight: 23,
						children: [
							{
								type: "tab",
								name: "Navbar",
								component: LayoutComponents.LayoutNavbar
							}
						]
					},
					{
						type: "tabset",
                        enableTabStrip: false,
                        enableDrag: false,
                        height: 30,
                        minHeight: 30,
						children: [
							{
								type: "tab",
								name: "Topbar",
								component: LayoutComponents.LayoutTopbar
							}
						]
					},
					{
						type: "row",
						children: [
							{
								type: "row",
								weight: 20,
								children: [
									{
										type: "tabset",
										children: [
											{
												type: "tab",
												name: "Scene",
												component: LayoutComponents.LayoutScene
											}
										]
									},
									{
										type: "tabset",
										height: 200,
                                        minHeight: 200,
										children: [
											{
												type: "tab",
												name: "Project",
												component: LayoutComponents.LayoutProject
											},
											{
												type: "tab",
												name: "Console",
												component: "Console",
												enableRenderOnDemand: false
											}
										]
									}
								]
							},
							{
								type: "tabset",
								weight: 10,
                                minWidth: 200,
								children: [
									{
										type: "tab",
										name: "Hierarchy",
										component: LayoutComponents.LayoutHierarchy
									}
								]
							},
							{
								type: "tabset",
								weight: 10,
                                minWidth: 200,
								children: [
									{
										type: "tab",
										name: "Inspector",
										component: LayoutComponents.LayoutInspector,
										enableRenderOnDemand: true
									}
								],
							}
						]
					},
					{
						type: "tabset",
                        enableTabStrip: false,
                        enableDrag: false,
                        height: 23,
                        minHeight: 23,
						children: [
							{
								type: "tab",
								component: LayoutComponents.LayoutDebug,
								enableRenderOnDemand: false
							}
						]
					},
				]
			}
		]
	},
};

const model = Model.fromJson(json);

export class Layout extends React.Component<LayoutProps, LayoutState> {
    public layoutNavbar: LayoutNavbar;
    public layoutTopbar: LayoutTopbar;
    public layoutScene: LayoutScene;
    public layoutProject: LayoutProject;
    public layoutHierarchy: LayoutHierarchy;
    public layoutInspector: LayoutInspector;

    private loadedComponents: number = 0;

    public layoutSceneRef = createRef<LayoutScene>();

    constructor(props: LayoutProps) {
        super(props);

        this.state = {isLoaded: false};
    }

    private onLayoutReady() {
        EventEmitter.emit("onLayoutLoaded");
    }

    private layoutFactory(node: TabNode): React.ReactNode {
        const requestedComponent = node.getComponent();
        let loadComponent: JSX.Element = null;
        if (requestedComponent === LayoutComponents.LayoutNavbar) {
            loadComponent = <LayoutNavbar />;
        }
        else if (requestedComponent === LayoutComponents.LayoutTopbar) {
            loadComponent = <LayoutTopbar />;
        }
        else if (requestedComponent === LayoutComponents.LayoutScene) {
            loadComponent = <LayoutScene ref={this.layoutSceneRef}/>;
        }
        else if (requestedComponent === LayoutComponents.LayoutHierarchy) {
            loadComponent = <LayoutHierarchy />;
        }
        else if (requestedComponent === LayoutComponents.LayoutInspector) {
            loadComponent = <LayoutInspector />;
        }
        else if (requestedComponent === LayoutComponents.LayoutProject) {
            loadComponent = <LayoutProject />;
        }
		else if (requestedComponent === LayoutComponents.LayoutDebug) {
            loadComponent = <LayoutDebug />;
        }
		else if (requestedComponent === "Console") {
            loadComponent = <LayoutConsole />;
        }
        
        if (loadComponent) {
            this.loadedComponents++;
            if (this.loadedComponents == Object.keys(LayoutComponents).length) {
                setTimeout(() => {
                    this.onLayoutReady();
                }, 100);
            }
            return loadComponent;
        }
    }

    public render() {
        return (
            <FlexLayout
                model={model}
                factory={(node: TabNode) => {return this.layoutFactory(node)}} 
            />
        )
    }
}