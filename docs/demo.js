'use strict'

var Viz = require('./viz')
var Gui = require('./gui')
var Instruments = require('./tinySynthInstruments')
var converter = require('./programConverter')
var Presets = require('./presets')



/*
 *      Persistent state
*/

var AudioContext = window.AudioContext || window.webkitAudioContext
var ctx = new AudioContext()
var gen, SoundGen

var viz = new Viz(ctx,
    document.querySelector('#waveform'),
    document.querySelector('#eq'),
    document.querySelector('#spectrograph'),
    () => lastFrequency
)

var state = {}
var gui = new Gui(state)

var currentProgram





/*
 *      Notes and Programs - tinySynth presets and coverter
*/

var currNotes = {}
var lowestNote = 45
var lastFrequency = 440

function noteToFreq(note) {
    note = 69 + Math.round((note - 69) * 1.6)
    return 440 * Math.pow(2, (note - 69) / 12)
}

function playNote(note) {
    if (currNotes[note]) return
    var program = currentProgram
    var vel = gui.getVelocity()
    var freq = noteToFreq(note)
    lastFrequency = freq
    var time = gen.now() + 0.01 // playing at zero delay usually means clicks
    currNotes[note] = gen.play(program, freq, vel, time)
}

function bendNote(target, note) {
    gen.bend(currNotes[target], noteToFreq(note), 0.2)
}

function releaseNote(note, time) {
    gen.release(currNotes[note], time)
    currNotes[note] = null
}




// programs - importing presets and handling GUI

var inst = new Instruments()
var presets = new Presets()

// preset pulldown change -> update program, inform UI
function importPreset() {
    var name = inst.names[presetPD.selectedIndex]
    var qual = !!document.getElementById('quality').checked
    var tsprog = inst.getProg(name, qual)
    var prog = converter(tsprog)
    applyPreset(prog)
}
function applyPreset(prog) {
    gui.setProgram(prog)
    currentProgram = prog
}

// init to preset 0 on page load
setTimeout(importPreset, 0)

// receive program updates from gui
gui.programChanged = function (prog) {
    currentProgram = prog
}







/*
 *      Init - each time soundgen is hot-reloaded
*/

function init() {
    if (gen) gen.dispose()
    SoundGen = require('..')
    gen = new SoundGen(ctx)
    viz.setNode(gen.monitor)
}





/*
* 
 *      UI actions
 * 
*/

var keys = 'zxcvbnm,./ asdfghjkl;\'qwertyuiop[1234567890-='
var shiftNote = 0
var shifting = false

function keyToNote(k) {
    var i = keys.indexOf(k)
    return (i < 0) ? 0 : lowestNote + i
}

function playEvent(ev, down) {
    var focused = document.activeElement
    if (focused.type === 'text' || focused.type === 'textarea') return
    
    if (ev.key === 'Shift') {
        if (down) {
            shifting = true
        } else {
            shifting = false
            if (shiftNote) releaseNote(shiftNote)
            shiftNote = 0
        }
    } else {
        var key = (ev.key && ev.key.toLowerCase()) || 'a'
        var note = keyToNote(key)

        if (down) {
            if (shifting && shiftNote) {
                bendNote(shiftNote, note)
            } else {
                if (note) playNote(note)
                if (shifting) shiftNote = note
            }
            if (key === ' ') ev.preventDefault()
            if (note && focused.tagName === 'SELECT' && !ev.metaKey) ev.preventDefault()
        } else {
            if (note && !shifting || note !== shiftNote) releaseNote(note)
            if (!shifting) shiftNote = 0
        }
    }
}



document.querySelector('#play').onmousedown = ev => playEvent(ev, true)
document.querySelector('#play').onmouseup = ev => playEvent(ev, false)
window.onkeydown = ev => playEvent(ev, true)
window.onkeyup = ev => playEvent(ev, false)



var presetPD = document.querySelector('#presets')
inst.names.forEach((name, i) => {
    var opt = document.createElement('option')
    opt.text = name
    presetPD.options[i] = opt
})
presetPD.onchange = importPreset


var presetPD2 = document.querySelector('#presets2')
for (var s in presets) {
    var opt = document.createElement('option')
    opt.text = s
    presetPD2.options[presetPD2.options.length] = opt
}
presetPD2.onchange = function () {
    var i = presetPD2.selectedIndex
    var text = presetPD2.options[i].text
    if (!text) return
    var prog = presets[text]()
    applyPreset(prog)
    playNote(69)
    releaseNote(69, gen.now() + 0.5)
}

var redoBut = document.querySelector('#redo')
redoBut.onmousedown = function () {
    if (presetPD2.selectedIndex < 1) presetPD2.selectedIndex = 1
    presetPD2.onchange()
}


// benchmark - just play a load of sounds overlapped

document.querySelector('#benchmark').onmousedown = function () {
    var N = 64
    gen.setMaxVoices(N)
    var carrier = {
        type: 'sine',
        freq: { p: 1, },
        gain: { a: 0.01 },
    }
    var FM = {
        type: 'sine',
        target: '0.freq',
        freq: {},
        gain: {},
    }
    var filter = {
        type: 'bandpass',
        target: '',
        freq: { t: 0, f: 1000, p: 1.1 },
        gain: { a: 0.2 },
    }
    var program = [carrier, filter]
    for (var i = 0; i < N; i++) {
        carrier.freq.p = (Math.random() < 0.5) ? 1 : 0.5 + Math.random()
        carrier.gain.a = Math.random() / 5
        filter.freq.f = 500 + 1000 * Math.random()
        var note = 45 + (70 * Math.random()) | 0
        var freq = 440 * Math.pow(2, (note - 69) / 12)
        var vol = 0.3
        var time = gen.now() + i * (1 / N)
        var releaseTime = time + 0.5 + Math.random()
        gen.play(program, freq, vol, time, releaseTime)
    }
}






/*
 *      HMR
*/


if (module.hot) {
    module.hot.accept('..', init)
}
init()


