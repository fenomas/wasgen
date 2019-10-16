

/*
 * 
 *      boilerplate accessors
 * 
*/

export function Instruments() {

    var allNames = instNames.concat(drumNames).map(o => o.name)
    var lowered = allNames.map(n => n.toLowerCase())
    this.names = allNames

    this.getProg = function (name) {
        // find instrument name
        var i = nameToIndex(name)
        if (i < 0) return program1[0] || program0[i]
        if (i < program1.length) return program1[i]
        i -= program1.length
        return drums1[i] || drums0[i]
    }

    function nameToIndex(name) {
        var needle = name.toLowerCase()
        for (var i = 0; i < lowered.length; i++) {
            if (lowered[i].indexOf(needle) > -1) return i
        }
        return -1
    }

}


/*
 * 
 *      these MIDI programs from:
 *      https://github.com/g200kg/webaudio-tinysynth
 * 
*/


var instNames = [
    // 1-8 : Piano
    { name: "Acoustic Grand Piano" }, { name: "Bright Acoustic Piano" },
    { name: "Electric Grand Piano" }, { name: "Honky-tonk Piano" },
    { name: "Electric Piano 1" }, { name: "Electric Piano 2" },
    { name: "Harpsichord" }, { name: "Clavi" },
    /* 9-16 : Chromatic Perc*/
    { name: "Celesta" }, { name: "Glockenspiel" },
    { name: "Music Box" }, { name: "Vibraphone" },
    { name: "Marimba" }, { name: "Xylophone" },
    { name: "Tubular Bells" }, { name: "Dulcimer" },
    /* 17-24 : Organ */
    { name: "Drawbar Organ" }, { name: "Percussive Organ" },
    { name: "Rock Organ" }, { name: "Church Organ" },
    { name: "Reed Organ" }, { name: "Accordion" },
    { name: "Harmonica" }, { name: "Tango Accordion" },
    /* 25-32 : Guitar */
    { name: "Acoustic Guitar (nylon)" }, { name: "Acoustic Guitar (steel)" },
    { name: "Electric Guitar (jazz)" }, { name: "Electric Guitar (clean)" },
    { name: "Electric Guitar (muted)" }, { name: "Overdriven Guitar" },
    { name: "Distortion Guitar" }, { name: "Guitar harmonics" },
    /* 33-40 : Bass */
    { name: "Acoustic Bass" }, { name: "Electric Bass (finger)" },
    { name: "Electric Bass (pick)" }, { name: "Fretless Bass" },
    { name: "Slap Bass 1" }, { name: "Slap Bass 2" },
    { name: "Synth Bass 1" }, { name: "Synth Bass 2" },
    /* 41-48 : Strings */
    { name: "Violin" }, { name: "Viola" },
    { name: "Cello" }, { name: "Contrabass" },
    { name: "Tremolo Strings" }, { name: "Pizzicato Strings" },
    { name: "Orchestral Harp" }, { name: "Timpani" },
    /* 49-56 : Ensamble */
    { name: "String Ensemble 1" }, { name: "String Ensemble 2" },
    { name: "SynthStrings 1" }, { name: "SynthStrings 2" },
    { name: "Choir Aahs" }, { name: "Voice Oohs" },
    { name: "Synth Voice" }, { name: "Orchestra Hit" },
    /* 57-64 : Brass */
    { name: "Trumpet" }, { name: "Trombone" },
    { name: "Tuba" }, { name: "Muted Trumpet" },
    { name: "French Horn" }, { name: "Brass Section" },
    { name: "SynthBrass 1" }, { name: "SynthBrass 2" },
    /* 65-72 : Reed */
    { name: "Soprano Sax" }, { name: "Alto Sax" },
    { name: "Tenor Sax" }, { name: "Baritone Sax" },
    { name: "Oboe" }, { name: "English Horn" },
    { name: "Bassoon" }, { name: "Clarinet" },
    /* 73-80 : Pipe */
    { name: "Piccolo" }, { name: "Flute" },
    { name: "Recorder" }, { name: "Pan Flute" },
    { name: "Blown Bottle" }, { name: "Shakuhachi" },
    { name: "Whistle" }, { name: "Ocarina" },
    /* 81-88 : SynthLead */
    { name: "Lead 1 (square)" }, { name: "Lead 2 (sawtooth)" },
    { name: "Lead 3 (calliope)" }, { name: "Lead 4 (chiff)" },
    { name: "Lead 5 (charang)" }, { name: "Lead 6 (voice)" },
    { name: "Lead 7 (fifths)" }, { name: "Lead 8 (bass + lead)" },
    /* 89-96 : SynthPad */
    { name: "Pad 1 (new age)" }, { name: "Pad 2 (warm)" },
    { name: "Pad 3 (polysynth)" }, { name: "Pad 4 (choir)" },
    { name: "Pad 5 (bowed)" }, { name: "Pad 6 (metallic)" },
    { name: "Pad 7 (halo)" }, { name: "Pad 8 (sweep)" },
    /* 97-104 : FX */
    { name: "FX 1 (rain)" }, { name: "FX 2 (soundtrack)" },
    { name: "FX 3 (crystal)" }, { name: "FX 4 (atmosphere)" },
    { name: "FX 5 (brightness)" }, { name: "FX 6 (goblins)" },
    { name: "FX 7 (echoes)" }, { name: "FX 8 (sci-fi)" },
    /* 105-112 : Ethnic */
    { name: "Sitar" }, { name: "Banjo" },
    { name: "Shamisen" }, { name: "Koto" },
    { name: "Kalimba" }, { name: "Bag pipe" },
    { name: "Fiddle" }, { name: "Shanai" },
    /* 113-120 : Percussive */
    { name: "Tinkle Bell" }, { name: "Agogo" },
    { name: "Steel Drums" }, { name: "Woodblock" },
    { name: "Taiko Drum" }, { name: "Melodic Tom" },
    { name: "Synth Drum" }, { name: "Reverse Cymbal" },
    /* 121-128 : SE */
    { name: "Guitar Fret Noise" }, { name: "Breath Noise" },
    { name: "Seashore" }, { name: "Bird Tweet" },
    { name: "Telephone Ring" }, { name: "Helicopter" },
    { name: "Applause" }, { name: "Gunshot" },
]

