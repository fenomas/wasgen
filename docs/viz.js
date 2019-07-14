'use strict'


module.exports = Viz


function Viz(ctx, div1, div2, div3, getFreq) {
    this.enabled = true

    sampleRate = ctx.sampleRate

    var analyser1 = ctx.createAnalyser()
    var analyser2 = ctx.createAnalyser()
    var analyser3 = ctx.createAnalyser()

    makeWaveform(analyser1, div1, getFreq)
    makeEQ(analyser2, div2)
    makeSpectrograph(analyser3, div3)

    this.setNode = function (tgt) {
        if (prevTgt) prevTgt.disconnect()
        node = tgt
        tgt.connect(analyser1)
        tgt.connect(analyser2)
        tgt.connect(analyser3)
        prevTgt = tgt
    }
    var prevTgt
}

var el = document.querySelector('#viz')
var enabled = function () {
    return (el) ? el.checked : true
}



/*
*      shared
*/

// set at init
var node
var sampleRate

var minDecibels = -96
var maxDecibels = -15

var fmin = 50
var fmax = 12000

// color value for freq data [0..1]
function makeColor(val) {
    if (val === 0) return '#000'
    var h = Math.round(-80 + 130 * val)
    var s = 100
    var l = Math.round(20 + 50 * val)
    if (val > 0.99) l += 30
    return `hsl(${h},${s}%,${l}%)`
}

// interpolate val [0..1] to [fmin..fmax]
var fractionToFreq = (function () {
    var logRange = Math.log2(fmax) - Math.log2(fmin)
    var logLow = Math.log2(fmin)
    return function (value) {
        return Math.pow(2, logLow + logRange * value)
    }
})()

var freqToIndex = function (analyser, freq) {
    var nyquist = sampleRate / 2
    return Math.round(freq / nyquist * analyser.frequencyBinCount)
}

var mx = 0, mn = 1
var valueToHeight = function (val) {
    mx = Math.max(mx, val)
    mn = Math.min(mn, val)
    return (val * val / 255 / 255)
}

var timeToSamples = function (time) {
    return sampleRate * time // samples/sec * sec
}

function findZeroPoint(buffer, start) {
    var i = Math.floor(start) + 1
    for (; i < buffer.length; i++) {
        if (buffer[i - 1] >= 128 && buffer[i] <= 127) return i - 1
    }
    return buffer.length - 1
}


/*
 * 
 *      graphs
 * 
*/

function makeWaveform(analyser, canvas, getFreq) {
    analyser.fftSize = 1 << 11
    // analyser.smoothingTimeConstant = 0.7
    analyser.minDecibels = minDecibels
    analyser.maxDecibels = maxDecibels

    var canvasCtx = canvas.getContext('2d')
    var bufferLength = analyser.frequencyBinCount
    var dataArray = new Uint8Array(bufferLength)
    var width = canvas.width
    var height = canvas.height
    canvasCtx.fillStyle = makeColor(0)
    canvasCtx.fillRect(0, 0, width, height)

    var draw = function () {
        // requestAnimationFrame(draw)        
        if (!node || !enabled()) return

        analyser.getByteTimeDomainData(dataArray)

        var startIndex = findZeroPoint(dataArray, 0)
        var periodSamples = 1.6 * sampleRate / getFreq()
        if (startIndex === bufferLength - 1) startIndex = 0
        var endIndex = Math.min(startIndex + periodSamples, bufferLength)

        canvasCtx.fillStyle = makeColor(0)
        canvasCtx.fillRect(0, 0, width, height)

        canvasCtx.lineWidth = 1
        canvasCtx.moveTo(0, height / 2)
        canvasCtx.strokeStyle = makeColor(1)
        canvasCtx.beginPath()

        for (var x = 0; x < width; x++) {
            var xval = x / width
            var index = Math.round(startIndex + xval * (endIndex - startIndex))
            var amt = dataArray[index] / 255
            var y = amt * height

            canvasCtx.lineTo(x, y)
        }
        canvasCtx.stroke()
    }
    // requestAnimationFrame(draw)
    setInterval(draw, 100)
}




function makeEQ(analyser, canvas) {
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.3
    analyser.minDecibels = minDecibels
    analyser.maxDecibels = maxDecibels

    var canvasCtx = canvas.getContext('2d')
    var bufferLength = analyser.frequencyBinCount
    var dataArray = new Uint8Array(bufferLength)
    var width = canvas.width
    var height = canvas.height
    canvasCtx.fillStyle = makeColor(0)
    canvasCtx.fillRect(0, 0, width, height)

    var draw = function () {
        requestAnimationFrame(draw)
        if (!node || !enabled()) return

        canvasCtx.fillStyle = makeColor(0)
        canvasCtx.fillRect(0, 0, width, height)

        analyser.getByteFrequencyData(dataArray)

        for (var x = 0; x < width; x++) {
            var val = x / (width - 1)
            var freq = fractionToFreq(val)
            var index = freqToIndex(analyser, freq)
            var amt = valueToHeight(dataArray[index])
            var y = Math.round(amt * height)

            canvasCtx.fillStyle = makeColor(amt)
            canvasCtx.fillRect(x, height - y, 1, y)
        }
    }
    requestAnimationFrame(draw)
}





function makeSpectrograph(analyser, canvas) {
    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.3
    analyser.minDecibels = minDecibels
    analyser.maxDecibels = maxDecibels

    var canvasCtx = canvas.getContext('2d')
    var bufferLength = analyser.frequencyBinCount
    var dataArray = new Uint8Array(bufferLength)

    var width = canvas.width
    var height = canvas.height
    canvasCtx.fillStyle = makeColor(0)
    canvasCtx.fillRect(0, 0, width, height)

    var speed = 1

    var draw = function () {
        requestAnimationFrame(draw)
        if (!node || !enabled()) return

        analyser.getByteFrequencyData(dataArray)

        canvasCtx.drawImage(canvas, -speed, 0, width, height)

        for (var y = 0; y < height; y++) {
            var val = (height - 1 - y) / (height - 1)
            var freq = fractionToFreq(val)
            var index = freqToIndex(analyser, freq)

            var amt = valueToHeight(dataArray[index])
            canvasCtx.fillStyle = makeColor(amt)
            canvasCtx.fillRect(width - speed, y, speed, 1)
        }
    }
    requestAnimationFrame(draw)
}



