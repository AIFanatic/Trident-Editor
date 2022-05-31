import { GameObject, PrimitiveType, Scene } from "trident";
import { StringUtils } from "../helpers/StringUtils";

export function CreatePrimitive(scene: Scene, primitive: PrimitiveType): GameObject {
    const gameObject = new GameObject(scene);
    gameObject.name = StringUtils.GetEnumKeyByEnumValue(PrimitiveType, primitive);
    gameObject.CreatePrimitive(primitive);

    return gameObject;
}