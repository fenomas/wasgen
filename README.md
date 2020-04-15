## soundgen

----

Declarative low-level sound generator for Web Audio.

[Live demo](https://andyhall.github.io/soundgen/) ← open that and hit keys to play sounds.

In short: you pass in a static object that describes a set of oscillators, filters, parameters etc, and this library constructs the audio nodes, 
connects everything, applies envelopes and sweeps, and cleans up afterwards.

(Instrument presets in the demo page are borrowed/converted from [TinySynth](https://github.com/g200kg/webaudio-tinysynth))


### Install

Install as a dependency:

```sh
npm install --save soundgen
```

To hack on this locally, clone the repo and do `npm i`, 
then use the `npm` scripts to run or build the local demo.
If you don't have webpack installed globally, you'll also need to 
install `webpack webpack-cli webpack-dev-server` as dev dependencies,
or set up your own build via your preferred bundler/etc.



## Usage:

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
    { type: 'lowpass', freq:1000, Q:()=>rand(1,5) },
])
```

Parameter (`freq`, `gain`, `Q`) values can be any of the following:
 * omitted
 * a number literal, or a function that returns one
 * an object with number literal properties, defining a 
   sweep or an envelope (see below)
 * an audio source (like an oscillator or noise signal)
 * an array of any of the previous

Note that audio sources can have parameters which are audio sources,
for creating effects like vibrato and tremolo. 
Signal programs can nest that way to arbitrary depth.

Examples:

```js
// applying sweep or envelope object to a parameter
gen.play([
    { type: 'sine',                 // base waveform
      freq: { p:2, q:0.5 },         // sweeps frequency x => 2x
      gain: { a:0.01, d:0.2,        // standard AHDSR envelope
              h:0.1, s:0.3, r:0.05 }, 
    },
])

// applies both a sweep and a LFO tremolo effect to the frequency
gen.play([
    { type: 'tri',                  // carrier
      freq: [
          { p:2, q:0.5 },           // sweep
          { type: 'sine',           // LFO oscillator
            freq: 5,                // freq of LFO
            gain: 0.1               // gain of LFO
          }
      ],
    },
])

// randomized properties - note here that freq.t gets randomized once,
// while gain.t would gets randomized each time the program is played
var rand = (a, b) => a + (b - a) * Math.random()
var prog = [{
    freq: rand(500,1000),
    gain: ()=>rand(0, 2),
}]
gen.play(prog)
```

Supported values for each object's `type` property:
 * `sine`, `square`, `sawtooth`, `triangle` - standard web audio oscillators
 * `lowpass`, `notch`, etc. - standard web audio filters
 * `n0`, `np`, `n1` - noise (white, pink, and metallic, respectively)
 * `p25`, `p40`, etc. - pulse waves (`p40` means a 40% duty cycle)
 * `w99`, `w90603`, etc. - a periodic wave with imaginary components scaled per the numbers - that is, `w909` would mix the 1st and 3rd harmonics

When using sweep or envelope programs to affect a parameter value, 
here are all the supported numeric properties and their default values
(all times are in seconds):

```js
var paramObjectdefaults = {
    // param value:
    t: 1,           // multiplier for param value
    f: 0,           // adds to param value
    k: 0,           // vol keying - param gets larger/smaller at higher/lower input frequencies

    // envelope:
    w: 0,           // delay before the envelope starts
    a: 0.05,        // attack (linear ramp to peak value)
    h: 0.0,         // hold (wait duration between attack and decay)
    s: 0.8,         // sustain (multiplier for peak value)
    d: 0.1,         // delay (time constant for sweep to sustain level)
    r: 0.1,         // release (time constant of sweep when note is released)
    z: 0,           // release target (value to sweep to when note is released)

    p: 0.8,         // alias for 's'
    q: 0.1,         // alias for 'd'
}
```

Complex envelopes can be defined by passing in an array of envelope objects.
For example, to make the gain value ramp up and down several times, 
one could use a program like this:

```js
gen.play([
    { type: 'sine',
      gain: [
          { a:1 },              // ramp to 1 over 1 second
          { w:1, t:.1, a:1 },   // wait, then ramp down to .1
          { t:0, f:.5, a:1 },   // then ramp up to .5
          { s:0, d:1 },         // then sweep to 0
      ],
    },
])
```

----

## By

Made with 🍺 by [Andy Hall](https://twitter.com/fenomas).

License is ISC.

Inspired by (and demo preset programs converted from) 
[TinySynth](https://github.com/g200kg/webaudio-tinysynth)