var drumNames = [
    // 35
    { name: "Acoustic Bass Drum" }, { name: "Bass Drum 1" }, { name: "Side Stick" }, { name: "Acoustic Snare" },
    { name: "Hand Clap" }, { name: "Electric Snare" }, { name: "Low Floor Tom" }, { name: "Closed Hi Hat" },
    { name: "High Floor Tom" }, { name: "Pedal Hi-Hat" }, { name: "Low Tom" }, { name: "Open Hi-Hat" },
    { name: "Low-Mid Tom" }, { name: "Hi-Mid Tom" }, { name: "Crash Cymbal 1" }, { name: "High Tom" },
    { name: "Ride Cymbal 1" }, { name: "Chinese Cymbal" }, { name: "Ride Bell" }, { name: "Tambourine" },
    { name: "Splash Cymbal" }, { name: "Cowbell" }, { name: "Crash Cymbal 2" }, { name: "Vibraslap" },
    { name: "Ride Cymbal 2" }, { name: "Hi Bongo" }, { name: "Low Bongo" }, { name: "Mute Hi Conga" },
    { name: "Open Hi Conga" }, { name: "Low Conga" }, { name: "High Timbale" }, { name: "Low Timbale" },
    { name: "High Agogo" }, { name: "Low Agogo" }, { name: "Cabasa" }, { name: "Maracas" },
    { name: "Short Whistle" }, { name: "Long Whistle" }, { name: "Short Guiro" }, { name: "Long Guiro" },
    { name: "Claves" }, { name: "Hi Wood Block" }, { name: "Low Wood Block" }, { name: "Mute Cuica" },
    { name: "Open Cuica" }, { name: "Mute Triangle" }, { name: "Open Triangle" },
]




