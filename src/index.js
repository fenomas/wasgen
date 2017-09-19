'use strict'

var NotePlayer = require('./notePlayer')
var defs = require('./progDefs')

module.exports = SoundGen



/*
 *
 *  
 *                  SoundGen
 *  
 * 
*/

function SoundGen(audioContext, destination) {
    // program definitions
    this.Signal = defs.Signal
    this.Sweep = defs.Sweep
    this.Envelope = defs.Envelope

    // set up output chain
    var AudioContext = window.AudioContext || window.webkitAudioContext
    var ctx = audioContext || new AudioContext()
    var output = ctx.createGain()
    var masterVol = ctx.createGain()
    output.connect(masterVol)
    masterVol.connect(ctx.destination)

    // public properties
    this.monitor = output
    this.masterGain = masterVol.gain


    // note player lib
    var player = new NotePlayer(ctx, output)



    this.play = function (program, freq, vel, time, releaseTime) {
        return player.play(program, freq, vel, time, releaseTime)
    }


    this.release = function (noteID, time) {
        player.release(noteID, time)
    }

    this.releaseAll = function (time) {
        player.releaseAll(time)
    }

    this.setMaxVoices = function (n) {
        player.maxVoices = n
    }

    this.now = function () {
        return ctx.currentTime
    }

    this.dispose = function () {
        player.releaseAll()
    }


}



    /*
        0: sine wave
            out = chvol
            fp = freqIn * 1 + 0
            vp = 0.4 * (inputV / 128)^2
        1: triangle
            out = o[0].frequency
            fp = fp[0] * 1 + 0
            vp = 3 * fp[0]

            fp[i] = fp[pn.g - 1] * pn.t + pn.f;
            vp[i] =  fp[pn.g - 1] * pn.v;
            
    */



    /*
    
    
    // ( time, channel, note, vel, program.p)
    play note work:
        per signal:
            set out = chvol or [gain, frequency, playbackRate] param
            set sc = velocity or frequency value?
            set fp[signal] = freq value?
            case oscillator:
                createOscillator, freq = fp[signal]
                set wave type / periodic wave
                pitch bend freq to freq * P, timeconstant = Q
                connect chmod[ch] to detune
                set oscillator detune to bend[ch]
            case noise:
                createBufferSource, buffer = this.noiseBuf[wave name]
                set loop, playbackRate
            createGain -> g[signal] 
            store release
            connect oscillator -> gain -> out (chvol/frequency/playbackRate)
            store vp = prog.v * sc (vel or freq value?)
            if K: vp[i] *= Math.pow(2, (n - 60) / 12 * K)
            if A: ramp gain param -> A, else set gain = vp[i]
            gain param target = S * vp[i], time=t + a + h, timeconstant = D
            start oscillator[i]
        if (drums) stop oscillator after delay D * 3.5


    release note (t)
        if not drums:
            count down k
                gain node - cancel schedules (t)
                update gain envelope schedule - continue to A, set target 0 timeConst=R[k]
        table.e = t + table.r[0] * 3.5
        table.f = 1


    interval 60
        every 3 intervals:
            prune all notes with E < currentTime
        if playing:
            midi stuff....
        
        

    pruneNote (nt):
        for oscillator k:
            if (freq) disconnect chmod[ch] from oscillator detune
            oscillator.disconnect
            cancel scheduled values on frequency / playbackRate
            osc.stop(0)
        for gain k
            gain.disconnect()
            gain cancel scheduled
    }

*/







/*


program values
    AHDSR - envelope: A time, H time, D timeConst, S level, R timeConst
    GW      target (output or program) and waveform
    TF      freq = input * T + F
    V       Volume (gain param val)
    K       scale V up or down by input midi note (no change at 60)
    PQ      Pitch bend to freq * P, timeConstant Q


notetab entries {
    t: t - startTime
    t2: t + prog.a
    e: 99999                end time
    f: 0                    finished / released
    ch: channel
    n: note (midi value)
    o: oscillator array
    g: gain array
    v: vp[] - volume points
    r: r[] - release values
}


default program
    a: 0        \
    h: 0.01      |
    d: 0.01       >  AHDSR envelope
    s: 0         |
    r: 0.05     / 
    g: 0        target (0=dest, 1..=FM to oscillator)
    w: sine     oscillator type
    f: 0        fixed freq \
    t: 1        tune value  > freq = noteFreq * T + F 
    v: 0.5      velocity / volume
    p: 1        pitch bend - freq bends to (freq * P) during release
    k: 0        Volume key tracking. Volume will be increased according to pitch if plus, decreased if minus.
    q: 1        ?????



note playing
    noteOn(channel, midiNote, velocity, time) =>
        _note( time, channel, note, vel, program.p)

        

signal flow
    oscillators
    => this.chvol[ch]
    => this.chpan[ch]           [skipped on safari]
    => this.out
    => this.conv/this.rev
    => this.comp
    => this.dest



public props
    masterVol       { type: Number, value: 0.5, observer: "setMasterVol" }
    reverbLev       { type: Number, value: 0.3, observer: "setReverbLev" }
    quality         { type: Number, value: 1, observer: "setQuality" }
    debug           { type: Number, value: 0 }
    src             { type: String, value: null, observer: "loadMIDIUrl" }
    loop            { type: Number, value: 0 }
    internalcontext { type: Number, value: 1 }
    tsmode          { type: Number, value: 0 }
    voices          { type: Number, value: 64 }
    useReverb       { type: Number, value: 1 }


private props
    pg        []
    vol       []
    bend      []
    ex        []
    rpnidx    []
    brange    []
    sustain   []
    notetab   []
    rhythm    []
    maxTick     0
    playTick    0
    playing     0
    releaseRatio 3.5
    preroll     0.2
    relcnt      0




APIs
    ready             ()
    setMasterVol      (v)
    setReverbLev      (v)
    setLoop           (f)
    setVoices         (v)
    getPlayStatus     ()
    locateMIDI        (tick)
    getTimbreName     (m, n)
    loadMIDIUrl       (url)
    reset             ()
    stopMIDI          ()
    playMIDI          ()
    loadMIDI          (data)
    setQuality        (q)
    setTimbre         (m, n, p)
    _pruneNote        (nt)
    _limitVoices      (ch, n)
    _note             (t, ch, n, v, p)
    _setParamTarget   (p, v, t, d)
    _releaseNote      (nt, t)
    setModulation     (ch, v, t)
    setChVol          (ch, v, t)
    setPan            (ch, v, t)
    setExpression     (ch, v, t)
    setSustain        (ch, v, t)
    allSoundOff       (ch)
    resetAllControllers  (ch)
    setBendRange      (ch, v)
    setProgram        (ch, v)
    setBend           (ch, v, t)
    noteOn            (ch, n, v, t)
    noteOff           (ch, n, t)
    _tsConv           (t)
    setTsMode         (tsmode)
    send              (msg, t)
    _createWave       (w)
    getAudioContext   ()
    setAudioContext   (actx, dest)



*/

