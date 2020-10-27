
import { buildSources } from './lib/sources'
import Enveloper from 'param-enveloper'
// import Enveloper from '../../param-enveloper'

export default function SoundPlayer(ctx) {


    /*
     * 
     *      local state
     * 
    */

    var currentNotes = {}       // hash of note data objects keyed by id
    var currentNoteIDs = []     // array of ids, newest to oldest

    var enveloper = new Enveloper(ctx)



    /*
     * 
     * 
     *          API
     * 
     * 
    */

    this.maxVoices = 32


    this.play = function (program, freq, vel, time, releaseTime, destNode) {
        pruneEndedNotes()
        enforceMaxVoices(this.maxVoices - 1)
        var note = makeNote(program, freq, vel, time, destNode)
        currentNoteIDs.push(note.id)
        currentNotes[note.id] = note
        if (releaseTime) releaseNote(note, releaseTime)
        return note.id
    }


    this.bend = function (noteID, freq, timeConst, time) {
        var note = currentNotes[noteID]
        if (note) bend(note, freq, timeConst, time)
    }


    this.release = function (noteID, time) {
        var note = currentNotes[noteID]
        if (note) releaseNote(note, time)
    }


    this.isPlaying = function (noteID) {
        return !!currentNotes[noteID]
    }


    this.releaseAll = function (time) {
        currentNoteIDs.forEach(id => {
            releaseNote(currentNotes[id], time)
        })
    }


    this.dispose = function () {
        enforceMaxVoices(0) // hard-disposes all current notes
        currentNotes = null
        currentNoteIDs = null
        clearInterval(pruneInterval)
    }











    /*
     * 
     * 
     *          other note lifecycle
     * 
     * 
    */


    function enforceMaxVoices(limit) {
        // hard-dispose notes, oldest first
        while (currentNoteIDs.length > limit) {
            var noteID = currentNoteIDs.shift()
            disposeNote(currentNotes[noteID])
            delete currentNotes[noteID]
        }
    }


    function pruneEndedNotes() {
        var t = ctx.currentTime
        for (var i = 0; i < currentNoteIDs.length; i++) {
            var id = currentNoteIDs[i]
            var note = currentNotes[id]
            if (note.endTime === 0 || t < note.endTime) continue
            disposeNote(note)
            delete currentNotes[id]
            currentNoteIDs.splice(i, 1)
            i--
        }
    }


    // occasionally prune even if nothing's happening
    var pruneInterval = setInterval(pruneEndedNotes, 800)














    /*
     * 
     * 
     *          NOTE create / release / dispose
     * 
     * 
    */


    function Note(time) {
        if (++_noteID > 9999) _noteID = 1
        this.id = _noteID
        this.time = +time
        this.endTime = +0
        // audio nodes and such
        this.nodes = []
        this.envelopes = []
        this.bendables = []
    }
    var _noteID = 0






    function makeNote(program, freq, vel, time, dest) {

        var note = new Note(time)

        // build all sources for the root-level program
        var node = buildSources(ctx, note, program, freq, time, 'root')

        // edge case when program contained no sources
        if (!node) {
            var prog = { type: 'sine' }
            node = buildSources(ctx, note, prog, freq, time, 'root')
        }

        // output chain is finished
        if (vel === 1) {
            node.connect(dest)
        } else {
            var volume = ctx.createGain()
            note.nodes.push(volume)
            volume.gain.value = (vel < 1) ? vel * vel : vel
            node.connect(volume)
            volume.connect(dest)
        }

        return note
    }






    /*
     * 
     *      BEND
     *  hacking...
     * 
    */

    function bend(note, freq, constant, time) {
        if (note.endTime > 0) return
        note.bendables.forEach(obj => {
            var val = freq * obj.mult
            obj.param.cancelScheduledValues(time)
            obj.param.setTargetAtTime(val, time, constant)
        })
    }


    /*
     * 
     *      RELEASE
     *  set release envelopes if there are any, etc.
     * 
    */

    function releaseNote(note, time) {
        if (note.endTime > 0) return
        note.endTime = time

        // note envelope data objs: { param, release, ... }
        note.envelopes.forEach((env, i) => {
            var R = env.releaseTime
            if (!(R >= 0)) return
            var param = env.param

            enveloper.startEnvelope(param, time)
            var tgt = env.releaseTarget || 0
            enveloper.addSweep(param, -1, tgt, R)

            if (env.rootEnvelope) {
                // 4 timeConstants means ~2% of original value
                var noteEnd = time + 4 * R
                note.endTime = Math.max(note.endTime, noteEnd)
            }
        })
    }



    function disposeNote(note) {
        while (note.nodes.length > 0) {
            var node = note.nodes.pop()
            if (node.stop) node.stop()
            if (node.buffer) node.buffer = null
            if (node.gain) node.gain.cancelScheduledValues(0)
            if (node.frequency) node.frequency.cancelScheduledValues(0)
            if (node.playbackRate) node.playbackRate.cancelScheduledValues(0)
            if (node.Q) node.Q.cancelScheduledValues(0)
            node.disconnect()
            node = null
        }
        note.nodes = null
        note.envelopes = null
        note.bendables = null
    }


}



