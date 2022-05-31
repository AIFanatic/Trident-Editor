import { Components, GameObject, Scene } from "trident";
import { StringUtils } from "../helpers/StringUtils";

export enum LightTypes {
    Directional,
    Point,
    Spot,
    Area
};

export function CreateLight(scene: Scene, type: LightTypes): GameObject {
    const gameObject = new GameObject(scene);
    gameObject.name = StringUtils.GetEnumKeyByEnumValue(LightTypes, type) + "Light";
    
    if (type == LightTypes.Directional) gameObject.AddComponent(Components.DirectionalLight);
    else if (type == LightTypes.Point) gameObject.AddComponent(Components.PointLight);
    else if (type == LightTypes.Spot) gameObject.AddComponent(Components.SpotLight);
    else if (type == LightTypes.Area) gameObject.AddComponent(Components.AreaLight);

    return gameObject;
}