import { Loader, MCVersion, Mod, UUID } from "./db";

interface EventEmitter {
    addEventListener(type: string, listener: (event: CustomEvent<any>) => void): void; 
}
export type QueueData = {
    name: string;
    mc: MCVersion;
    loader: Loader;
    media: Mod["media"],
    uuid: UUID;
}

export enum DownloadEvent {
    ADD_TO_QUEUE = "download://add_to_queue",
    QUEUE_UPDATE = "download://queue_update",
    UPDATE_TIME = "download://update_time",
    UPDATE_PROGRESS = "download://update_progress",
    UPDATE_SIZE = "download://update_size",
    NEXT = "download://next",
    NEXT_START = "download://next_start",
    DOWLOAD_SIZE = "download://download_size",
    DOWNLOADS_FINISH = "download://downloads_finish"   
}

export const downloadEvent = {
    emit: function(type: string,data: any = {}){
        window.dispatchEvent(new CustomEvent<any>(type,{ detail: data }));
    },
    addToQueue: function(data: QueueData){
        this.emit("add_to_queue", data);
    },
}

export default class Download {
    static INSTANCE: Download | null;
    public current: QueueData | null = null;
    public queue: QueueData[] = [
        {   
            uuid: "",
            name: "CONTENT NAME",
            mc: "1.18.1",
            loader: "fabric",
            media: {
                icon: null,
                background: "https://images.unsplash.com/photo-1641579281152-e5d633aa3775?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80",
                list: "https://images.unsplash.com/photo-1593642532744-d377ab507dc8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxMzJ8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
            }
        },
        {   
            uuid: "",
            name: "CONTENT NAME",
            mc: "1.18.1",
            loader: "fabric",
            media: {
                icon: null,
                background: "https://images.unsplash.com/photo-1641579281152-e5d633aa3775?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80",
                list: "https://images.unsplash.com/photo-1593642532744-d377ab507dc8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxMzJ8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
            }
        }
    ];
    constructor(){
        if(Download.INSTANCE) return Download.INSTANCE;
        Download.INSTANCE = this;

        let timestart = new Date();
        let i = 0;
        let size = 0;
        const test = () => {
            if(i >= 100){
                downloadEvent.emit(DownloadEvent.NEXT);
                if(this.current !== null || this.queue.length > 0) {
                    downloadEvent.emit(DownloadEvent.DOWLOAD_SIZE, "100MB");
                    i = 0;
                    size = 0;
                    timestart = new Date();
                    setTimeout(()=>test(),1000);
                }
                return;
            }
            i++;
            size++;
            const time = new Date();
            downloadEvent.emit(DownloadEvent.UPDATE_TIME,`${timestart.getMinutes() - time.getMinutes()}:${timestart.getMilliseconds() - time.getMilliseconds()}`)
            downloadEvent.emit(DownloadEvent.UPDATE_PROGRESS,i);
            downloadEvent.emit(DownloadEvent.UPDATE_SIZE,`${size}MB`);
            setTimeout(()=>test(),1000);
        }
        downloadEvent.emit(DownloadEvent.NEXT);
        test();
        
        (window as EventEmitter).addEventListener(DownloadEvent.ADD_TO_QUEUE,(event: CustomEvent<any>)=>{
            this.queue.push(event.detail);
            downloadEvent.emit(DownloadEvent.QUEUE_UPDATE);
        });
        (window as EventEmitter).addEventListener(DownloadEvent.NEXT,(event)=>{
            const data = this.queue.shift();
            if(!data) {
                this.current = null;
                downloadEvent.emit(DownloadEvent.DOWNLOADS_FINISH);
                return;
            };
            this.current = data;
            downloadEvent.emit(DownloadEvent.NEXT_START);
        });
    }

}