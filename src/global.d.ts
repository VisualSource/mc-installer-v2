/// <reference types="zangodb" />

namespace NodeJS {
    interface ProcessEnv {
        REACT_APP_CLIENT_VERSION: string
    }
}


interface Window {
    _downloads: import("./core/downloads").default;
    _db: import("./core/db").default;
    YAML: {
        parse: (str: string, options?: import("yaml").Options | undefined) => any;
        stringify: (value: any, options?: import("yaml").Options | undefined) => string;
    }
}
