'use strict'

var Params = require('./params')
var Sources = require('./sources')
var defs = require('./progDefs')

module.exports = Player



function Player(ctx, dest) {



    /*
     * 
     *      API
     * 
    */

    this.maxVoices = 64



    this.play = function (program, freq, vol, time, releaseTime) {
        time = time || ctx.currentTime
        enforceMaxVoices(this.maxVoices - 1)
        var note = addNote(program, freq, vol, time, dest)
        if (releaseTime) releaseNote(note, releaseTime)
        return note.id
    }


    this.release = function (noteID, time) {
        time = time || ctx.currentTime
        releaseNoteByID(noteID, time)
    }


    this.releaseAll = function (time) {
        time = time || ctx.currentTime
        for (var i = 0; i < currentNotes; i++) {
            var id = currentNotes[i].id
            releaseNoteByID(id, time)
        }
    }






    /*
     * 
     *      note management and lifecycle
     * 
    */



    var currentNotes = []
    var notesHeld = 0


    function enforceMaxVoices(limit) {
        if (notesHeld <= limit) return
        for (var i = 0; i < currentNotes.length; i++) {
            if (!currentNotes[i].released) {
                releaseNote(currentNotes[i], ctx.currentTime)
                if (notesHeld <= limit) return
            }
        }
    }

    function addNote(program, freq, vol, time, dest) {
        var note = makeNote(program, freq, vol, time, dest)
        currentNotes.push(note)
        return note
    }

    function releaseNoteByID(id, time) {
        for (var i = 0; i < currentNotes.length; i++) {
            if (currentNotes[i].id === id) {
                releaseNote(currentNotes[i], time)
                return
            }
        }
    }


    // cleanup function
    setInterval(function () {
        var t = ctx.currentTime
        for (var i = 0; i < currentNotes.length; i++) {
            var note = currentNotes[i]
            if (note.released && t >= note.endTime) {
                disposeNote(note)
                currentNotes.splice(i, 1)
                i--
            }
        }
    }, 100)






    /*
     * 
     *      NOTE PLAYING IMPLEMENTATION
     * 
    */


    // note data struct definition

    var _noteID = 0

    function Note(time) {
        _noteID = (_noteID + 1) & 0xFFFF
        this.id = _noteID
        this.time = +time
        this.released = false
        this.endTime = +0
        // audio nodes
        this.sources = []
        this.gains = []
        // envelope nodes and values
        this.envParams = []
        this.envAttacks = []
        this.envPeaks = []
        this.envReleases = []
    }





    // note creation

    var params = new Params()
    var sources = new Sources(ctx)

    var defSweep = new defs.Sweep()
    var defEnv = new defs.Envelope()



    function makeNote(program, freq, vol, time, dest) {
        var note = new Note(time)

        var signalFreqs = []
        for (var i = 0; i < program.length; i++) {
            var signal = program[i]

            // this is sugar to make the UI work easier
            if (signal.type === 'none') continue

            // parse target
            var target = -1
            var targetProp = ''
            if (signal.target) {
                var split = signal.target.split('.')
                target = parseInt(split[0])
                targetProp = split[1]
            }

            // create the source node (oscillator or bufferSource)
            var src = sources.createSource(signal.type || 'sine')
            src.start(time)

            // set up source frequency param and remember base/peak value in signalFreqs
            var fqBase = (target < 0) ? freq : signalFreqs[target]
            var isPBR = !!src.playbackRate
            var fqParam = (isPBR) ? src.playbackRate : src.frequency
            // treat empty freq param program as a blank sweep
            var fqProg = signal.freq || defSweep
            if (Object.keys(fqProg).length === 0) fqProg = defSweep
            signalFreqs[i] = params.apply(note, fqParam, time, fqBase, fqProg, freq, isPBR)

            // set up the gain node
            var gain = ctx.createGain()
            var gBase = (target < 0) ? vol * vol
                : (targetProp === 'freq') ? signalFreqs[target]
                    : 1
            var gProg = signal.gain || defEnv
            if (Object.keys(gProg).length === 0) gProg = defEnv
            var peakGain = params.apply(note, gain.gain, time, gBase, gProg, freq)

            // destination
            var connectTo = dest
            if (target >= 0) {
                if (targetProp === 'freq') {
                    var node = note.sources[target]
                    connectTo = node.frequency || node.playbackRate
                } else if (targetProp === 'gain') {
                    connectTo = note.gains[target].gain
                } else {
                    console.warn('NYI -- unknown target prop', targetProp)
                }
            }

            // node connection chain
            src.connect(gain)
            gain.connect(connectTo)

            // store nodes
            note.sources[i] = src
            note.gains[i] = gain
        }
        notesHeld++
        return note
    }





    // release - set release envelopes if there are any, etc.

    function releaseNote(note, time) {
        if (note.released) return

        var maxRel = 0
        note.envParams.forEach((param, i) => {
            param.cancelScheduledValues(time)

            // set current value if release happens during attack ramp
            var noteStart = note.time
            var peakTime = noteStart + note.envAttacks[i]
            if (time <= peakTime) {
                var releaseVal = note.envPeaks[i]
                if (time < peakTime) releaseVal *= (time - noteStart) / (peakTime - noteStart)
                param.setValueAtTime(releaseVal, time)
            }

            // apply release decay
            var relConst = note.envReleases[i]
            param.setTargetAtTime(0, time, relConst)
            var relTime = time + relConst * 4 // ish
            if (relTime > maxRel) maxRel = relTime
        })

        note.released = true
        note.endTime = Math.max(time, maxRel)
        notesHeld--
    }



    function disposeNote(note) {
        var time = ctx.currentTime
        note.sources.forEach(node => {
            node.disconnect()
            if (node.frequency) node.frequency.cancelScheduledValues(time)
            if (node.playbackRate) node.playbackRate.cancelScheduledValues(time)
            node.stop()
        })
        note.gains.forEach(node => {
            node.disconnect()
            node.gain.cancelScheduledValues(time)
        })
        for (var s in note) if (note[s].length) note[s].length = 0
    }


}




