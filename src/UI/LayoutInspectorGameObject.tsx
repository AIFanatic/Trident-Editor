import React, { ReactElement } from 'react';

import { EventEmitter } from '../events/IEvents';
import { InspectorInput } from './Components/InspectorInput';
import { InspectorDropdown, InspectorDropdownOptions } from './Components/InspectorDropdown';
import { InspectorCheckbox } from './Components/InspectorCheckbox';
import { InspectorVector3 } from './Components/InspectorVector3';
import { InspectorVector2 } from './Components/InspectorVector2';
import { Collapsible } from './Components/Collapsible/Collapsible';
import { GameObject } from 'trident';
import { Component, Transform } from 'trident/dist/esm/components';
import { THREE } from 'trident/dist/esm/';
import { StringUtils } from '../helpers/StringUtils';
import { InspectorColor } from './Components/InspectorColor';
import { AddComponent } from './Components/AddComponent';

import { SerializableTypesInstance } from 'trident/dist/esm/utils/SerializeField';
import { InspectorClass } from './Components/InspectorClass';
import { InspectorType } from './Components/InspectorType';

interface LayoutInspectorProps {
    gameObject: GameObject;
};

interface LayoutInspectorState {
};

export class LayoutInspectorGameObject extends React.Component<LayoutInspectorProps, LayoutInspectorState> {
    public state: LayoutInspectorState;

    constructor(props) {
        super(props);

        this.state = {gameObject: null};
        
        EventEmitter.on("onGameObjectComponentsChanged", (gameObject) => {
            this.forceUpdate();
        })

        EventEmitter.on("onGameObjectComponentUpdated", (gameObject) => {
            this.forceUpdate();
        })
    }

    private onRemoveComponent(component: Component) {
        component.Destroy();
        this.forceUpdate();
    }

    private onComponentPropertyChanged(component: Component | Transform, property: string, value: any) {
        const type = typeof component[property];
        const classname = component.constructor.name;
        const customType = SerializableTypesInstance.get(classname, property);

        // console.log(type, component, property, value);

        if (customType) {
            component[property] = value;
        }
        else if (component[property] instanceof THREE.Vector3 && value instanceof THREE.Vector3) {
            component[property].copy(value);
        }
        else if (component[property] instanceof THREE.Color && value instanceof THREE.Color) {
            component[property].copy(value);
        }
        else if (type == "boolean") {
            component[property] = value;
        }
        else if (type == "number") {
            component[property] = parseFloat(value);
        }

        this.forceUpdate();
    }

    private onGameObjectNameChanged(gameObject: GameObject, event: React.ChangeEvent<HTMLInputElement>) {
        const input = event.currentTarget as HTMLInputElement;
        gameObject.name = input.value;

        EventEmitter.emit("onGameObjectNameChanged", gameObject, gameObject.name);

        this.forceUpdate()
    }

    private getInstanceParentInstance(instance: object): Function {
        const prototype = Object.getPrototypeOf(instance);
        const prototypeParent = Object.getPrototypeOf(prototype);

        if (prototypeParent.constructor.name == "Object" || prototypeParent.constructor.name == "EventDispatcher") {
            return prototype.constructor;
        }
        return this.getInstanceParentInstance(prototype);
    }

    private renderInspectorForComponentProperty(component: Component, property: string, checkCustomTypeOnly = false): ReactElement {
        const classname = component.constructor.name;
        const type = typeof component[property];
        
        if (type == "function") return null;

        const uuid = component.uuid ? component.uuid : classname;
        const title = StringUtils.CapitalizeStrArray(StringUtils.CamelCaseToArray(property)).join(" ");
        const key = `${uuid.slice(0, 5)}-${property}-${component.classtype}`;
        
        const customType = SerializableTypesInstance.get(classname, property);

        if (customType) {
            if (typeof customType == "function") {
                return <InspectorClass key={key} title={title}>
                    {this.renderInspectorForComponent(component[property])}
                </InspectorClass>
            }
            else if (typeof customType == "object") {
                let selectOptions: InspectorDropdownOptions[] = []

                for (let property in customType) {
                    if (!isNaN(Number(property))) continue;
                    selectOptions.push({text: property, value: customType[property]});
                }
                return <InspectorDropdown key={key} title={title} options={selectOptions} selected={component[property]} onSelected={(value) => {this.onComponentPropertyChanged(component, property, value)}}/>
            }
        }
        
        if (checkCustomTypeOnly) return;

        if (component[property] instanceof THREE.Vector3) {
            return <InspectorVector3 key={key} title={title} onChanged={(value) => {this.onComponentPropertyChanged(component, property, value)}} vector3={component[property]}/>
        }
        else if (component[property] instanceof THREE.Color) {
            return <InspectorColor key={key} title={title} onChanged={(value) => {this.onComponentPropertyChanged(component, property, value)}} color={component[property]}/>
        }
        else if (component[property] instanceof THREE.Vector2) {
            return <InspectorVector2 key={key} title={title} onChanged={(value) => {this.onComponentPropertyChanged(component, property, value)}} vector2={component[property]}/>
        }
        else if (type == "number") {
            return <InspectorInput key={key} onChanged={(value) => {this.onComponentPropertyChanged(component, property, value)}} title={title} value={component[property]} type="number"/>
        }
        else if (type == "boolean") {
            return <InspectorCheckbox key={key} onChanged={(value) => {this.onComponentPropertyChanged(component, property, value)}} title={title} selected={component[property]} />
        }
        else if (type == "object") {
            let valueForType = component[property].constructor.name;
            if (component[property].userData && component[property].userData.fileId) {
                valueForType = StringUtils.GetNameForPath(component[property].userData.fileId);
            }

            return <InspectorType
                key={key}
                onChanged={(value) => {this.onComponentPropertyChanged(component, property, value)}}
                title={title}
                component={component}
                property={property}
                value={valueForType}
            />
        }
    }

