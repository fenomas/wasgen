
import { buildSignal } from './builders/signals'


export default function SoundPlayer(ctx) {


    /*
     * 
     *      local state
     * 
    */

    var currentNotes = {}       // hash of note data objects keyed by id
    var currentNoteIDs = []     // array of ids, newest to oldest





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
        return !!currentNoteIDs[noteID]
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
    var pruneInterval = setInterval(pruneEndedNotes, 700)
















    /*
     * 
     * 
     *          NOTE create / release / dispose
     * 
     * 
    */


    function Note(time) {
        if (++_noteID > 255) _noteID = 1
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
            if (node.Q) {
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
        var endTime = time

        // note envelope data objs: { param, ramps, r, z }
        note.envelopes.forEach(env => {
            if (env.r < 0) return
            var param = env.param
            param.cancelScheduledValues(time)
            // check if release happens during any linear ramps
            env.ramps.forEach(ramp => {
                if (time < ramp.t0 || time > ramp.t1) return
                // value at point where release should occur
                var amt = (time - ramp.t0) / (ramp.t1 - ramp.t0)
                var val = ramp.v0 + amt * (ramp.v1 - ramp.v0)
                // reschedule the first part of the ramp
                param.cancelScheduledValues(time)
                param.linearRampToValueAtTime(val, time)
            })
            // schedule release
            var target = env.z
            var timeConst = env.r
            param.setTargetAtTime(target, time, timeConst)
            endTime = Math.max(endTime, time + 8 * timeConst)
        })
        note.endTime = endTime

    }



    function disposeNote(note) {
        var time = ctx.currentTime
        while (note.nodes.length > 0) {
            var node = note.nodes.pop()
            node.disconnect()
            if (node.gain) node.gain.cancelScheduledValues(time)
            if (node.frequency) node.frequency.cancelScheduledValues(time)
            if (node.playbackRate) node.playbackRate.cancelScheduledValues(time)
            if (node.Q) node.Q.cancelScheduledValues(time)
            if (node.stop) node.stop()
        }
        note.nodes = null
        note.envelopes = null
        note.bendables = null
    }


}



