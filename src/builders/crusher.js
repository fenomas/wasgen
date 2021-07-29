
import { createShaper } from './shapers'
import { getCache } from '../lib/contextCache'

var MODULE_NAME = 'bit-crusher'


/*
 * 
 * 
 *      Creates a bit-crusher audio worklet
 *  
 *      * unfortunately complicated, because Worklets
 *      * returns a wave shaper if worklets aren't supported
 * 
 *      expects program like: { type: 'crush-4' }
 *      can specify freq param: { type: 'crush-4-0.4' }
 * 
 * 
*/



export function isCrusher(type) {
    return (/^crush/i.test(type))
}


export function createCrusher(ctx, type) {
    initializeWorklet(ctx)

    // params
    var arr = type.split('-')
    var depth = parseInt(arr[1])
    var freq = parseFloat(arr[2]) || 0.2
    if (depth === 0) depth = 1
    if (!depth) depth = 5

    // fallback if no worklets
    var data = getCache(ctx)
    if (data.crush_worklet_state !== 'ok') {
        return createShaper(ctx, `shape-crush-${depth}`)
    }

    var node = new AudioWorkletNode(ctx, MODULE_NAME)
    node.parameters.get('depth').value = depth
    node.parameters.get('freq').value = freq
    window['MY_AUDIO_WORKLET'] = node
    node['isWorklet'] = true
    return node
}


// logic to init the AudioWorklet module, only once!
export function initializeWorklet(ctx) {
    var data = getCache(ctx)
    if (data.crush_worklet_state) return
    data.crush_worklet_state = 'trying'
    importWorkletModule(ctx, MODULE_NAME).then(res => {
        data.crush_worklet_state = (res) ? 'ok' : 'ng'
    })
}






/*
 * 
 * 
 * 
 *              Bitcrusher audio worklet!
 *              Worklet code is sorta from:
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet
 * 
 * 
 * 
*/

// class to be used
class BitcrushProcessor extends Object {
    constructor() {
        super()
        this.phase = 0
        this.sample = 0
    }
    static get parameterDescriptors() {
        return [
            { name: 'depth', defaultValue: 5, minValue: 1, maxValue: 20 },
            { name: 'freq', defaultValue: 0.2, minValue: 0.01, maxValue: 1 },
        ]
    }
    process(inputs, outputs, parameters) {
        var input = inputs[0]
        var output = outputs[0]
        var steps = parameters.depth[0]
        var freq = parameters.freq[0]
        var scale = steps + 0.4999
        var invsteps = 1 / steps
        var phase = this.phase
        var sample = this.sample

        for (var i = 0; i < input.length; i++) {
            var channelIn = input[i]
            var channelOut = output[i]
            for (var j = 0; j < channelIn.length; j++) {
                phase += freq
                if (phase >= 1) {
                    phase -= 1
                    sample = Math.round(channelIn[j] * scale) * invsteps
                }
                channelOut[j] = sample
            }
        }
        this.phase = phase
        this.sample = sample
        return true
    }
}





/*
 * 
 *      scaffolding to fake importing a module
 * 
*/

async function importWorkletModule(ctx, moduleName) {
    if (!ctx.audioWorklet) return false
    // string version of module to import
    var moduleStr = BitcrushProcessor.toString()
    // look away if you don't like dirty hacks
    moduleStr = moduleStr.replace('extends Object', 'extends AudioWorkletProcessor')
    // class name may be minified
    var className = /class (.+) extends/.exec(moduleStr)[1]
    moduleStr += `; registerProcessor('${moduleName}', ${className})`
    try {
        // don't resume if given an offline context
        if (!ctx.startRendering) await ctx.resume()
        var blob = new Blob([moduleStr], { type: 'application/javascript' })
        var url = URL.createObjectURL(blob)
        await ctx.audioWorklet.addModule(url)
    } catch (e) {
        return false
    }
    return true
}







