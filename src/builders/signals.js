

import { createFilter, checkFilterType } from './filters'
import { createShaper, checkShaperType } from './shapers'
import { createSource, isNoise } from './sources'
import { buildParam } from './params'



/*
 * 
 *      Sets up a signal - top-level element for a program
 *      includes setting up the signal's params (perhaps recursively)
 * 
 *      target = freq/gain/Q if the signal is targeting a parameter
 *      needsEnv = true for signals leading to output or output gain params
 *          (which must ramp from 0 to avoid audio artifacts)
 * 
*/

export function buildSignal(ctx, note, program, freq, time, target, needsEnv) {
    program = conformSignalProgram(program)
    var type = program.type

    // settings
    var usesGain = true
    var usesFreq = true
    var usesQ = false

    var isShaper = checkShaperType(type)
    if (isShaper) {
        usesGain = false
        usesFreq = false
        usesQ = false
        if (target) throw 'Shapers must be at root level of program'
    }

    var filtType = checkFilterType(type)
    if (filtType) {
        usesGain = filtType.usesGain
        usesFreq = filtType.usesFreq
        usesQ = filtType.usesQ
        if (target) throw 'Filters must be at root level of program'
    }

    // create and start base node and store in note data
    var node = (filtType) ? createFilter(ctx, type) :
        (isShaper) ? createShaper(ctx, type) :
            createSource(ctx, type)

    if (node.start) node.start(time)
    note.nodes.push(node)

    // set up the three param types
    if (usesFreq) {
        var param = node.frequency || node.playbackRate
        var useFreq = (node.playbackRate) ? freq / 440 : freq
        buildParam(ctx, param, note, useFreq, time, program.freq, 'freq', target, false)
    }

    if (usesQ) {
        buildParam(ctx, node.Q, note, freq, time, program.Q, 'Q', target, false)
    }

    if (usesGain) {
        if (!node.gain) {
            var gain = ctx.createGain()
            note.nodes.push(gain)
            node.connect(gain)
            node = gain
        }
        if (filtType) needsEnv = false
        buildParam(ctx, node.gain, note, freq, time, program.gain, 'gain', target, needsEnv)
    }

    return node
}




function conformSignalProgram(input) {
    var prog = (typeof input === 'object') ? input : {}
    if (!prog.type) prog.type = ''
    return prog
}



