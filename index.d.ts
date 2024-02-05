export = FileDownloader;
declare class FileDownloader extends EventEmitter {
    constructor(fileUrl: string, destPath: string);
    fileUrl: string;
    destPath: string;
    totalBytes: number;
    downloadedBytes: number;
    download(): Promise<void>;
    getProgress(): number;
}
import EventEmitter = require("events");