var program1 = [
    // 1-8 : Piano
    [{ w: "sine", v: .4, d: 0.7, r: 0.1, }, { w: "triangle", v: 3, d: 0.7, s: 0.1, g: 1, a: 0.01, k: -1.2 }],
    [{ w: "triangle", v: 0.4, d: 0.7, r: 0.1, }, { w: "triangle", v: 4, t: 3, d: 0.4, s: 0.1, g: 1, k: -1, a: 0.01, }],
    [{ w: "sine", d: 0.7, r: 0.1, }, { w: "triangle", v: 4, f: 2, d: 0.5, s: 0.5, g: 1, k: -1 }],
    [{ w: "sine", d: 0.7, v: 0.2, }, { w: "triangle", v: 4, t: 3, f: 2, d: 0.3, g: 1, k: -1, a: 0.01, s: 0.5, }],
    [{ w: "sine", v: 0.35, d: 0.7, }, { w: "sine", v: 3, t: 7, f: 1, d: 1, s: 1, g: 1, k: -.7 }],
    [{ w: "sine", v: 0.35, d: 0.7, }, { w: "sine", v: 8, t: 7, f: 1, d: 0.5, s: 1, g: 1, k: -.7 }],
    [{ w: "sawtooth", v: 0.34, d: 2, }, { w: "sine", v: 8, f: 0.1, d: 2, s: 1, r: 2, g: 1, }],
    [{ w: "triangle", v: 0.34, d: 1.5, }, { w: "square", v: 6, f: 0.1, d: 1.5, s: 0.5, r: 2, g: 1, }],
    /* 9-16 : Chromatic Perc*/
    [{ w: "sine", d: 0.3, r: 0.3, }, { w: "sine", v: 7, t: 11, d: 0.03, g: 1, }],
    [{ w: "sine", d: 0.3, r: 0.3, }, { w: "sine", v: 11, t: 6, d: 0.2, s: 0.4, g: 1, }],
    [{ w: "sine", v: 0.2, d: 0.3, r: 0.3, }, { w: "sine", v: 11, t: 5, d: 0.1, s: 0.4, g: 1, }],
    [{ w: "sine", v: 0.2, d: 0.6, r: 0.6, }, { w: "triangle", v: 11, t: 5, f: 1, s: 0.5, g: 1, }],
    [{ w: "sine", v: 0.3, d: 0.2, r: 0.2, }, { w: "sine", v: 6, t: 5, d: 0.02, g: 1, }],
    [{ w: "sine", v: 0.3, d: 0.2, r: 0.2, }, { w: "sine", v: 7, t: 11, d: 0.03, g: 1, }],
    [{ w: "sine", v: 0.2, d: 1, r: 1, }, { w: "sine", v: 11, t: 3.5, d: 1, r: 1, g: 1, }],
    [{ w: "triangle", v: 0.2, d: 0.5, r: 0.2, }, { w: "sine", v: 6, t: 2.5, d: 0.2, s: 0.1, r: 0.2, g: 1, }],
    /* 17-24 : Organ */
    [{ w: "w9999", v: 0.22, s: 0.9, }, { w: "w9999", v: 0.22, t: 2, f: 2, s: 0.9, }],
    [{ w: "w9999", v: 0.2, s: 1, }, { w: "sine", v: 11, t: 6, f: 2, s: 0.1, g: 1, h: 0.006, r: 0.002, d: 0.002, }, { w: "w9999", v: 0.2, t: 2, f: 1, h: 0, s: 1, }],
    [{ w: "w9999", v: 0.2, d: 0.1, s: 0.9, }, { w: "w9999", v: 0.25, t: 4, f: 2, s: 0.5, }],
    [{ w: "w9999", v: 0.3, a: 0.04, s: 0.9, }, { w: "w9999", v: 0.2, t: 8, f: 2, a: 0.04, s: 0.9, }],
    [{ w: "sine", v: 0.2, a: 0.02, d: 0.05, s: 1, }, { w: "sine", v: 6, t: 3, f: 1, a: 0.02, d: 0.05, s: 1, g: 1, }],
    [{ w: "triangle", v: 0.2, a: 0.02, d: 0.05, s: 0.8, }, { w: "square", v: 7, t: 3, f: 1, d: 0.05, s: 1.5, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.02, d: 0.2, s: 0.5, }, { w: "square", v: 1, d: 0.03, s: 2, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.02, d: 0.1, s: 0.8, }, { w: "square", v: 1, a: 0.3, d: 0.1, s: 2, g: 1, }],
    /* 25-32 : Guitar */
    [{ w: "sine", v: 0.3, d: 0.5, f: 1, }, { w: "triangle", v: 5, t: 3, f: -1, d: 1, s: 0.1, g: 1, }],
    [{ w: "sine", v: 0.4, d: 0.6, f: 1, }, { w: "triangle", v: 12, t: 3, d: 0.6, s: 0.1, g: 1, f: -1, }],
    [{ w: "triangle", v: 0.3, d: 1, f: 1, }, { w: "triangle", v: 6, f: -1, d: 0.4, s: 0.5, g: 1, t: 3, }],
    [{ w: "sine", v: 0.3, d: 1, f: -1, }, { w: "triangle", v: 11, f: 1, d: 0.4, s: 0.5, g: 1, t: 3, }],
    [{ w: "sine", v: 0.4, d: 0.1, r: 0.01 }, { w: "sine", v: 7, g: 1, }],
    [{ w: "triangle", v: 0.4, d: 1, f: 1, }, { w: "square", v: 4, f: -1, d: 1, s: 0.7, g: 1, }],//[{w:"triangle",v:0.35,d:1,f:1,},{w:"square",v:7,f:-1,d:0.3,s:0.5,g:1,}],
    [{ w: "triangle", v: 0.35, d: 1, f: 1, }, { w: "square", v: 7, f: -1, d: 0.3, s: 0.5, g: 1, }],//[{w:"triangle",v:0.4,d:1,f:1,},{w:"square",v:4,f:-1,d:1,s:0.7,g:1,}],//[{w:"triangle",v:0.4,d:1,},{w:"square",v:4,f:2,d:1,s:0.7,g:1,}],
    [{ w: "sine", v: 0.2, t: 1.5, a: 0.005, h: 0.2, d: 0.6, }, { w: "sine", v: 11, t: 5, f: 2, d: 1, s: 0.5, g: 1, }],
    /* 33-40 : Bass */
    [{ w: "sine", d: 0.3, }, { w: "sine", v: 4, t: 3, d: 1, s: 1, g: 1, }],
    [{ w: "sine", d: 0.3, }, { w: "sine", v: 4, t: 3, d: 1, s: 1, g: 1, }],
    [{ w: "w9999", d: 0.3, v: 0.7, s: 0.5, }, { w: "sawtooth", v: 1.2, d: 0.02, s: 0.5, g: 1, h: 0, r: 0.02, }],
    [{ w: "sine", d: 0.3, }, { w: "sine", v: 4, t: 3, d: 1, s: 1, g: 1, }],
    [{ w: "triangle", v: 0.3, t: 2, d: 1, }, { w: "triangle", v: 15, t: 2.5, d: 0.04, s: 0.1, g: 1, }],
    [{ w: "triangle", v: 0.3, t: 2, d: 1, }, { w: "triangle", v: 15, t: 2.5, d: 0.04, s: 0.1, g: 1, }],
    [{ w: "triangle", d: 0.7, }, { w: "square", v: 0.4, t: 0.5, f: 1, d: 0.2, s: 10, g: 1, }],
    [{ w: "triangle", d: 0.7, }, { w: "square", v: 0.4, t: 0.5, f: 1, d: 0.2, s: 10, g: 1, }],
    /* 41-48 : Strings */
    [{ w: "sawtooth", v: 0.4, a: 0.1, d: 11, }, { w: "sine", v: 5, d: 11, s: 0.2, g: 1, }],
    [{ w: "sawtooth", v: 0.4, a: 0.1, d: 11, }, { w: "sine", v: 5, d: 11, s: 0.2, g: 1, }],
    [{ w: "sawtooth", v: 0.4, a: 0.1, d: 11, }, { w: "sine", v: 5, t: 0.5, d: 11, s: 0.2, g: 1, }],
    [{ w: "sawtooth", v: 0.4, a: 0.1, d: 11, }, { w: "sine", v: 5, t: 0.5, d: 11, s: 0.2, g: 1, }],
    [{ w: "sine", v: 0.4, a: 0.1, d: 11, }, { w: "sine", v: 6, f: 2.5, d: 0.05, s: 1.1, g: 1, }],
    [{ w: "sine", v: 0.3, d: 0.1, r: 0.1, }, { w: "square", v: 4, t: 3, d: 1, s: 0.2, g: 1, }],
    [{ w: "sine", v: 0.3, d: 0.5, r: 0.5, }, { w: "sine", v: 7, t: 2, f: 2, d: 1, r: 1, g: 1, }],
    [{ w: "triangle", v: 0.6, h: 0.03, d: 0.3, r: 0.3, t: 0.5, }, { w: "n0", v: 8, t: 1.5, d: 0.08, r: 0.08, g: 1, }],
    /* 49-56 : Ensamble */
    [{ w: "sawtooth", v: 0.3, a: 0.03, s: 0.5, }, { w: "sawtooth", v: 0.2, t: 2, f: 2, d: 1, s: 2, }],
    [{ w: "sawtooth", v: 0.3, f: -2, a: 0.03, s: 0.5, }, { w: "sawtooth", v: 0.2, t: 2, f: 2, d: 1, s: 2, }],
    [{ w: "sawtooth", v: 0.2, a: 0.02, s: 1, }, { w: "sawtooth", v: 0.2, t: 2, f: 2, a: 1, d: 1, s: 1, }],
    [{ w: "sawtooth", v: 0.2, a: 0.02, s: 1, }, { w: "sawtooth", v: 0.2, f: 2, a: 0.02, d: 1, s: 1, }],
    [{ w: "triangle", v: 0.3, a: 0.03, s: 1, }, { w: "sine", v: 3, t: 5, f: 1, d: 1, s: 1, g: 1, }],
    [{ w: "sine", v: 0.4, a: 0.03, s: 0.9, }, { w: "sine", v: 1, t: 2, f: 3, d: 0.03, s: 0.2, g: 1, }],
    [{ w: "triangle", v: 0.6, a: 0.05, s: 0.5, }, { w: "sine", v: 1, f: 0.8, d: 0.2, s: 0.2, g: 1, }],
    [{ w: "square", v: 0.15, a: 0.01, d: 0.2, r: 0.2, t: 0.5, h: 0.03, }, { w: "square", v: 4, f: 0.5, d: 0.2, r: 11, a: 0.01, g: 1, h: 0.02, }, { w: "square", v: 0.15, t: 4, f: 1, a: 0.02, d: 0.15, r: 0.15, h: 0.03, }, { g: 3, w: "square", v: 4, f: -0.5, a: 0.01, h: 0.02, d: 0.15, r: 11, }],
    /* 57-64 : Brass */
    [{ w: "square", v: 0.2, a: 0.01, d: 1, s: 0.6, r: 0.04, }, { w: "sine", v: 1, d: 0.1, s: 4, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.02, d: 1, s: 0.5, r: 0.08, }, { w: "sine", v: 1, d: 0.1, s: 4, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.04, d: 1, s: 0.4, r: 0.08, }, { w: "sine", v: 1, d: 0.1, s: 4, g: 1, }],
    [{ w: "square", v: 0.15, a: 0.04, s: 1, }, { w: "sine", v: 2, d: 0.1, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.02, d: 1, s: 0.5, r: 0.08, }, { w: "sine", v: 1, d: 0.1, s: 4, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.02, d: 1, s: 0.6, r: 0.08, }, { w: "sine", v: 1, f: 0.2, d: 0.1, s: 4, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.02, d: 0.5, s: 0.7, r: 0.08, }, { w: "sine", v: 1, d: 0.1, s: 4, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.02, d: 1, s: 0.5, r: 0.08, }, { w: "sine", v: 1, d: 0.1, s: 4, g: 1, }],
    /* 65-72 : Reed */
    [{ w: "square", v: 0.2, a: 0.02, d: 2, s: 0.6, }, { w: "sine", v: 2, d: 1, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.02, d: 2, s: 0.6, }, { w: "sine", v: 2, d: 1, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.02, d: 1, s: 0.6, }, { w: "sine", v: 2, d: 1, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.02, d: 1, s: 0.6, }, { w: "sine", v: 2, d: 1, g: 1, }],
    [{ w: "sine", v: 0.4, a: 0.02, d: 0.7, s: 0.5, }, { w: "square", v: 5, t: 2, d: 0.2, s: 0.5, g: 1, }],
    [{ w: "sine", v: 0.3, a: 0.05, d: 0.2, s: 0.8, }, { w: "sawtooth", v: 6, f: 0.1, d: 0.1, s: 0.3, g: 1, }],
    [{ w: "sine", v: 0.3, a: 0.03, d: 0.2, s: 0.4, }, { w: "square", v: 7, f: 0.2, d: 1, s: 0.1, g: 1, }],
    [{ w: "square", v: 0.2, a: 0.05, d: 0.1, s: 0.8, }, { w: "square", v: 4, d: 0.1, s: 1.1, g: 1, }],
    /* 73-80 : Pipe */
    [{ w: "sine", a: 0.02, d: 2, }, { w: "sine", v: 6, t: 2, d: 0.04, g: 1, }],
    [{ w: "sine", v: 0.7, a: 0.03, d: 0.4, s: 0.4, }, { w: "sine", v: 4, t: 2, f: 0.2, d: 0.4, g: 1, }],
    [{ w: "sine", v: 0.7, a: 0.02, d: 0.4, s: 0.6, }, { w: "sine", v: 3, t: 2, d: 0, s: 1, g: 1, }],
    [{ w: "sine", v: 0.4, a: 0.06, d: 0.3, s: 0.3, }, { w: "sine", v: 7, t: 2, d: 0.2, s: 0.2, g: 1, }],
    [{ w: "sine", a: 0.02, d: 0.3, s: 0.3, }, { w: "sawtooth", v: 3, t: 2, d: 0.3, g: 1, }],
    [{ w: "sine", v: 0.4, a: 0.02, d: 2, s: 0.1, }, { w: "sawtooth", v: 8, t: 2, f: 1, d: 0.5, g: 1, }],
    [{ w: "sine", v: 0.7, a: 0.03, d: 0.5, s: 0.3, }, { w: "sine", v: 0.003, t: 0, f: 4, d: 0.1, s: 0.002, g: 1, }],
    [{ w: "sine", v: 0.7, a: 0.02, d: 2, }, { w: "sine", v: 1, t: 2, f: 1, d: 0.02, g: 1, }],
    /* 81-88 : SynthLead */
    [{ w: "square", v: 0.3, d: 1, s: 0.5, }, { w: "square", v: 1, f: 0.2, d: 1, s: 0.5, g: 1, }],
    [{ w: "sawtooth", v: 0.3, d: 2, s: 0.5, }, { w: "square", v: 2, f: 0.1, s: 0.5, g: 1, }],
    [{ w: "triangle", v: 0.5, a: 0.05, d: 2, s: 0.6, }, { w: "sine", v: 4, t: 2, g: 1, }],
    [{ w: "triangle", v: 0.3, a: 0.01, d: 2, s: 0.3, }, { w: "sine", v: 22, t: 2, f: 1, d: 0.03, s: 0.2, g: 1, }],
    [{ w: "sawtooth", v: 0.3, d: 1, s: 0.5, }, { w: "sine", v: 11, t: 11, a: 0.2, d: 0.05, s: 0.3, g: 1, }],
    [{ w: "sine", v: 0.3, a: 0.06, d: 1, s: 0.5, }, { w: "sine", v: 7, f: 1, d: 1, s: 0.2, g: 1, }],
    [{ w: "sawtooth", v: 0.3, a: 0.03, d: 0.7, s: 0.3, r: 0.2, }, { w: "sawtooth", v: 0.3, t: 0.75, d: 0.7, a: 0.1, s: 0.3, r: 0.2, }],
    [{ w: "triangle", v: 0.3, a: 0.01, d: 0.7, s: 0.5, }, { w: "square", v: 5, t: 0.5, d: 0.7, s: 0.5, g: 1, }],
    /* 89-96 : SynthPad */
    [{ w: "triangle", v: 0.3, a: 0.02, d: 0.3, s: 0.3, r: 0.3, }, { w: "square", v: 3, t: 4, f: 1, a: 0.02, d: 0.1, s: 1, g: 1, }, { w: "triangle", v: 0.08, t: 0.5, a: 0.1, h: 0, d: 0.1, s: 0.5, r: 0.1, b: 0, c: 0, }],
    [{ w: "sine", v: 0.3, a: 0.05, d: 1, s: 0.7, r: 0.3, }, { w: "sine", v: 2, f: 1, d: 0.3, s: 1, g: 1, }],
    [{ w: "square", v: 0.3, a: 0.03, d: 0.5, s: 0.3, r: 0.1, }, { w: "square", v: 4, f: 1, a: 0.03, d: 0.1, g: 1, }],
    [{ w: "triangle", v: 0.3, a: 0.08, d: 1, s: 0.3, r: 0.1, }, { w: "square", v: 2, f: 1, d: 0.3, s: 0.3, g: 1, t: 4, a: 0.08, }],
    [{ w: "sine", v: 0.3, a: 0.05, d: 1, s: 0.3, r: 0.1, }, { w: "sine", v: 0.1, t: 2.001, f: 1, d: 1, s: 50, g: 1, }],
    [{ w: "triangle", v: 0.3, a: 0.03, d: 0.7, s: 0.3, r: 0.2, }, { w: "sine", v: 12, t: 7, f: 1, d: 0.5, s: 1.7, g: 1, }],
    [{ w: "sine", v: 0.3, a: 0.05, d: 1, s: 0.3, r: 0.1, }, { w: "sawtooth", v: 22, t: 6, d: 0.06, s: 0.3, g: 1, }],
    [{ w: "triangle", v: 0.3, a: 0.05, d: 11, r: 0.3, }, { w: "triangle", v: 1, d: 1, s: 8, g: 1, }],
    /* 97-104 : FX */
    [{ w: "sawtooth", v: 0.3, d: 4, s: 0.8, r: 0.1, }, { w: "square", v: 1, t: 2, f: 8, a: 1, d: 1, s: 1, r: 0.1, g: 1, }],
    [{ w: "triangle", v: 0.3, d: 1, s: 0.5, t: 0.8, a: 0.2, p: 1.25, q: 0.2, }, { w: "sawtooth", v: 0.2, a: 0.2, d: 0.3, s: 1, t: 1.2, p: 1.25, q: 0.2, }],
    [{ w: "sine", v: 0.3, d: 1, s: 0.3, }, { w: "square", v: 22, t: 11, d: 0.5, s: 0.1, g: 1, }],
    [{ w: "sawtooth", v: 0.3, a: 0.04, d: 1, s: 0.8, r: 0.1, }, { w: "square", v: 1, t: 0.5, d: 1, s: 2, g: 1, }],
    [{ w: "triangle", v: 0.3, d: 1, s: 0.3, }, { w: "sine", v: 22, t: 6, d: 0.6, s: 0.05, g: 1, }],
    [{ w: "sine", v: 0.6, a: 0.1, d: 0.05, s: 0.4, }, { w: "sine", v: 5, t: 5, f: 1, d: 0.05, s: 0.3, g: 1, }],
    [{ w: "sine", a: 0.1, d: 0.05, s: 0.4, v: 0.8, }, { w: "sine", v: 5, t: 5, f: 1, d: 0.05, s: 0.3, g: 1, }],
    [{ w: "square", v: 0.3, a: 0.1, d: 0.1, s: 0.4, }, { w: "square", v: 1, f: 1, d: 0.3, s: 0.1, g: 1, }],
    /* 105-112 : Ethnic */
    [{ w: "sawtooth", v: 0.3, d: 0.5, r: 0.5, }, { w: "sawtooth", v: 11, t: 5, d: 0.05, g: 1, }],
    [{ w: "square", v: 0.3, d: 0.2, r: 0.2, }, { w: "square", v: 7, t: 3, d: 0.05, g: 1, }],
    [{ w: "triangle", d: 0.2, r: 0.2, }, { w: "square", v: 9, t: 3, d: 0.1, r: 0.1, g: 1, }],
    [{ w: "triangle", d: 0.3, r: 0.3, }, { w: "square", v: 6, t: 3, d: 1, r: 1, g: 1, }],
    [{ w: "triangle", v: 0.4, d: 0.2, r: 0.2, }, { w: "square", v: 22, t: 12, d: 0.1, r: 0.1, g: 1, }],
    [{ w: "sine", v: 0.25, a: 0.02, d: 0.05, s: 0.8, }, { w: "square", v: 1, t: 2, d: 0.03, s: 11, g: 1, }],
    [{ w: "sine", v: 0.3, a: 0.05, d: 11, }, { w: "square", v: 7, t: 3, f: 1, s: 0.7, g: 1, }],
    [{ w: "square", v: 0.3, a: 0.05, d: 0.1, s: 0.8, }, { w: "square", v: 4, d: 0.1, s: 1.1, g: 1, }],
    /* 113-120 : Percussive */
    [{ w: "sine", v: 0.4, d: 0.3, r: 0.3, }, { w: "sine", v: 7, t: 9, d: 0.1, r: 0.1, g: 1, }],
    [{ w: "sine", v: 0.7, d: 0.1, r: 0.1, }, { w: "sine", v: 22, t: 7, d: 0.05, g: 1, }],
    [{ w: "sine", v: 0.6, d: 0.15, r: 0.15, }, { w: "square", v: 11, t: 3.2, d: 0.1, r: 0.1, g: 1, }],
    [{ w: "sine", v: 0.8, d: 0.07, r: 0.07, }, { w: "square", v: 11, t: 7, r: 0.01, g: 1, }],
    [{ w: "triangle", v: 0.7, t: 0.5, d: 0.2, r: 0.2, p: 0.95, }, { w: "n0", v: 9, g: 1, d: 0.2, r: 0.2, }],
    [{ w: "sine", v: 0.7, d: 0.1, r: 0.1, p: 0.9, }, { w: "square", v: 14, t: 2, d: 0.005, r: 0.005, g: 1, }],
    [{ w: "square", d: 0.15, r: 0.15, p: 0.5, }, { w: "square", v: 4, t: 5, d: 0.001, r: 0.001, g: 1, }],
    [{ w: "n1", v: 0.3, a: 1, s: 1, d: 0.15, r: 0, t: 0.5, }],
    /* 121-128 : SE */
    [{ w: "sine", t: 12.5, d: 0, r: 0, p: 0.5, v: 0.3, h: 0.2, q: 0.5, }, { g: 1, w: "sine", v: 1, t: 2, d: 0, r: 0, s: 1, }, { g: 1, w: "n0", v: 0.2, t: 2, a: 0.6, h: 0, d: 0.1, r: 0.1, b: 0, c: 0, }],
    [{ w: "n0", v: 0.2, a: 0.05, h: 0.02, d: 0.02, r: 0.02, }],
    [{ w: "n0", v: 0.4, a: 1, d: 1, t: 0.25, }],
    [{ w: "sine", v: 0.3, a: 0.1, d: 1, s: 0.5, }, { w: "sine", v: 4, t: 0, f: 1.5, d: 1, s: 1, r: 0.1, g: 1, }, { g: 1, w: "sine", v: 4, t: 0, f: 2, a: 0.6, h: 0, d: 0.1, s: 1, r: 0.1, b: 0, c: 0, }],
    [{ w: "square", v: 0.3, t: 0.25, d: 11, s: 1, }, { w: "square", v: 12, t: 0, f: 8, d: 1, s: 1, r: 11, g: 1, }],
    [{ w: "n0", v: 0.4, t: 0.5, a: 1, d: 11, s: 1, r: 0.5, }, { w: "square", v: 1, t: 0, f: 14, d: 1, s: 1, r: 11, g: 1, }],
    [{ w: "sine", t: 0, f: 1221, a: 0.2, d: 1, r: 0.25, s: 1, }, { g: 1, w: "n0", v: 3, t: 0.5, d: 1, s: 1, r: 1, }],
    [{ w: "sine", d: 0.4, r: 0.4, p: 0.1, t: 2.5, v: 1, }, { w: "n0", v: 12, t: 2, d: 1, r: 1, g: 1, }],
]

