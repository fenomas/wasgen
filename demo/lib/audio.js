// @ts-check



/*
 * 
 *      export context
 * 
*/

export var ctx = new (window.AudioContext || window['webkitAudioContext'])()
export var monitorNode = ctx.createGain()
var masterVol = ctx.createGain()

monitorNode.connect(masterVol)
masterVol.connect(ctx.destination)






/*
 * 
 *      init wasgen, handle HMR
 *  
*/

import Generator from '../..'
var noCompressor = false
var gen = new Generator(ctx, monitorNode, noCompressor)
window['gen'] = gen

function rebuildGen() {
    if (gen) gen.dispose()
    gen = new Generator(ctx, monitorNode, noCompressor)
    window['gen'] = gen
}

// @ts-ignore
if (module.hot) module.hot.accept('../..', () => {
    // @ts-ignore  
    // eslint-disable-next-line
    Generator = require('../..')
    rebuildGen()
})


var versionSpan = document.querySelector('#version-label')
if (versionSpan) versionSpan.innerHTML = `wasgen v${gen.version}`




/*
 * 
 *      export note playing functions
 * 
*/

var velocity = 1
var noteIDs = {}
var noteStarts = {}
import { currentProgram } from './programs'
import { updateExportSettings } from './controls'


export function startNote(note) {
    if (ctx.state !== 'running') ctx.resume()
    if (noteIDs[note]) return
    var freq = noteToFreq(note)
    // for export tracking
    updateExportSettings(freq, 0)
    noteStarts[note] = performance.now()
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

export function releaseNote(note, delay = 0) {
    var time = gen.now() + delay
    if (Array.isArray(noteIDs[note])) {
        noteIDs[note].forEach(id => {
            gen.release(id, time)
        })
    } else {
        gen.release(noteIDs[note], time)
    }
    noteIDs[note] = null
    var dur = performance.now() - noteStarts[note] + delay
    if (dur > 0) updateExportSettings(0, dur / 1000)
    noteStarts[note] = null
}


function noteToFreq(note) {
    // note = 69 + Math.round((note - 69) * 1.6)
    return 440 * Math.pow(2, (note - 69) / 12)
}



// for UI to access
export function setVelocity(v) { velocity = v }
export function setVolume(v) {
    var t = ctx.currentTime
    masterVol.gain.setTargetAtTime(v, t + 0.1, 0.1)
}
export function setCompression(comp) {
    noCompressor = !comp
    rebuildGen()
}
export function getGenerator() { return gen }







/*
 *
 *
 *          WAV file export
 *
 *
*/

var anchor

export async function exportWavFile(freq = 440, noteDur = 0.5, fileDur = 5) {

    var rate = 44100
    var samples = (fileDur * rate) | 0
    var ctx = new OfflineAudioContext(2, samples, rate)
    var gen = new Generator(ctx, ctx.destination, false, true)

    // pausing here lets wasgen init bitcrusher audioworklet..
    if (/crush/.test(JSON.stringify(currentProgram))) await sleep(100)

    // play logic
    var vel = 1
    var now = 0.05      // otherwise attack gets smoothed out?
    gen.play(currentProgram, freq, vel, now, now + noteDur)
    var buffer = await ctx.startRendering()

    // yoink: https://github.com/Jam3/audiobuffer-to-wav/blob/master/demo/index.js
    if (!anchor) {
        anchor = document.createElement('a')
        document.body.appendChild(anchor)
        anchor.style.display = 'none'
    }

    var bufferToWav = require('audiobuffer-to-wav')
    var wav = bufferToWav(buffer)
    var blob = new window.Blob([new DataView(wav)], {
        type: 'audio/wav'
    })

    var url = window.URL.createObjectURL(blob)
    anchor.href = url
    anchor.download = 'wasgen_sound.wav'
    anchor.click()
    window.URL.revokeObjectURL(url)

    gen.dispose()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


