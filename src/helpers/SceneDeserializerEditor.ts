import { SceneDeserializer } from "trident";
import { IFile } from "trident/dist/esm/interfaces/IFile";
import { ResourcesCacheEntry } from "trident/dist/esm/resources/ResourcesCache";

import * as Commands from '../commands';

export class SceneDeserializerEditor extends SceneDeserializer {
    public static async LoadFile(file: IFile): Promise<ResourcesCacheEntry> {
        return Commands.LoadFile(file.fileId);
    }
}