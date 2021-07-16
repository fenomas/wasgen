export namespace effectPrograms {
    function jump(): {
        type: any;
        freq: {
            t: number;
            p: number;
            q: any;
        }[];
        gain: {
            t: number;
            a: number;
            d: number;
            s: number;
            r: number;
        };
    };
    function coin(): {
        type: any;
        freq: {
            w: any;
            p: any;
            q: number;
        }[];
        gain: {
            t: number;
            a: number;
            s: number;
            d: number;
            r: number;
        };
    };
    function laser(): {
        type: any;
        freq: ({
            w: any;
            p: any;
            q: any;
            type?: undefined;
            freq?: undefined;
            gain?: undefined;
        } | {
            type: string;
            freq: any[];
            gain: {
                t: any;
            };
            w?: undefined;
            p?: undefined;
            q?: undefined;
        })[];
        gain: {
            t: number;
            a: number;
            d: number;
            s: number;
            r: number;
        };
    }[];
    function explosion(): ({
        type: string;
        gain: ({
            t: number;
            a: number;
            d: number;
            s: number;
            r: number;
            type?: undefined;
            freq?: undefined;
            gain?: undefined;
        } | {
            type: string;
            freq: {
                t: number;
                f: any;
                p: any;
                q: any;
            };
            gain: {
                t: number;
                d: number;
                s: number;
                r: number;
            };
            t?: undefined;
            a?: undefined;
            d?: undefined;
            s?: undefined;
            r?: undefined;
        })[];
        freq?: undefined;
        effect?: undefined;
    } | {
        type: string;
        freq: {
            t: any;
            p: any;
            q: any;
        };
        effect: number;
        gain?: undefined;
    })[];
    function bonk(): ({
        type: string;
        gain: {
            a: number;
            s: number;
            dr: number;
        };
        freq?: undefined;
        Q?: undefined;
    } | {
        type: string;
        freq: {
            t: any;
        };
        Q: any;
        gain?: undefined;
    })[];
    function kick(): ({
        type: string;
        freq: {
            p: number;
            q: number;
            t?: undefined;
        };
        gain: {
            a: number;
            h: number;
            s: number;
            d: number;
            r: number;
            t?: undefined;
        };
    } | {
        type: string;
        freq: {
            t: number;
            p?: undefined;
            q?: undefined;
        };
        gain: {
            t: number;
            a: number;
            h: number;
            s: number;
            d: number;
            r: number;
        };
    })[];
    function hihat(): ({
        type: string;
        freq: any;
        gain: {
            a: number;
            s: number;
            h: number;
            d: any;
            r: number;
        };
        Q?: undefined;
    } | {
        type: string;
        freq: {
            t: number;
        };
        Q: number;
        gain?: undefined;
    })[];
    function wind(): ({
        type: string;
        gain: {
            a: number;
            h: number;
            d: number;
            s: number;
            r: number;
        };
        Q?: undefined;
        freq?: undefined;
    } | {
        type: string;
        Q: any;
        freq: ({
            t: number;
            type?: undefined;
            freq?: undefined;
            gain?: undefined;
        } | {
            type: string;
            freq: number;
            gain: number;
            t?: undefined;
        })[];
        gain?: undefined;
    })[];
}
