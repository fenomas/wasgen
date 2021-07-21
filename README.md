## wasgen

----

Declarative low-level **W**eb **A**udio **S**ound **Gen**erator. 

You pass in a static object, which defines an arbitrarily complex 
audio graph and its parameters. 
This library will then construct all the nodes, connect everything, 
apply the necessary parameters and envelopes, and clean up afterwards.

[Live demo](https://fenomas.github.io/wasgen/) ← open that and hit keys to play sounds.

<br>

> NOTE!  
> Are you reasonably familiar with terms like "FM synthesis" and 
> "ADSR envelope"? If not, you may find 
> [`wafxr`](https://fenomas.github.io/wafxr) more useful than 
> this library.


<br>

## Usage:

Install as a dependency:

```sh
npm install --save wasgen
```

Instantiate and invoke:

```js
var Generator = require('wasgen')

var ctx = new AudioContext()
var gen = new Generator(ctx, ctx.destination) // both args optional

var program = { type:'sine' }   // see below
var freq = 440                  // in Hz
var velocity = 1                // 0..1

// fixed-duration sounds:
var startTime = gen.now() + 0.1
var releaseTime = startTime + 1
gen.play(program, freq, velocity, startTime, releaseTime)

// dynamic sounds:
var noteID = gen.play(program, freq, velocity, startTime)
setInterval(() => {
    gen.release(noteID)   // sound's release envelope starts when this is called
}, 1000)
```

And so on. See source for other APIs


## Program Format

Sound programs for `wasgen` use an ad-hoc format that's 
easy to read but hard to describe. You may find it easiest to 
open the [demo page](https://fenomas.github.io/wasgen/) and 
browse the examples to get the general idea.

For the full details:

> ## [Program format spec](programs.md)


<br>

----

## Recent updates

 * `0.16.0`
   * simplifies program format, and many internals
 * `0.12.0`
   * adds bit-crushing, bug fixes
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
