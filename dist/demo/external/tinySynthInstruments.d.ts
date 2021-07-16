export function Instruments(): void;
export class Instruments {
    names: string[];
    getProg: (name: any) => ({
        w: string;
        d: number;
        r: number;
        v?: undefined;
        f?: undefined;
        s?: undefined;
        g?: undefined;
        k?: undefined;
    } | {
        w: string;
        v: number;
        f: number;
        d: number;
        s: number;
        g: number;
        k: number;
        r?: undefined;
    })[] | ({
        w: string;
        d: number;
        r: number;
        v?: undefined;
        t?: undefined;
        g?: undefined;
    } | {
        w: string;
        v: number;
        t: number;
        d: number;
        g: number;
        r?: undefined;
    })[] | ({
        w: string;
        v: number;
        d: number;
        r: number;
        g?: undefined;
    } | {
        w: string;
        v: number;
        g: number;
        d?: undefined;
        r?: undefined;
    })[] | ({
        w: string;
        d: number;
        v?: undefined;
        t?: undefined;
        s?: undefined;
        g?: undefined;
    } | {
        w: string;
        v: number;
        t: number;
        d: number;
        s: number;
        g: number;
    })[] | ({
        w: string;
        v: number;
        a: number;
        s: number;
        d?: undefined;
        g?: undefined;
    } | {
        w: string;
        v: number;
        d: number;
        g: number;
        a?: undefined;
        s?: undefined;
    })[] | ({
        w: string;
        a: number;
        d: number;
        v?: undefined;
        t?: undefined;
        g?: undefined;
    } | {
        w: string;
        v: number;
        t: number;
        d: number;
        g: number;
        a?: undefined;
    })[] | ({
        w: string;
        v: number;
        a: number;
        d: number;
        s: number;
        t?: undefined;
        g?: undefined;
    } | {
        w: string;
        v: number;
        t: number;
        g: number;
        a?: undefined;
        d?: undefined;
        s?: undefined;
    })[] | ({
        w: string;
        d: number;
        r: number;
        v?: undefined;
        t?: undefined;
        g?: undefined;
    } | {
        w: string;
        v: number;
        t: number;
        d: number;
        r: number;
        g: number;
    })[] | ({
        w: string;
        v: number;
        a: number;
        d: number;
        t?: undefined;
        f?: undefined;
        s?: undefined;
        g?: undefined;
    } | {
        w: string;
        v: number;
        t: number;
        f: number;
        s: number;
        g: number;
        a?: undefined;
        d?: undefined;
    })[] | ({
        w: string;
        v: number;
        d: number;
        r: number;
        t?: undefined;
        g?: undefined;
    } | {
        w: string;
        v: number;
        t: number;
        r: number;
        g: number;
        d?: undefined;
    })[] | ({
        w: string;
        t: number;
        f: number;
        a: number;
        d: number;
        r: number;
        s: number;
        g?: undefined;
        v?: undefined;
    } | {
        g: number;
        w: string;
        v: number;
        t: number;
        d: number;
        s: number;
        r: number;
        f?: undefined;
        a?: undefined;
    })[] | {
        w: string;
        v: number;
        d: number;
    }[] | {
        w: string;
        v: number;
        s: number;
    }[] | ({
        w: string;
        t: number;
        f: number;
        v: number;
        d: number;
        h: number;
        p: number;
        q: number;
        g?: undefined;
        r?: undefined;
    } | {
        w: string;
        g: number;
        t: number;
        v: number;
        r: number;
        h: number;
        p: number;
        f?: undefined;
        d?: undefined;
        q?: undefined;
    })[] | {
        w: string;
        f: number;
        t: number;
    }[];
}
