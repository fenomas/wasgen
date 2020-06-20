

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
    noteIDs[note] = gen.play(currentProgram, freq, velocity)
}

export function bendNote(originalNote, toNote) {
    var freq = noteToFreq(toNote)
    gen.bend(noteIDs[originalNote], freq, 0.2)
}

export function releaseNote(note, time) {
    if (time < 1) time = gen.now() + time
    gen.release(noteIDs[note], time)
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

