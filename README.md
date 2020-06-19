## wasgen

----

Declarative low-level **W**eb **A**udio **s**ound **gen**erator.  
You pass in a static object describing the oscillators, filters, 
and parameters you want, and this library constructs all the nodes, 
connects everything, applies the envelopes and sweeps, 
and cleans up afterwards.

[Live demo](https://andyhall.github.io/wasgen/) ← open that and hit keys to play sounds.


## Install

Install as a dependency:

```sh
npm install --save wasgen
```

To hack on this locally, clone the repo and do `npm i`, 
then use the `npm` scripts to run or build the local demo.
If you don't have webpack installed globally, you'll also need to 
install `webpack webpack-cli webpack-dev-server` as dev dependencies,
or set up your own build via your preferred bundler/etc.



## Usage:

```js
var Generator = require('wasgen')

var ctx = new AudioContext
var dest = ctx.destination // optional
var gen = new Generator(ctx, dest)

var program = [{
    type: 'sine', gain: { a: 0.1, d: 0.1, s: 0.5, r: 0.1 }
}]     // see below
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

`wasgen` programs are arrays of objects in an ad-hoc format, which is 
easy to read but hard to describe. You may find it easiest to 
open the [demo page](https://andyhall.github.io/wasgen/) and 
browse the examples to get the general idea.

For the full specification details:

> ### [Program format tutorial](programs.md)


## Recent updates

 * `0.10.0`
   * adds waveshaper distortion effects
   * rewrites most documentation
   * renamed from `soundgen`

----

## By

Made with 🍺 by [Andy Hall](https://fenomas.com).

License is ISC.

Inspired by (and demo preset programs converted from) 
[TinySynth](https://github.com/g200kg/webaudio-tinysynth)
