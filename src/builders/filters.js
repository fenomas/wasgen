

/*
 * 
 * 
 *      Creates web audio nodes for biquad filter effects
 * 
 * 
*/


export function isFilter(type) {
    var head = type.substr(0, 2)
    return !!filterTypes[head]
}

// create a filter node based on the input signal definition
export function createFilter(ctx, type) {
    var filter = ctx.createBiquadFilter()
    var head = type.substr(0, 2)
    var longer = type.substr(0, 5)
    filter.type = filterTypes[longer] || filterTypes[head] || 'allpass'
    return filter
}





/*
 * 
 *      known types / conformance
 * 
*/


var filterTypes = {
    pe: 'peaking',
    ba: 'bandpass',
    no: 'notch',
    al: 'allpass',
    lo: 'lowpass',
    hi: 'highpass',
    lowsh: 'lowshelf',
    highs: 'highshelf',
}
