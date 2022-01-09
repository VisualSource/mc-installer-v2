/// <reference types="zangodb" />


interface Window {
    _profiles: import("./core/ProfileManager").default;
    _downloads: import("./core/DownloadManager").default;
    _db: import("./core/db").default;
    YAML: {
        parse: (str: string, options?: import("yaml").Options | undefined) => any;
        stringify: (value: any, options?: import("yaml").Options | undefined) => string;
    }
}
