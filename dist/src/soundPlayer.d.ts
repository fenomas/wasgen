export default function SoundPlayer(ctx: any): void;
export default class SoundPlayer {
    constructor(ctx: any);
    maxVoices: number;
    play: (program: any, freq: any, vel: any, time: any, releaseTime: any, destNode: any) => number;
    bend: (noteID: any, freq: any, timeConst: any, time: any) => void;
    release: (noteID: any, time: any) => void;
    isPlaying: (noteID: any) => boolean;
    releaseAll: (time: any) => void;
    dispose: () => void;
}
