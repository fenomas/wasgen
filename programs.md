
# `wasgen` Program format specification:


## 1. Overview

A `wasgen` program is a bunch of objects and arrays, 
which together represent an audio graph and its parameters.
These objects can be nested various ways to create aribtrarily complex 
audio graphs and parameter programs.

Here is a minimal example that defines a sawtooth oscillator,
with an ADSR envelope, whose output is passed through a lowpass filter:

```js
var prog = {                                    // source object
    type: 'sawtooth',
    gain: { a:0.1, s:0.5, d:0.1, r:0.05 },      // param object
    effect: { type: 'lowpass', freq: 1000 },    // effect object
}
gen.play(prog)
```



<br>

## 2. High-level structure

 * Every object in a wasgen program represents an audio *element*.
 * There are three kinds of elements:
    * **sources** define an audio signal, like an oscillator or noise buffer
    * **effects** define biquad filters or distortion effects
    * **params** define a parameter's value and how it changes over time
 * Any program element may be replaced by an *array* of elements, or by a *function* that returns element(s).
    * Arrays of elements will get merged together in contextually relevant ways
    * Function elements will be invoked each time the program is played. This is useful for randomizing things.
 * In simple cases, strings or numbers can be used as shorthand for elements
    * a string `'foo'` is treated as shorthand for the object `{ type:'foo' }`
    * number literals are treated as `param` elements for that value

Putting it all together, these are all valid program structures:

```js
var prog1 = { type: 'sine' }            // source element
var prog2 = 'sine'                      // shorthand for previous
var prog3 = ['sine', 'triangle']        // two sources together
var prog4 = () => 'sine'                // function => source
var prog5 = () => [() => ({ type: ()=>'sine' })]   // ..and so on
```



<br>

## 3. `Source` programs

Audio source programs are objects like the following:

```js
var sourceProg = {
    type: 'sine',         // (required) string
    gain: 1,              // (optional) param element(s)
    freq: 440,            // (optional) param element(s)
    effect: 'lowpass',    // (optional) effect element(s)
}
gen.play(sourceProg)
```

Here are all the currently supported source `type` values:

 * `sine` - standard oscillator
 * `square` - standard oscillator
 * `triangle` - standard oscillator
 * `sawtooth` - standard oscillator
 * `n0` - white noise
 * `np` - pink noise
 * `nb` - brown noise
 * `n1` - metallic noise
 * `p##` - pulse wave, e.g. `p25` means a 25% duty cycle
 * `w###...` - periodic wave, where the affixed number defines the imaginary components. E.g. `w905` means a wave combining the first harmonic and part of the third. 

When you define multiple `source` elements in an array, their signals will be 
merged intelligently into a single output. For example: in the following program,
the sine and triangle sources will be merged into the lowpass filter, 
then that output will be merged with the square wave, and fed into the highpass.

```js
var prog = [ 'sine',  'triangle', 'lowpass', 'square', 'highpass' ]
```





<br>

## 4. `Effect` programs

Audio effect programs are objects like the following:

```js
var effectProg = {
    type: 'lowpass',    // (required) string
    freq: 440,          // (optional) param element(s)
    Q: 1,               // (optional) param element(s)
    gain: 1,            // (optional) param element(s)
}
gen.play({
    type: 'square', 
    effect: effectProg,
})
```

<br>

> Note on effect parameters:  
> Effect params (`Q`, `freq`, and `gain`) **only affect biquad filter** types, 
> and not all filter types use all the parameters.
> E.g. `lowpass` filters ignore their gain parameter. 
> See web audio spec for full details.  
> `wasgen` will ignore any unused param elements you define.

<br>

Here are all the currently supported effect `type` values:

 * Standard biquad filters:
   * `lowpass`
   * `highpass`
   * `bandpass`
   * `notch`
   * `peaking`
   * `allpass`
   * `lowshelf`
   * `highshelf`
 * Distortion filters: (in each case the `#` is a tunable parameter, in roughly the `1..10` range)
   * `crush-#` - bit-crusher
   * `shape-fat-#` - wave shaper distortion
   * `shape-clip-#` - wave shaper distortion
   * `shape-fold-#` - wave shaper distortion
   * `shape-thin-#` - wave shaper distortion
   * `shape-boost-#` - wave shaper distortion
   * `shape-crush-#` - wave shaper distortion


