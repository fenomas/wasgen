'use strict'


module.exports = Effects


/*
 * 
 *      general handler to create an audio source (oscillator / buffer)
 *                  OR a biquad filter
 * 
*/


function Effects(ctx) {

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

    // effect creation

    this.createNode = function (type) {
        var t1 = filterTypes[type.substr(0, 5)]
        var t2 = filterTypes[type.substr(0, 2)]
        type = t1 || t2 || 'lowpass'
        return createFilter(type)
    }



    // info accessors

    this.isFilter = function (type) {
        var ty = type.substr(0, 2)
        return !!filterTypes[ty]
    }

    this.usesGain = function (node) {
        var str = filterParams[node.type] || ''
        return str.includes('g')
    }

    this.usesQ = function (node) {
        var str = filterParams[node.type] || ''
        return str.includes('q')
    }








    /*
     * 
     *      FILTERS
     * 
    */


    function createFilter(type) {
        var filter = ctx.createBiquadFilter()
        filter.type = type
        return filter
    }


}

