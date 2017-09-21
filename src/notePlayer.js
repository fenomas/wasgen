'use strict'

var Params = require('./nodes/params')
var Sources = require('./nodes/sources')
var Effects = require('./nodes/effects')
var defs = require('./progDefs')

module.exports = Player



function Player(ctx, dest) {



    /*
     * 
     *      API
     * 
    */

    this.maxVoices = 32



    this.play = function (program, freq, vel, time, releaseTime) {
        time = time || ctx.currentTime
        enforceMaxVoices(this.maxVoices - 1)
        var note = addNote(program, freq, vel, time, dest)
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


    function enforceMaxVoices(limit) {
        if (currentNotes.length <= limit) return
        // dispose anything disposeable
        pruneEndedNotes()
        // if still too many, just dispose stuff, oldest first
        while (currentNotes.length > limit) {
            disposeNote(currentNotes.shift())
        }
    }

    function addNote(program, freq, vel, time, dest) {
        var note = makeNote(program, freq, vel, time, dest)
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
    function pruneEndedNotes() {
        var t = ctx.currentTime
        for (var i = 0; i < currentNotes.length; i++) {
            var note = currentNotes[i]
            if (note.endTime > 0 && t >= note.endTime) {
                disposeNote(note)
                currentNotes.splice(i, 1)
                i--
            }
        }
    }
    setInterval(pruneEndedNotes, 200)






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
        this.endTime = +0
        // audio nodes
        this.nodes = []
        // envelope nodes and values
        this.envParams = []
        this.envAttacks = []
        this.envPeaks = []
        this.envReleases = []
    }





    // note creation

    var params = new Params()
    var sources = new Sources(ctx)
    var effects = new Effects(ctx)

    var defSweep = new defs.Sweep()
    var defEnv = new defs.Envelope()

    var fakeSweep = { t: 0, f: 0 }
    var fakeEnv = { v: 1 }


    function makeNote(program, freq, vel, baseTime, dest) {
        var note = new Note(baseTime)

        var signalFreqs = []
        var baseNodes = []
        var gainNodes = []
        var destChain = []
        var lineOuts = []
        var fqParams = []

        for (var i = 0; i < program.length; i++) {
            var signal = defs.conformSignal(program[i])
            var time = baseTime + signal.delay

            // this is sugar to make the UI work easier
            if (signal.type === 'none') continue

            // create base node - either a source or an effect
            var type = signal.type
            var isSource = sources.isSource(type)
            var nodeCreator = isSource ? sources : effects
            var node = nodeCreator.createNode(type)
            if (node.start) node.start(time)
            note.nodes.push(node)
            baseNodes[i] = node
            var currOutput = node

            // parse target
            var target = -1
            var targetProp = ''
            if (signal.target) {
                target = parseInt(signal.target)
                var dot = signal.target.indexOf('.')
                if (dot > -1) targetProp = signal.target.substr(dot + 1)
            }

            // make a gain node if the source needs one, and connect it up
            var gainParam = node.gain
            if (!gainParam) {
                var gainNode = ctx.createGain()
                note.nodes.push(gainNode)
                node.connect(gainNode)
                currOutput = gainNode
                gainParam = gainNode.gain
                gainNodes[i] = gainNode
            }

            // apply gain program unless source node ignores gain
            if (nodeCreator.usesGain(node)) {
                var gBase = (target < 0) ? vel * vel : 1
                if (target >= 0 && targetProp === 'freq') {
                    gBase = signalFreqs[target]
                    if (baseNodes[target].playbackRate) {
                        gainParam = new ParamWrapper(gainParam, 1 / 440)
                    }
                }
                var res = params.apply(note, gainParam, time, gBase, signal.gain, freq)
            }

            // apply frequency program, defaulting to an empty sweep
            var fqBase = (target < 0) ? freq : signalFreqs[target]
            var fqParam = (node.playbackRate) ?
                new ParamWrapper(node.playbackRate, 1 / 440) :
                node.frequency
            var fqResult = params.apply(note, fqParam, time, fqBase, signal.freq, freq)
            //   ..and remember base/peak value in signalFreqs
            signalFreqs[i] = fqResult
            fqParams[i] = fqParam

            // effects can have a Q value and program
            if (node.Q && signal.Q && nodeCreator.usesQ(node)) {
                params.apply(note, node.Q, time, 1, signal.Q, freq)
            }

            // nodes and params ready, prepare connection chains

            // if node is an effect, put it somewhere in the output chain
            if (!isSource) {
                if (target < 0 || !lineOuts[target]) {
                    destChain.push(node)
                } else {
                    lineOuts[target].connect(node)
                    lineOuts[target] = node
                }
            } else {
                // src is an oscillator/buffer:
                if (target < 0) {
                    // signal is start of a lineout chain
                    lineOuts[i] = currOutput

                } else {
                    // signal drives a property somewhere
                    var paramTgt
                    if (targetProp === 'freq') {
                        paramTgt = fqParams[target]
                    } else if (targetProp === 'Q') {
                        paramTgt = baseNodes[target].Q
                    } else if (targetProp === 'gain') {
                        paramTgt = gainNodes[target].gain
                    } else {
                        console.warn('NYI -- unknown target prop', targetProp)
                    }
                    if (paramTgt) {
                        var pout = paramTgt.wrappedParam || paramTgt
                        currOutput.connect(pout)
                    }
                }
            }
            // end of per-signal handling
        }

        // process stored nodes into output chain
        destChain.push(dest)
        var currDest = destChain[0]
        for (var j = 0; j < lineOuts.length; j++) {
            if (lineOuts[j]) {
                lineOuts[j].connect(currDest)
            }
        }
        for (var k = 1; k < destChain.length; k++) {
            currDest.connect(destChain[k])
            currDest = destChain[k]
        }

        // sanity
        signalFreqs.length = 0
        baseNodes.length = 0
        gainNodes.length = 0
        destChain.length = 0
        lineOuts.length = 0
        fqParams.length = 0

        return note
    }


    function isSet(o) {
        if (typeof o === 'number') return true
        return !!(o && Object.keys(o).length)
    }




    /*
     * 
     *      RELEASE
     *  set release envelopes if there are any, etc.
     * 
    */

    function releaseNote(note, time) {
        if (note.endTime > 0) return
        if (time < note.time) time = note.time

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

        note.endTime = Math.max(time, maxRel)
    }



    /*
     * 
     *      DISPOSAL
     * 
    */

    function disposeNote(note) {
        var time = ctx.currentTime
        note.nodes.forEach(node => {
            node.disconnect()
            if (node.gain) node.gain.cancelScheduledValues(time)
            if (node.frequency) node.frequency.cancelScheduledValues(time)
            if (node.playbackRate) node.playbackRate.cancelScheduledValues(time)
            if (node.Q) node.Q.cancelScheduledValues(time)
            if (node.stop) node.stop()
        })
        for (var s in note) if (note[s].length) note[s].length = 0
    }


}



// Wrapper to bake a multiplier value into an AudioParam
function ParamWrapper(param, mult) {
    this.wrappedParam = param
    // this.setValue = (v) => param.value = v * mult
    this.setValueAtTime = (v, t) => param.setValueAtTime(v * mult, t)
    this.setTargetAtTime = (v, t, c) => param.setTargetAtTime(v * mult, t, c)
    this.cancelScheduledValues = (t) => param.cancelScheduledValues(t)
    this.linearRampToValueAtTime = (v, t) => param.linearRampToValueAtTime(v * mult, t)
}





