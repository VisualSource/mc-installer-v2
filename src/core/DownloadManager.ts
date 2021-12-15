export default class DownloadManager {
    static INSTANCE: DownloadManager | null = null;
    downloadInProgress: boolean = true;
    currentDownload: {
        item: { img: string, name: string, uuid: string}
        remaning_time: string;
        progress: number;
        totalSize: string;
        currentSize: string;
    } | null = {
        item: {img: "https://via.placeholder.com/120x80", name: "Java Runtime", uuid: "adfaeau8o"},
        remaning_time: "2:34",
        progress: 2,
        totalSize: "317 MB",
        currentSize: "3 MB"
    };
    downloadQueue: { img: string, name: string, uuid: string, btn: { text: string } }[] = [
        
    ];
    events: ((event: any)=>void)[] = [];
    constructor(){
        if(DownloadManager.INSTANCE) return DownloadManager.INSTANCE;
        DownloadManager.INSTANCE = this;
    }
    subscribe(callback: (event: any)=>void){
        this.events.push(callback);
    }
    emit(){
        for(const event of  this.events){
            event({  downloadInProgress: this.downloadInProgress })
        }
    }
    startDownload(){
       this.downloadInProgress = true;
        this.emit();
    }
    endDownload(){
        this.downloadInProgress = false;
        this.emit();
    }
}