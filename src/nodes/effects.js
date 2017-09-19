'use strict'


module.exports = Effects


/*
 * 
 *      general handler to create an audio source (oscillator / buffer)
 *                  OR a biquad filter
 * 
*/


function Effects(ctx) {

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


    // info accessors

    this.usesGain = function (node) {
        var str = filterParams[node.type] || ''
        return str.includes('g')
    }
    
    this.usesQ = function (node) {
        var str = filterParams[node.type] || ''
        return str.includes('q')
    }


    // effect creation

    this.createNode = function(type) {
        if (!filterParams[type]) type = 'lowpass'
        return createFilter(type)
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

