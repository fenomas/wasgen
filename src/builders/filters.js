

/*
 * 
 *      Creates web audio node for a filter signal
 * 
*/


// tells whether given type is a filter, and what params it uses
export function checkFilterType(type) {
    var head = type.substr(0, 2).toLowerCase()
    if (!filterTypes[head]) return null
    var params = filterParams[filterTypes[head]]
    checkResults.usesGain = params.includes('g')
    checkResults.usesQ = params.includes('q')
    return checkResults
}

var checkResults = {
    usesFreq: true, // this is true for all filter types
    usesGain: false,
    usesQ: false,
}



// create a filter node based on the input signal definition
export function createFilter(ctx, type) {
    type = type.toLowerCase()
    var filter = ctx.createBiquadFilter()
    filter.type = filterTypes[type.substr(0, 5)] ||
        filterTypes[type.substr(0, 2)] || 'lowpass'
    return filter
}









/*
 * 
 *      type mappings, and which nodes use frequency/gain/Q values
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

var filterParams = {
    lowpass: 'fq',
    highpass: 'fq',
    bandpass: 'fq',
    lowshelf: 'fg',
    highshelf: 'fg',
    peaking: 'fqg',
    notch: 'fq',
    allpass: 'fq'
}
