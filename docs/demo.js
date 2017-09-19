'use strict'

var Viz = require('./viz')
var Gui = require('./gui')
var Instruments = require('./tinySynthInstruments')
var converter = require('./programConverter')



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
var lowestNote = 58 // 30
var lastFrequency = 440

function playNote(note) {
    if (currNotes[note]) return
    var program = currentProgram
    var freq = 440 * Math.pow(2, (note - 69) / 12)
    var vel = gui.getVelocity()
    lastFrequency = freq
    var time = gen.now() + 0.01 // playing at zero delay usually means clicks
    currNotes[note] = gen.play(program, freq, vel, time)
}

function releaseNote(note) {
    gen.release(currNotes[note])
    currNotes[note] = null
}




// programs - importing presets and handling GUI

var inst = new Instruments()

// preset pulldown change -> update program, inform UI
function importPreset() {
    var name = inst.names[presets.selectedIndex]
    var qual = !!document.getElementById('quality').checked
    var tsprog = inst.getProg(name, qual)
    var prog = converter(gen, tsprog)
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
function keyToNote(k) {
    var i = keys.indexOf(k)
    return (i < 0) ? 0 : lowestNote + i
}

function down(ev) {
    var focused = document.activeElement
    if (focused.type === 'text' || focused.type === 'textarea') return
    var key = (ev.key) || 'a'
    var note = keyToNote(key)
    if (note) playNote(note)
    if (key === ' ') ev.preventDefault()
    if (note && focused.tagName === 'SELECT' && !ev.metaKey) ev.preventDefault()
}
function up(ev) {
    var key = (ev.key) || 'a'
    var note = keyToNote(key)
    if (note) releaseNote(note)
}


document.querySelector('#play').onmousedown = down
document.querySelector('#play').onmouseup = up
window.addEventListener('keydown', down)
window.addEventListener('keyup', up)


var presets = document.querySelector('#presets')
inst.names.forEach((name, i) => {
    var opt = document.createElement('option')
    opt.text = name
    presets.options[i] = opt
})
presets.onchange = importPreset




/*
 *      HMR
*/


if (module.hot) {
    module.hot.accept('..', init)
}
init()