var program0 = [
    // 1-8 : Piano
    [{ w: "triangle", v: .5, d: .7 }], [{ w: "triangle", v: .5, d: .7 }],
    [{ w: "triangle", v: .5, d: .7 }], [{ w: "triangle", v: .5, d: .7 }],
    [{ w: "triangle", v: .5, d: .7 }], [{ w: "triangle", v: .5, d: .7 }],
    [{ w: "sawtooth", v: .3, d: .7 }], [{ w: "sawtooth", v: .3, d: .7 }],
    /* 9-16 : Chromatic Perc*/
    [{ w: "sine", v: .5, d: .3, r: .3 }], [{ w: "triangle", v: .5, d: .3, r: .3 }],
    [{ w: "square", v: .2, d: .3, r: .3 }], [{ w: "square", v: .2, d: .3, r: .3 }],
    [{ w: "sine", v: .5, d: .1, r: .1 }], [{ w: "sine", v: .5, d: .1, r: .1 }],
    [{ w: "square", v: .2, d: 1, r: 1 }], [{ w: "sawtooth", v: .3, d: .7, r: .7 }],
    /* 17-24 : Organ */
    [{ w: "sine", v: 0.5, a: 0.01, s: 1 }], [{ w: "sine", v: 0.7, d: 0.02, s: 0.7 }],
    [{ w: "square", v: .2, s: 1 }], [{ w: "triangle", v: .5, a: .01, s: 1 }],
    [{ w: "square", v: .2, a: .02, s: 1 }], [{ w: "square", v: 0.2, a: 0.02, s: 1 }],
    [{ w: "square", v: 0.2, a: 0.02, s: 1 }], [{ w: "square", v: .2, a: .05, s: 1 }],
    /* 25-32 : Guitar */
    [{ w: "triangle", v: .5, d: .5 }], [{ w: "square", v: .2, d: .6 }],
    [{ w: "square", v: .2, d: .6 }], [{ w: "triangle", v: .8, d: .6 }],
    [{ w: "triangle", v: .4, d: .05 }], [{ w: "square", v: .2, d: 1 }],
    [{ w: "square", v: .2, d: 1 }], [{ w: "sine", v: .4, d: .6 }],
    /* 33-40 : Bass */
    [{ w: "triangle", v: .7, d: .4 }], [{ w: "triangle", v: .7, d: .7 }],
    [{ w: "triangle", v: .7, d: .7 }], [{ w: "triangle", v: .7, d: .7 }],
    [{ w: "square", v: .3, d: .2 }], [{ w: "square", v: .3, d: .2 }],
    [{ w: "square", v: .3, d: .1, s: .2 }], [{ w: "sawtooth", v: .4, d: .1, s: .2 }],
    /* 41-48 : Strings */
    [{ w: "sawtooth", v: .2, a: .02, s: 1 }], [{ w: "sawtooth", v: .2, a: .02, s: 1 }],
    [{ w: "sawtooth", v: .2, a: .02, s: 1 }], [{ w: "sawtooth", v: .2, a: .02, s: 1 }],
    [{ w: "sawtooth", v: .2, a: .02, s: 1 }], [{ w: "sawtooth", v: .3, d: .1 }],
    [{ w: "sawtooth", v: .3, d: .5, r: .5 }], [{ w: "triangle", v: .6, d: .1, r: .1, h: 0.03, p: 0.8 }],
    /* 49-56 : Ensamble */
    [{ w: "sawtooth", v: .2, a: .02, s: 1 }], [{ w: "sawtooth", v: .2, a: .02, s: 1 }],
    [{ w: "sawtooth", v: .2, a: .02, s: 1 }], [{ w: "sawtooth", v: .2, a: .02, s: 1 }],
    [{ w: "triangle", v: .3, a: .03, s: 1 }], [{ w: "sine", v: .3, a: .03, s: 1 }],
    [{ w: "triangle", v: .3, a: .05, s: 1 }], [{ w: "sawtooth", v: .5, a: .01, d: .1 }],
    /* 57-64 : Brass */
    [{ w: "square", v: .3, a: .05, d: .2, s: .6 }], [{ w: "square", v: .3, a: .05, d: .2, s: .6 }],
    [{ w: "square", v: .3, a: .05, d: .2, s: .6 }], [{ w: "square", v: 0.2, a: .05, d: 0.01, s: 1 }],
    [{ w: "square", v: .3, a: .05, s: 1 }], [{ w: "square", v: .3, s: .7 }],
    [{ w: "square", v: .3, s: .7 }], [{ w: "square", v: .3, s: .7 }],
    /* 65-72 : Reed */
    [{ w: "square", v: .3, a: .02, d: 2 }], [{ w: "square", v: .3, a: .02, d: 2 }],
    [{ w: "square", v: .3, a: .03, d: 2 }], [{ w: "square", v: .3, a: .04, d: 2 }],
    [{ w: "square", v: .3, a: .02, d: 2 }], [{ w: "square", v: .3, a: .05, d: 2 }],
    [{ w: "square", v: .3, a: .03, d: 2 }], [{ w: "square", v: .3, a: .03, d: 2 }],
    /* 73-80 : Pipe */
    [{ w: "sine", v: .7, a: .02, d: 2 }], [{ w: "sine", v: .7, a: .02, d: 2 }],
    [{ w: "sine", v: .7, a: .02, d: 2 }], [{ w: "sine", v: .7, a: .02, d: 2 }],
    [{ w: "sine", v: .7, a: .02, d: 2 }], [{ w: "sine", v: .7, a: .02, d: 2 }],
    [{ w: "sine", v: .7, a: .02, d: 2 }], [{ w: "sine", v: .7, a: .02, d: 2 }],
    /* 81-88 : SynthLead */
    [{ w: "square", v: .3, s: .7 }], [{ w: "sawtooth", v: .4, s: .7 }],
    [{ w: "triangle", v: .5, s: .7 }], [{ w: "sawtooth", v: .4, s: .7 }],
    [{ w: "sawtooth", v: .4, d: 12 }], [{ w: "sine", v: .4, a: .06, d: 12 }],
    [{ w: "sawtooth", v: .4, d: 12 }], [{ w: "sawtooth", v: .4, d: 12 }],
    /* 89-96 : SynthPad */
    [{ w: "sawtooth", v: .3, d: 12 }], [{ w: "triangle", v: .5, d: 12 }],
    [{ w: "square", v: .3, d: 12 }], [{ w: "triangle", v: .5, a: .08, d: 11 }],
    [{ w: "sawtooth", v: .5, a: .05, d: 11 }], [{ w: "sawtooth", v: .5, d: 11 }],
    [{ w: "triangle", v: .5, d: 11 }], [{ w: "triangle", v: .5, d: 11 }],
    /* 97-104 : FX */
    [{ w: "triangle", v: .5, d: 11 }], [{ w: "triangle", v: .5, d: 11 }],
    [{ w: "square", v: .3, d: 11 }], [{ w: "sawtooth", v: 0.5, a: 0.04, d: 11 }],
    [{ w: "sawtooth", v: .5, d: 11 }], [{ w: "triangle", v: .5, a: .8, d: 11 }],
    [{ w: "triangle", v: .5, d: 11 }], [{ w: "square", v: .3, d: 11 }],
    /* 105-112 : Ethnic */
    [{ w: "sawtooth", v: .3, d: 1, r: 1 }], [{ w: "sawtooth", v: .5, d: .3 }],
    [{ w: "sawtooth", v: .5, d: .3, r: .3 }], [{ w: "sawtooth", v: .5, d: .3, r: .3 }],
    [{ w: "square", v: .3, d: .2, r: .2 }], [{ w: "square", v: .3, a: .02, d: 2 }],
    [{ w: "sawtooth", v: .2, a: .02, d: .7 }], [{ w: "triangle", v: .5, d: 1 }],
    /* 113-120 : Percussive */
    [{ w: "sawtooth", v: .3, d: .3, r: .3 }], [{ w: "sine", v: .8, d: .1, r: .1 }],
    [{ w: "square", v: .2, d: .1, r: .1, p: 1.05 }], [{ w: "sine", v: .8, d: .05, r: .05 }],
    [{ w: "triangle", v: 0.5, d: 0.1, r: 0.1, p: 0.96 }], [{ w: "triangle", v: 0.5, d: 0.1, r: 0.1, p: 0.97 }],
    [{ w: "square", v: .3, d: .1, r: .1, }], [{ w: "n1", v: 0.3, a: 1, s: 1, d: 0.15, r: 0, t: 0.5, }],
    /* 121-128 : SE */
    [{ w: "triangle", v: 0.5, d: 0.03, t: 0, f: 1332, r: 0.001, p: 1.1 }],
    [{ w: "n0", v: 0.2, t: 0.1, d: 0.02, a: 0.05, h: 0.02, r: 0.02 }],
    [{ w: "n0", v: 0.4, a: 1, d: 1, t: 0.25, }],
    [{ w: "sine", v: 0.3, a: 0.8, d: 1, t: 0, f: 1832 }],
    [{ w: "triangle", d: 0.5, t: 0, f: 444, s: 1, }],
    [{ w: "n0", v: 0.4, d: 1, t: 0, f: 22, s: 1, }],
    [{ w: "n0", v: 0.5, a: 0.2, d: 11, t: 0, f: 44 }],
    [{ w: "n0", v: 0.5, t: 0.25, d: 0.4, r: 0.4 }],
]

