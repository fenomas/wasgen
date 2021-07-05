export default function Generator(audioContext?: any, destination?: any, noCompressor?: boolean, silent?: boolean): void;
export default class Generator {
    constructor(audioContext?: any, destination?: any, noCompressor?: boolean, silent?: boolean);
    version: string;
    play: (program: any, freq?: number, vel?: number, time?: number, releaseTime?: number, destNode?: any) => number;
    bend: (noteID: any, freq?: number, timeConst?: number, time?: number) => void;
    release: (noteID: any, time?: number) => void;
    noteIsPlaying: (noteID: any) => boolean;
    releaseAll: (time?: number) => void;
    compressor: any;
    now: () => any;
    maxVoices: (n?: number) => number;
    destination: (dest: any) => any;
    audioContext: (context: any) => any;
    dispose: () => void;
}
