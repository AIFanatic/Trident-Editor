import { FileBrowser } from "../helpers/FileBrowser";

export function DeleteFile(path: string): Promise<boolean> {
    return FileBrowser.is_directory(path)
    .then(is_dir => {
        if (is_dir) {
            FileBrowser.rmdir(path);
            return true;
        }
        else {
            FileBrowser.remove(path);
            return true;
        }
        return false;
    })
}