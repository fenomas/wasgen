/*
      {type:'crush-5'}
*/
import { createShaper } from './shapers'

var supported = false
var moduleName = 'bit-crusher'



export function initializeWorklet(ctx) {
    if (supported) return
    importWorkletModule(ctx, moduleName).then(res => {
        if (res) supported = true
    })
}

export function checkCrusherType(type) {
    return (/^crush/i.test(type))
}

export function createCrusher(ctx, type) {
    initializeWorklet(ctx)

    var numArg = parseInt(type.split('-')[1])
    if (!numArg) numArg = 5
    // fallback if no worklets
    if (!supported) return createShaper(ctx, `shape-crush-${numArg}`)

    var node = new AudioWorkletNode(ctx, moduleName)
    node.parameters.get('depth').value = numArg
    node.parameters.get('freq').value = 0.15
    node.isWorklet = true
    return node
}





/*
 * 
 * 
 * 
 *              Bitcrusher audio worklet!
 *              Worklet code is from:
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
            { name: 'freq', defaultValue: 0.5, minValue: 0, maxValue: 1 },
        ]
    }
    process(inputs, outputs, parameters) {
        var input = inputs[0]
        var output = outputs[0]
        var steps = parameters.depth[0]
        var freq = parameters.freq[0]

        for (var i = 0; i < input.length; i++) {
            var channelIn = input[i]
            var channelOut = output[i]
            for (var j = 0; j < channelIn.length; j++) {
                this.phase += freq
                if (this.phase >= 1) {
                    this.phase -= 1
                    this.sample = Math.round(channelIn[j] * steps) / steps
                }
                channelOut[j] = this.sample
            }
        }
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
    moduleStr += `; registerProcessor('${moduleName}', BitcrushProcessor)`
    try {
        await ctx.resume()
        var blob = new Blob([moduleStr], { type: 'application/javascript' })
        var url = URL.createObjectURL(blob)
        await ctx.audioWorklet.addModule(url)
    } catch (e) {
        return false
    }
    return true
}







