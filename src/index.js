'use strict'

var NotePlayer = require('./notePlayer')

module.exports = SoundGen



/*
 *
 *  
 *                  SoundGen
 *  
 *      Root module just exposes the API, magic is in notePlayer
 * 
 * 
*/

function SoundGen(audioContext, destination) {

    // output chain
    var AudioContext = window.AudioContext || window.webkitAudioContext
    var ctx = audioContext || new AudioContext()
    var output = ctx.createGain()
    output.connect(destination || ctx.destination)

    // note player lib
    var player = new NotePlayer(ctx, output)


    // public API

    this.output = output

    this.play = function (program, freq, vel, time, releaseTime, destNode) {
        var noteID = player.play(program, freq, vel, time, releaseTime, destNode)
        return noteID
    }

    this.bend = function (noteID, freq, timeConst, time) {
        player.bend(noteID, freq, timeConst, time)
    }

    this.release = function (noteID, time) {
        player.release(noteID, time)
    }

    this.noteIsPlaying = function (noteID) {
        return player.isPlaying(noteID)
    }

    this.releaseAll = function (time) {
        player.releaseAll(time)
    }

    this.maxVoices = function (n) {
        if (n) player.maxVoices = n
        return player.maxVoices
    }

    this.now = function () {
        return ctx.currentTime
    }

    this.dispose = function () {
        player.dispose()
    }

}



