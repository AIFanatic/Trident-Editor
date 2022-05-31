import React from 'react';
import { Components, GameObject } from 'trident';
import { EventEmitter } from '../../events/IEvents';
import { RegisteredComponents } from '../../helpers/RegisteredComponents';
import { DrillDownMenu, IDrillDownItem } from './DrilldownMenu/DrillDownMenu';

// TODO: Make this dynamic
const data: IDrillDownItem[] = [
    {
        parentId: null,
        id: "Physics",
        name: "Physics"
    },
        {
            parentId: "Physics",
            id: "Rigidbody",
            name: "Rigidbody"
        },
        {
            parentId: "Physics",
            id: "BoxCollider",
            name: "BoxCollider"
        },
        {
            parentId: "Physics",
            id: "CapsuleCollider",
            name: "CapsuleCollider"
        },
        {
            parentId: "Physics",
            id: "MeshCollider",
            name: "MeshCollider"
        },
        {
            parentId: "Physics",
            id: "PlaneCollider",
            name: "PlaneCollider"
        },
        {
            parentId: "Physics",
            id: "SphereCollider",
            name: "SphereCollider"
        },
    {
        parentId: null,
        id: "Mesh",
        name: "Mesh"
    },
        {
            parentId: "Mesh",
            id: "MeshFilter",
            name: "MeshFilter"
        },
        {
            parentId: "Mesh",
            id: "MeshRenderer",
            name: "MeshRenderer"
        },
    {
        parentId: null,
        id: "Lights",
        name: "Lights"
    },
        {
            parentId: "Lights",
            id: "AreaLight",
            name: "AreaLight"
        },
        {
            parentId: "Lights",
            id: "DirectionalLight",
            name: "DirectionalLight"
        },
        {
            parentId: "Lights",
            id: "PointLight",
            name: "PointLight"
        },
        {
            parentId: "Lights",
            id: "SpotLight",
            name: "SpotLight"
        },
    {
        parentId: null,
        id: "Primitives",
        name: "Primitives"
    },
        {
            parentId: "Primitives",
            id: "Capsule",
            name: "Capsule"
        },
        {
            parentId: "Primitives",
            id: "Cube",
            name: "Cube"
        },
        {
            parentId: "Primitives",
            id: "Plane",
            name: "Plane"
        },
        {
            parentId: "Primitives",
            id: "Sphere",
            name: "Sphere"
        },
    {
        parentId: null,
        id: "Miscellaneous",
        name: "Miscellaneous"
    },
        {
            parentId: "Miscellaneous",
            id: "Animation",
            name: "Animation"
        },
        {
            parentId: "Miscellaneous",
            id: "ArticulationBody",
            name: "ArticulationBody"
        },
        {
            parentId: "Miscellaneous",
            id: "LineRenderer",
            name: "LineRenderer"
        },
];

interface AddComponentProps {
    gameObject: GameObject;
}

interface AddComponentState {
    isMenuOpen: boolean;
}

export class AddComponent extends React.Component<AddComponentProps, AddComponentState> {
    public state: AddComponentState;

    constructor(props: AddComponentProps) {
        super(props);

        this.state = {isMenuOpen: false};
    }

    private onAddComponentClicked(gameObject: GameObject, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        console.log("clciked")
        this.setState({isMenuOpen: !this.state.isMenuOpen})
    }

    private onMenuItemClicked(item: IDrillDownItem) {
        console.log("onMenuItemClicked", item)
        const componentClass = Components[item.id] ? Components[item.id] : RegisteredComponents.get(item.id);

        const componentInstance = this.props.gameObject.AddComponent(componentClass);
        // if (componentInstance.runInEditMode) {
        //     componentInstance.gameObject.scene.Load();
        // }

        EventEmitter.emit("onGameObjectComponentsChanged", this.props.gameObject);

        this.setState({isMenuOpen: false});
    }

    public render() {
        let dataDynamic = JSON.parse(JSON.stringify(data));

        dataDynamic.push({
            parentId: null,
            id: "Scripts",
            name: "Scripts"
        })

        for (let componentPair of RegisteredComponents.entries()) {
            const path = componentPair[0];
            const component = componentPair[1];

            const pathSplit = path.split("/");
            const nameWithExtension = pathSplit[pathSplit.length-1];
            const name = nameWithExtension.split(".")[0];

            dataDynamic.push({
                parentId: "Scripts",
                id: path,
                name: name
            })
        }
        return (
            <div style={{
                marginTop: "10px"
            }}>
                <div style={{
                    textAlign: "center",
                }}>
                    <button
                    style={{
                        width: "70%",
                        backgroundColor: "#404040",
                        color: "inherit",
                        border: "none",
                        borderRadius: "2px",
                        padding: "3px",
                        cursor: "pointer"
                    }}
                    onClick={(event) => {this.onAddComponentClicked(this.props.gameObject, event)}}
                    >Add component
                </button>
                </div>

                {this.state.isMenuOpen ? <DrillDownMenu onItemClicked={(item) => this.onMenuItemClicked(item)} currentParent={null} items={dataDynamic}/> : ""}
            </div>
        )
    }
}