When you define multiple `effect` elements in an array, they will be chained 
together in sequence.

```js
// these two programs are equivalent:
var prog1 = [ 'square', 'lowpass', 'highpass' ]
var prog2 = {
    type: 'square',
    effect: [ 'lowpass', { type:'highpass' } ]
}
```





<br>

## 5. `Param` programs

A `param` program element defines a numeric value, and optionally 
how it changes over time. The element can be any of the following:

 * a number literal
 * an object representing an **envelope** (see below)
 * a `source` element (for FM synthesis, tremolo, vibrato...)
 * an array of any of the previous, or a function returning them

Here is a sample program with various `param` elements:

```js
var prog = {                            // source
    type: 'tri',
    freq: 880,                          // param - number literal
    gain: { type:'sine', freq:5 },      // param - source (LFO vibrato)
    effect: {                           // effect
        type: 'lowpass',
        freq: { t:2, p:0.5, q:0.2 },    // param - object (sweep)
        Q: () => Math.random()          // param - () => number
    }
}
gen.play(prog)
```



<br>

### Param envelopes:

When a `param` element is an object (with no `type` property), it will be
interpreted as an **envelope**. Envelope objects can have a bunch of properties,
all of which must be number literals or functions that return one.

Here are the supported envelope properties and their default values
(all times are in seconds):

```js
var paramObject = {
    w: 0,           // wait time before the envelope starts
    t: 1,           // multiplier for param value
    f: 0,           // added to param value
    k: 0,           // volume keying - param gets larger/smaller at 
                    // higher/lower input frequencies

    a: 0.05,        // attack (linear ramp to peak value)
    h: 0.0,         // hold (wait duration between attack and decay)
    d: 0.1,         // decay (time constant for sweep to sustain level)
    s: 1,           // sustain (multiplier for peak value)
    r: 0.1,         // release (time constant of release sweep)
    z: -1,          // release target (multiplier for target of release sweep)
    x: 1,           // times to repeat the envelope (only applies when w>0)

    p: 1,           // alias for 's' - effectively a peak value multiplier
    q: 0.1,         // alias for 'd' - time constant for the sweep}
    dr: 0.1,        // alias for setting 'd' and 'r' to the same value
}
```

Some example envelopes:

```js
// standard AHDSR envelope
prog.gain = { a:0.1, h:0.002, d:0.3, s:0.5, r:0.1 }

// sweep program - sweeps frequency up one octave, time constant 0.5s
prog.freq = { p:2, q:0.5 }

// fixed value - the input frequency is multiplied by 0 and then 440 is added
prog.freq = { t:0, f:440 } 

// wait 0.1s, jump frequency up 10%, and then repeat that 20 times
prog.freq = { w:0.1, a:0, t:1.1, x:20 }
```

You can schedule complicated envelopes by supplying an array of param elements:

```js
var prog = {
    type: 'sine', 
    freq: [
        { p:2, q:0.5 },              // sweep up one octave, time const 0.5s
        { w:1, p:0.5, q:0.5 },       // wait 1s, then sweep back down one octave
        { w:1, a:0.2, t:0, f:880 },  // wait 1s, then ramp quickly to 880Hz
    ],
}
```

Note that `param` elements may also be `source` elements, or arrays which 
include source elements. You can do this to create tremolo or vibrato, 
or to do arbitrarily complex FM synthesis.


```js
var tremoloWithSweep = {
    type: 'sine',
    freq: [
        { p: 2, q: 0.5  },                              // sweep
        { type: 'sine', freq: 8, gain: { t: 0.1 } },    // LFO tremolo
    ],
}
var harpsichord = {
    type: 'sawtooth',
    freq: {
        type: 'sine',
        freq: { f: 1 },
        gain: { t: 8, a: 0, s: 1, dr: 2 },
    },
    gain: { t: 0.5, a: 0.01, d: 2, s: 0, r: 0.05 },
}
```


> Note about gain envelopes:  
> To avoid audio glitches, `wasgen` will automatically apply an attack ramp 
> and release sweep to all root-level gain parameters, 
> even if you don't define one in your program. 
> To avoid this just define an envelope for all your root-level gain values.


<br>

----

That's it! Open an issue if anything isn't covered.