var drums1 = [
/*35*/[{ w: "triangle", t: 0, f: 70, v: 1, d: 0.05, h: 0.03, p: 0.9, q: 0.1, }, { w: "n0", g: 1, t: 6, v: 17, r: 0.01, h: 0, p: 0, }],
    [{ w: "triangle", t: 0, f: 88, v: 1, d: 0.05, h: 0.03, p: 0.5, q: 0.1, }, { w: "n0", g: 1, t: 5, v: 42, r: 0.01, h: 0, p: 0, }],
    [{ w: "n0", f: 222, p: 0, t: 0, r: 0.01, h: 0, }],
    [{ w: "triangle", v: 0.3, f: 180, d: 0.05, t: 0, h: 0.03, p: 0.9, q: 0.1, }, { w: "n0", v: 0.6, t: 0, f: 70, h: 0.02, r: 0.01, p: 0, }, { g: 1, w: "square", v: 2, t: 0, f: 360, r: 0.01, b: 0, c: 0, }],
    [{ w: "square", f: 1150, v: 0.34, t: 0, r: 0.03, h: 0.025, d: 0.03, }, { g: 1, w: "n0", t: 0, f: 13, h: 0.025, d: 0.1, s: 1, r: 0.1, v: 1, }],
/*40*/[{ w: "triangle", f: 200, v: 1, d: 0.06, t: 0, r: 0.06, }, { w: "n0", g: 1, t: 0, f: 400, v: 12, r: 0.02, d: 0.02, }],
    [{ w: "triangle", f: 100, v: 0.9, d: 0.12, h: 0.02, p: 0.5, t: 0, r: 0.12, }, { g: 1, w: "n0", v: 5, t: 0.4, h: 0.015, d: 0.005, r: 0.005, }],
    [{ w: "n1", f: 390, v: 0.25, r: 0.01, t: 0, }],
    [{ w: "triangle", f: 120, v: 0.9, d: 0.12, h: 0.02, p: 0.5, t: 0, r: 0.12, }, { g: 1, w: "n0", v: 5, t: 0.5, h: 0.015, d: 0.005, r: 0.005, }],
    [{ w: "n1", v: 0.25, f: 390, r: 0.03, t: 0, h: 0.005, d: 0.03, }],
/*45*/[{ w: "triangle", f: 140, v: 0.9, d: 0.12, h: 0.02, p: 0.5, t: 0, r: 0.12, }, { g: 1, w: "n0", v: 5, t: 0.3, h: 0.015, d: 0.005, r: 0.005, }],
    [{ w: "n1", v: 0.25, f: 390, t: 0, d: 0.2, r: 0.2, }, { w: "n0", v: 0.3, t: 0, c: 0, f: 440, h: 0.005, d: 0.05, }],
    [{ w: "triangle", f: 155, v: 0.9, d: 0.12, h: 0.02, p: 0.5, t: 0, r: 0.12, }, { g: 1, w: "n0", v: 5, t: 0.3, h: 0.015, d: 0.005, r: 0.005, }],
    [{ w: "triangle", f: 180, v: 0.9, d: 0.12, h: 0.02, p: 0.5, t: 0, r: 0.12, }, { g: 1, w: "n0", v: 5, t: 0.3, h: 0.015, d: 0.005, r: 0.005, }],
    [{ w: "n1", v: 0.3, f: 1200, d: 0.2, r: 0.2, h: 0.05, t: 0, }, { w: "n1", t: 0, v: 1, d: 0.1, r: 0.1, p: 1.2, f: 440, }],
/*50*/[{ w: "triangle", f: 220, v: 0.9, d: 0.12, h: 0.02, p: 0.5, t: 0, r: 0.12, }, { g: 1, w: "n0", v: 5, t: 0.3, h: 0.015, d: 0.005, r: 0.005, }],
    [{ w: "n1", f: 500, v: 0.15, d: 0.4, r: 0.4, h: 0, t: 0, }, { w: "n0", v: 0.1, t: 0, r: 0.01, f: 440, }],
    [{ w: "n1", v: 0.3, f: 800, d: 0.2, r: 0.2, h: 0.05, t: 0, }, { w: "square", t: 0, v: 1, d: 0.1, r: 0.1, p: 0.1, f: 220, g: 1, }],
    [{ w: "sine", f: 1651, v: 0.15, d: 0.2, r: 0.2, h: 0, t: 0, }, { w: "sawtooth", g: 1, t: 1.21, v: 7.2, d: 0.1, r: 11, h: 1, }, { g: 1, w: "n0", v: 3.1, t: 0.152, d: 0.002, r: 0.002, }],
    null,
/*55*/[{ w: "n1", v: .3, f: 1200, d: 0.2, r: 0.2, h: 0.05, t: 0, }, { w: "n1", t: 0, v: 1, d: 0.1, r: 0.1, p: 1.2, f: 440, }],
    null,
    [{ w: "n1", v: 0.3, f: 555, d: 0.25, r: 0.25, h: 0.05, t: 0, }, { w: "n1", t: 0, v: 1, d: 0.1, r: 0.1, f: 440, a: 0.005, h: 0.02, }],
    [{ w: "sawtooth", f: 776, v: 0.2, d: 0.3, t: 0, r: 0.3, }, { g: 1, w: "n0", v: 2, t: 0, f: 776, a: 0.005, h: 0.02, d: 0.1, s: 1, r: 0.1, c: 0, }, { g: 11, w: "sine", v: 0.1, t: 0, f: 22, d: 0.3, r: 0.3, b: 0, c: 0, }],
    [{ w: "n1", f: 440, v: 0.15, d: 0.4, r: 0.4, h: 0, t: 0, }, { w: "n0", v: 0.4, t: 0, r: 0.01, f: 440, }],
/*60*/  null, null, null, null, null,
/*65*/  null, null, null, null, null,
/*70*/  null, null, null, null, null,
/*75*/  null, null, null, null, null,
/*80*/[{ w: "sine", f: 1720, v: 0.3, d: 0.02, t: 0, r: 0.02, }, { w: "square", g: 1, t: 0, f: 2876, v: 6, d: 0.2, s: 1, r: 0.2, }],
    [{ w: "sine", f: 1720, v: 0.3, d: 0.25, t: 0, r: 0.25, }, { w: "square", g: 1, t: 0, f: 2876, v: 6, d: 0.2, s: 1, r: 0.2, }],
]

