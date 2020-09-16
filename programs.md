
# Program format tutorial:


## 1. A `wasgen` program is an array of objects with `type` properties

```js
gen.play([
    { type: 'sine' },       // play a sine oscillator
    { type: 'n0' },         // play some white noise
    { type: 'lowpass' },    // pass them both through a filter
])
```

See below for a list supported types.

<br>


## 2. Each object can also have `parameters`:

```js
gen.play([
    { type: 'triangle', freq: 440, gain: 0.5 },
    { type: 'bandpass', freq: 1000, Q: 3 },
])
```

<br>


## 3. `Parameters` don't have to be plain numbers:

Parameters represent numeric values, but they can change over time 
or be driven by other signals. 

A program object's `freq`, `gain`, or `Q` property can be any of the following:

 * omitted (sensible defaults will be applied)
 * a number literal
 * a function that returns a number literal
 * an object defining a sweep or an ADHSR envelope (see `#5` below)
 * an object defining an audio source (an oscillator or noise signal)
 * an array of any of the previous

Some parameter examples:

```js
// A standard ADHSR envelope:
gen.play([
    { type: 'sine', 
      gain: { a:0.01, d:0.2, h:0.1, s:0.3, r:0.05 }, 
    },
])

// A frequency sweep, with randomized time constant
gen.play([
    { type: 'sine', 
      freq: { p:2, q:()=>Math.random() }, 
    },
])

// Apply an oscillator to `freq` for LFO tremolo:
gen.play([
    { type: 'tri',
      freq: { type: 'sine', freq: 5, gain: 0.1 },
    },
])

// Audio source parameters can nest arbitrarily deeply:
gen.play([
    {   type: 'tri', gain: 1, freq: {
            type: 'sine', gain: 0.2, freq: {
                type: 'square', gain: 0.5, freq: 4
            },
        },
    },
])
  
// Complex parameter behavior with an array of settings:
gen.play([
    { type: 'sine',
      freq: [
          440,                   // start at 440Hz
          { t:2, a:1 },          // linear ramp up over 1 sec
          { w:1, t:0.5, a:1 },   // wait 1 sec then ramp back down
          { w:1, p:2, q:1 },     // wait, then exponential sweep
          { type: 'sine', gain: 0.02, freq:10 } // add LFO tremolo
      ],
    },
])
// Note in this example that the tremolo applies the entire time
// (though you could change that by giving it a gain envelope)
```

<br>



## 4. Supported `type` values for program objects:

Top-level program objects either represent **audio sources** 
or **effects**. The following `type` properties are 
supported for each kind of object:

Audio sources:

 * `sine`, `square`, `sawtooth`, `triangle` - standard web audio oscillators
 * `n0`, `np`, `nb`, `n1` - noise (white, pink, brown, metallic, respectively)
 * `p25`, `p40`, etc. - pulse waves (`p15` would mean a 15% duty cycle)
 * `w99`, `w90603`, etc. - periodic wave, where the affixed number defines the imaginary components (i.e. `w909` would mix the 1st and 3rd harmonics)

Effects:

 * `lowpass`, `notch`, `bandpass`, etc. - all standard web audio filters
 * `shape-clip-5` - wave-shaper distortion
 * `shape-fold-5` - wave-shaper distortion
 * `shape-boost-5` - wave-shaper distortion
 * `shape-crush-5` - wave-shaper distortion
 * `shape-thin-5` - wave-shaper distortion
 * `shape-fat-5` - wave-shaper distortion

For wave shaper effects, the `5` shown above is a tunable parameter. 
Try numbers generally in the `1..10` range for different amounts of distortion.


<br>


## 5. Parameter envelope objects

Parameter sweeps or envelopes are defined with an object 
containing *only number literal properties*, or functions that return them. 

Here are all the supported properties, and their default values:

```js
// All times are in seconds!

var paramObjectdefaults = {
    // base param values:
    t: 1,           // multiplier for param value
    f: 0,           // flat value added to param value
    k: 0,           // vol keying - param gets larger/smaller at 
                    // higher/lower input frequencies

    // envelope values:
    w: 0,           // wait time before the envelope starts
    a: 0.05,        // attack (linear ramp to peak value)
    h: 0.0,         // hold (wait duration between attack and decay)
    s: 0.8,         // sustain (multiplier for peak value)
    d: 0.1,         // delay (time constant for sweep to sustain level)
    r: 0.1,         // release (time constant of sweep when note is released)
    z: 0,           // release target (value to sweep to when note is released)
    x: 1,           // times to repeat the envelope (only makes sense when w>0)

    // sweep values:
    p: 0.8,         // alias for 's' - effectively a peak value multiplier
    q: 0.1,         // alias for 'd' - time constant for the sweep
}
```


<br>

----

That's it! Open an issue if anything isn't covered.
