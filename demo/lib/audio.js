

/*
 * 
 *      export context
 * 
*/

export var ctx = new (window.AudioContext || window.webkitAudioContext)()
export var audioDestination = ctx.createGain()

audioDestination.connect(ctx.destination)






/*
 * 
 *      init wasgen, handle HMR
 *  
*/

import Generator from '../..'
var noCompressor = false
var gen = new Generator(ctx, audioDestination, noCompressor)
window.gen = gen

function rebuildGen() {
    if (gen) gen.dispose()
    gen = new Generator(ctx, audioDestination, noCompressor)
    window.gen = gen
}

if (module.hot) module.hot.accept('..', () => {
    Generator = require('../..')
    rebuildGen()
})






/*
 * 
 *      export note playing functions
 * 
*/

var velocity = 1
var noteIDs = {}
import { currentProgram } from './programs'


export function startNote(note) {
    if (ctx.state !== 'running') ctx.resume()
    if (noteIDs[note]) return
    var freq = noteToFreq(note)
    // special ad-hoc case for demoing
    var overrideNote = currentProgram.center || 0
    if (currentProgram[0]) overrideNote = currentProgram[0].center || 0
    if (overrideNote) freq = noteToFreq(overrideNote)
    // support case where text field has array of programs, for demoing...
    if (Array.isArray(currentProgram[0])) {
        var now = gen.now()
        noteIDs[note] = currentProgram.map(prog => {
            var delay = (prog[0] && prog[0].delay) || 0
            return gen.play(prog, freq, velocity, now + delay)
        })
    } else {
        // normal case
        noteIDs[note] = gen.play(currentProgram, freq, velocity)
    }
}

export function bendNote(originalNote, toNote) {
    var freq = noteToFreq(toNote)
    gen.bend(noteIDs[originalNote], freq, 0.2)
}

export function releaseNote(note, time) {
    if (time < 1) time = gen.now() + time
    if (Array.isArray(noteIDs[note])) {
        noteIDs[note].forEach(id => {
            gen.release(id, time)
        })
    } else {
        gen.release(noteIDs[note], time)
    }
    noteIDs[note] = null
}


function noteToFreq(note) {
    // note = 69 + Math.round((note - 69) * 1.6)
    return 440 * Math.pow(2, (note - 69) / 12)
}



// for UI to access
export function setVelocity(v) { velocity = v }
export function setCompression(comp) {
    noCompressor = !comp
    rebuildGen()
}
export function getGenerator() { return gen }

