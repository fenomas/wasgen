
import { buildSignal } from './builders/signals'
import Enveloper from 'param-enveloper'


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

        var currDest = ctx.createGain()
        note.nodes.push(currDest)

        for (var i = 0; i < program.length; i++) {
            // top level node, will either be a source or a filter
            var signalProg = program[i]
            var node = buildSignal(ctx, note, signalProg, freq, time, '', true)
            if (node.Q || node.curve || node.isWorklet) {
                // insert a new filter into output chain
                currDest.connect(node)
                currDest = ctx.createGain()
                note.nodes.push(currDest)
                node.connect(currDest)
            } else {
                // add a new source (in parallel) to the output chain
                node.connect(currDest)
            }
        }

        // output chain is finished
        if (vel === 1) {
            currDest.connect(dest)
        } else {
            var out = ctx.createGain()
            note.nodes.push(out)
            out.gain.value = (vel < 1) ? vel * vel : vel
            currDest.connect(out)
            out.connect(dest)
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



