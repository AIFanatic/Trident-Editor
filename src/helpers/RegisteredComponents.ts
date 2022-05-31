import { Component } from "trident/dist/esm/components/Component";

class _RegisteredComponents {
    private components: Map<string, Component>;

    constructor() {
        this.components = new Map();
    }

    public set(name: string, component: Component) {
        this.components.set(name, component);
    }

    public get(name: string): Component {
        return this.components.get(name);
    }

    public remove(name: string) {
        this.components.delete(name);
    }

    public entries(): Map<string, Component> {
        return this.components;
    }
}

export const RegisteredComponents = new _RegisteredComponents();