    private renderInspectorForComponent(component: Component): ReactElement[] {
        const componentCast = component as Component;
        let componentPropertiesHTML: ReactElement[] = [];

        // Parse component properties
        for (let property in Object.getPrototypeOf(component)) {
            try {
                const componentPropertyElement = this.renderInspectorForComponentProperty(componentCast, property);
                if (componentPropertyElement) {
                    componentPropertiesHTML.push(componentPropertyElement);
                }
            } catch (error) {
                // console.warn(error);
            }
        }

        // Parses component class instances properties
        for (let property in component) {
            try {
                if (typeof component[property] != "object") continue;
                const componentPropertyElement = this.renderInspectorForComponentProperty(componentCast, property, true);
                if (componentPropertyElement && !componentPropertiesHTML.includes(componentPropertyElement)) {
                    componentPropertiesHTML.push(componentPropertyElement);
                }
            } catch (error) {
                // console.warn(error);
            }
        }

        return componentPropertiesHTML;
    }

    private renderInspectorForGameObject(gameObject: GameObject) {
        let inspectorHTML: ReactElement[] = [];
        for (let component of gameObject.components) {
            const componentCast = component as Component;
            const componentPropertiesHTML = this.renderInspectorForComponent(componentCast)

            const componentHTML = <Collapsible 
                key={component.uuid}
                header={componentCast.classname}
                onRightMenuClicked={() => this.onRemoveComponent(component)}
                rightMenuText="x"
                >
                {componentPropertiesHTML}
            </Collapsible>

            inspectorHTML.push(componentHTML);
        }

        return inspectorHTML;
    }

    public render() {
        const componentsElements = this.renderInspectorForGameObject(this.props.gameObject);
        return (
            <div style={{
                height: "100%",
                overflow: "auto"
            }}>
                <div style={{
                    display: "flex",
                    padding: "10px"
                }}>
                    <input type="checkbox" defaultChecked={true}/>
                    <input style={{
                        width: "100%",
                        fontSize: "12px",
                        background: "#121212",
                        borderRadius: "5px",
                        color: "white",
                        border: "none",
                        outline: "none",
                        paddingLeft: "5px",
                        paddingTop: "2px",
                        paddingBottom: "2px",
                        marginRight: "10px"
                    }}
                    type="text"
                    value={this.props.gameObject.name}
                    onChange={(event) => {this.onGameObjectNameChanged(this.props.gameObject, event)}}
                    />
                </div>

                <Collapsible header="Transform">
                    <InspectorVector3 title="Position" onChanged={(value) => {this.onComponentPropertyChanged(this.props.gameObject.transform, "position", value)}} vector3={this.props.gameObject.transform.position}/>
                    <InspectorVector3 title="Rotation" onChanged={(value) => {this.onComponentPropertyChanged(this.props.gameObject.transform, "localEulerAngles", value)}} vector3={this.props.gameObject.transform.localEulerAngles}/>
                    <InspectorVector3 title="Scale" onChanged={(value) => {this.onComponentPropertyChanged(this.props.gameObject.transform, "localScale", value)}} vector3={this.props.gameObject.transform.localScale}/>
                </Collapsible>

                {componentsElements}

                <AddComponent gameObject={this.props.gameObject}/>
            </div>
        )
    }
}