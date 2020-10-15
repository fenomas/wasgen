
import { createSourceNode } from '../builders/sourceNodes'
import { createEffect } from '../builders/effects'
import { applyParam } from './params'



/*
 * 
 *      Builds all source + effects for a chunk of input program
 *          i.e. all program objects with a 'type' property
 * 
 *      'source' means a node generating sound (e.g. oscillator, noise)
 *      'effect' means a filter/shaper/crusher
 *      if the input program has multiple sources/effects, this module will
 *          merge them and return a single output node
 *      Note: applies param programs to each node - this may create more sources!
 * 
 *      Inputs:
 *          note - data object for the current prog/note
 *          prog - can be: object, [object], ()=>object, ()=>[object]
 *          target - root/freq/gain/Q
 *          needsEnv - source needs a gain envelope to avoid artifacts
 * 
*/


export function buildSources(ctx, note, program, freq, time, target) {

    // initial conformance
    var programList = conformProgList(program)

    // run through input programs, chaining/merging any sources/effects created
    var currInputs = []

    for (var i = 0; i < programList.length; i++) {
        var prog = programList[i]
        if (typeof prog === 'function') prog = prog()
        if (typeof prog === 'string') prog = { type: prog }
        if (typeof prog !== 'object') continue
        if (typeof prog.type === 'undefined') continue
        var type = prog.type
        if (typeof type === 'function') type = type()
        if (!type) type = 'sine'

        // prog must represent either an effect or a source
        var effect = null
        var node = null
        effect = createEffect(ctx, type)
        node = effect || createSourceNode(ctx, type)
        if (node.start) node.start(time)
        note.nodes.push(node)

        // chain into a gain node if prog exists or gain envelope is required
        var gainNode = null
        var needsEnv = (!effect && target === 'root')
        var gainNeeded = needsEnv || prog.gain || (!effect && target === 'freq')
        if (gainNeeded) {
            gainNode = ctx.createGain()
            note.nodes.push(gainNode)
        }

        // apply all parameter programs
        applyAllParameters(ctx, note, node, prog, freq, time, target, gainNode, needsEnv)

        // create any effects, chaining node into them
        if (!effect && prog.effect) {
            var effList = conformProgList(prog.effect)
            for (var j = 0; j < effList.length; j++) {
                var effProg = effList[j]
                if (typeof effProg === 'function') effProg = effProg()
                if (typeof effProg === 'string') effProg = { type: effProg }
                if (typeof effProg !== 'object') continue
                var chainedEffect = createEffect(ctx, effProg.type)
                if (!chainedEffect) continue

                // effect parameters
                applyAllParameters(ctx, note, chainedEffect, effProg, freq, time, target, null, false)

                // insert into output chain
                note.nodes.push(chainedEffect)
                node.connect(chainedEffect)
                node = chainedEffect
            }
        }

        // if gain was made earlier, chain into it now that effects are done
        if (gainNode) {
            node.connect(gainNode)
            node = gainNode
        }

        // finally update the output chain
        if (effect) {
            currInputs.forEach(input => input.connect(node))
            currInputs = [node]
        } else {
            currInputs.push(node)
        }
    }

    // exit case where no sources were defined
    if (currInputs.length === 0) return null

    // final resolve for output chain
    if (currInputs.length === 1) return currInputs.pop()

    var output = ctx.createGain()
    note.nodes.push(output)
    currInputs.forEach(input => input.connect(output))
    return output
}

function conformProgList(prog) {
    if (typeof prog === 'function') prog = prog()
    return (Array.isArray(prog)) ? prog : [prog]
}







/*
 * 
 *      consolidated logic to apply param programs to a node
 *      node is a source or effect, prog is the node's program
 *      if necessary, adds a gain node after the node in question
 * 
*/

function applyAllParameters(ctx, note, node, prog, freq, time, target, gainNode, needsEnv) {

    if (node.Q && prog.Q) {
        var srcQ = applyParam(ctx, node.Q, note, freq, time, prog.Q, 'Q', target, false)
        if (srcQ) srcQ.connect(node.Q)
    }

    // always apply a frequency if possible, even if no program
    if (node.frequency || node.playbackRate) {
        var freqParam = node.frequency || node.playbackRate
        var freqValue = (node.playbackRate) ? freq / 440 : freq
        var freqProg = prog.freq || {}
        var srcF = applyParam(ctx, freqParam, note, freqValue, time, freqProg, 'freq', target, false)
        if (srcF) srcF.connect(freqParam)

    }

    var gainParam = (gainNode) ? gainNode.gain : node.gain || null
    if (gainParam) {
        var srcG = applyParam(ctx, gainParam, note, freq, time, prog.gain, 'gain', target, needsEnv)
        if (srcG) srcG.connect(gainParam)
    }
}





