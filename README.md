## soundgen

----

Experimental. Takes in a parameter object and generates a web audio sound.

[Demo](https://andyhall.github.io/soundgen/build/) ← open that and hit keys to play sounds

## Usage

```js
var SoundGen = require('soundgen')

var ctx = new AudioContext
var dest = ctx.destination // optional
var gen = new SoundGen(ctx, dest)

var program = [{ }] // see demo page to create programs
var freq = 440
var vol = 1
var time = gen.now()
var releaseTime = time + 1
gen.play(program, freq, vol, time, releaseTime)
```

And so on. See source for other APIs

### License: MIT

### By: Andy Hall

Inspired by (and uses presets from) [TinySynth](https://github.com/g200kg/webaudio-tinysynth)