var drums0 = [
/*35*/[{ w: "triangle", t: 0, f: 110, v: 1, d: 0.05, h: 0.02, p: 0.1, }],
    [{ w: "triangle", t: 0, f: 150, v: 0.8, d: 0.1, p: 0.1, h: 0.02, r: 0.01, }],
    [{ w: "n0", f: 392, v: 0.5, d: 0.01, p: 0, t: 0, r: 0.05 }],
    [{ w: "n0", f: 33, d: 0.05, t: 0, }],
    [{ w: "n0", f: 100, v: 0.7, d: 0.03, t: 0, r: 0.03, h: 0.02, }],
/*40*/[{ w: "n0", f: 44, v: 0.7, d: 0.02, p: 0.1, t: 0, h: 0.02, }],
    [{ w: "triangle", f: 240, v: 0.9, d: 0.1, h: 0.02, p: 0.1, t: 0, }],
    [{ w: "n0", f: 440, v: 0.2, r: 0.01, t: 0, }],
    [{ w: "triangle", f: 270, v: 0.9, d: 0.1, h: 0.02, p: 0.1, t: 0, }],
    [{ w: "n0", f: 440, v: 0.2, d: 0.04, r: 0.04, t: 0, }],
/*45*/[{ w: "triangle", f: 300, v: 0.9, d: 0.1, h: 0.02, p: 0.1, t: 0, }],
    [{ w: "n0", f: 440, v: 0.2, d: 0.1, r: 0.1, h: 0.02, t: 0, }],
    [{ w: "triangle", f: 320, v: 0.9, d: 0.1, h: 0.02, p: 0.1, t: 0, }],
    [{ w: "triangle", f: 360, v: 0.9, d: 0.1, h: 0.02, p: 0.1, t: 0, }],
    [{ w: "n0", f: 150, v: 0.2, d: 0.1, r: 0.1, h: 0.05, t: 0, p: 0.1, }],
/*50*/[{ w: "triangle", f: 400, v: 0.9, d: 0.1, h: 0.02, p: 0.1, t: 0, }],
    [{ w: "n0", f: 150, v: 0.2, d: 0.1, r: 0.01, h: 0.05, t: 0, p: 0.1 }],
    [{ w: "n0", f: 150, v: 0.2, d: 0.1, r: 0.01, h: 0.05, t: 0, p: 0.1 }],
    [{ w: "n0", f: 440, v: 0.3, d: 0.1, p: 0.9, t: 0, r: 0.1, }],
    [{ w: "n0", f: 200, v: 0.2, d: 0.05, p: 0.9, t: 0, }],
/*55*/[{ w: "n0", f: 440, v: 0.3, d: 0.12, p: 0.9, t: 0, }],
    [{ w: "sine", f: 800, v: 0.4, d: 0.06, t: 0, }],
    [{ w: "n0", f: 150, v: 0.2, d: 0.1, r: 0.01, h: 0.05, t: 0, p: 0.1 }],
    [{ w: "n0", f: 33, v: 0.3, d: 0.2, p: 0.9, t: 0, }],
    [{ w: "n0", f: 300, v: 0.3, d: 0.14, p: 0.9, t: 0, }],
/*60*/[{ w: "sine", f: 200, d: 0.06, t: 0, }],
    [{ w: "sine", f: 150, d: 0.06, t: 0, }],
    [{ w: "sine", f: 300, t: 0, }],
    [{ w: "sine", f: 300, d: 0.06, t: 0, }],
    [{ w: "sine", f: 250, d: 0.06, t: 0, }],
/*65*/[{ w: "square", f: 300, v: .3, d: .06, p: .8, t: 0, }],
    [{ w: "square", f: 260, v: .3, d: .06, p: .8, t: 0, }],
    [{ w: "sine", f: 850, v: .5, d: .07, t: 0, }],
    [{ w: "sine", f: 790, v: .5, d: .07, t: 0, }],
    [{ w: "n0", f: 440, v: 0.3, a: 0.05, t: 0, }],
/*70*/[{ w: "n0", f: 440, v: 0.3, a: 0.05, t: 0, }],
    [{ w: "triangle", f: 1800, v: 0.4, p: 0.9, t: 0, h: 0.03, }],
    [{ w: "triangle", f: 1800, v: 0.3, p: 0.9, t: 0, h: 0.13, }],
    [{ w: "n0", f: 330, v: 0.3, a: 0.02, t: 0, r: 0.01, }],
    [{ w: "n0", f: 330, v: 0.3, a: 0.02, t: 0, h: 0.04, r: 0.01, }],
/*75*/[{ w: "n0", f: 440, v: 0.3, t: 0, }],
    [{ w: "sine", f: 800, t: 0, }],
    [{ w: "sine", f: 700, t: 0, }],
    [{ w: "n0", f: 330, v: 0.3, t: 0, }],
    [{ w: "n0", f: 330, v: 0.3, t: 0, h: 0.1, r: 0.01, p: 0.7, }],
/*80*/[{ w: "sine", t: 0, f: 1200, v: 0.3, r: 0.01, }],
    [{ w: "sine", t: 0, f: 1200, v: 0.3, d: 0.2, r: 0.2, }],
]