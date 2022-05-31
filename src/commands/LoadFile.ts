import { ResourcesCacheEntry } from "trident/dist/esm/resources/ResourcesCache";
import { ResourcesEditor } from "../helpers/ResourcesEditor";

export async function LoadFile(path:string): Promise<ResourcesCacheEntry> {
    return ResourcesEditor.LoadAsync(path);
}