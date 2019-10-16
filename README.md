## soundgen

----

Declarative low-level sound generator for Web Audio.

[Live demo](https://andyhall.github.io/soundgen/) ← open that and hit keys to play sounds.

In short: you pass in a static object that describes a set of oscillators, filters, 
parameters and so forth, and this library constructs the audio nodes, 
connects everything, applies envelopes and sweeps, and cleans up afterwards.

(Instrument presets in the demo page are borrowed/converted from [TinySynth](https://github.com/g200kg/webaudio-tinysynth))


## Usage

Install as a dependency:

```sh
npm install --save soundgen
```

Usage:

```js
var SoundGen = require('soundgen')

var ctx = new AudioContext
var dest = ctx.destination // optional
var gen = new SoundGen(ctx, dest)

var program = [{ }]     // see below
var freq = 440          // in Hz
var velocity = 1        // 0..1

// synchronous use:
var time = gen.now() + 0.1
var releaseTime = time + 1
gen.play(program, freq, velocity, time, releaseTime)

// asynchronous use:
var noteID = gen.play(program, freq, velocity)
setInterval(() => {
    gen.release(noteID) 
}, 1000)
```

And so on. See source for other APIs


## Program Format

Soundgen programs are arrays of object in an ad-hoc format, which is 
probably best understood by looking at preset example programs in the 
[demo page](https://andyhall.github.io/soundgen/).

However, here are some examples that give the general idea. 

Each element in the program array is an object, with a `type` 
property and optional `freq`, `gain`, and/or `Q` parameters:

```js
gen.play([
    { type: 'sine' },
    { type: 'sawtooth', gain:0.5 },
    { type: 'lowpass', freq:1000, Q:2 },
])
```

Parameter (`freq`, `gain`, `Q`) values can be any of the following:
 * omitted
 * a number literal
 * an object whose properties are all number literals 
 (used to apply sweeps or envelopes)
 * an audio source (like an oscillator or noise function)
 * an array of any of the previous

For example:

```js
// applying sweep or envelope object to a parameter
gen.play([
    { type: 'sine',                 // base waveform
      freq: { p:2, q:0.5 },         // sweeps frequency x => 2x
      gain: { a:0.01, d:0.2,        // standard AHDSR envelope
              s:0.3, r:0.05 }, 
    },
])

// applies both a sweep and a LFO tremolo effect to the frequency
gen.play([
    { type: 'tri',                  // carrier
      freq: [
          { p:2, q:0.5 },           // sweep
          { type: 'sine',           // LFO oscillator
            freq: 5, gain: 0.1 },   // params for LFO
      ],
    },
])
```

Supported values for each object's `type` property:
 * `sine`, `square`, `sawtooth`, `triangle` - standard web audio oscillators
 * `lowpass`, `notch`, etc. - standard web audio filters
 * `n0`, `np`, `n1` - noise (white, pink, and metallic, respectively)
 * `w99`, `w90603`, etc. - a periodic wave with imaginary components scaled
 according to the numbers after the `'w'`

When using sweep or envelope programs to affect a parameter value, 
here are all the supported numeric properties and their default values
(all times are in ms):

```js
var paramObjectdefaults = {
    w: 0,           // delay before sweep or envelope starts
    t: 1,           // multiplier for param value
    f: 0,           // adds to param value
    k: 0,           // vol keying - param gets larger/smaller at higher/lower input frequencies

    // sweep
    p: 1,           // multiplier for peak value of sweep
    q: 0.1,         // time constant of sweep

    // envelope
    a: 0.05,        // attack (linear ramp)
    h: 0.0,         // hold
    s: 0.8,         // sustain (fraction of peak value)
    d: 0.1,         // delay (time constant)
    r: 0.1,         // release (time constant)
}
```

----

## By

Made with 🍺 by [Andy Hall](https://twitter.com/fenomas).

License is ISC.

Inspired by (and demo preset programs converted from) 
[TinySynth](https://github.com/g200kg/webaudio-tinysynth)
