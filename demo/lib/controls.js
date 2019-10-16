


/*
 * 
 *      Velocity bit
 * 
*/

import { setVelocity } from './audio'

var veltext = document.querySelector('#velnum')
document.querySelector('#vel').addEventListener('input', ev => {
    var vel = parseFloat(ev.target.value)
    setVelocity(vel)
    veltext.value = Math.round(vel * 100) / 100
})




/*
 * 
 *      Compress button
 * 
*/

import { setCompression } from './audio'

document.querySelector('#compress').addEventListener('input', ev => {
    setCompression(ev.target.checked)
})





/*
 * 
 *      Registration
 *      note that play button clicks get sent to same handler
 * 
*/

document.querySelector('#play').onpointerdown = ev => playEvent(ev, true)
document.querySelector('#play').onpointerup = ev => playEvent(ev, false)
window.onkeydown = ev => playEvent(ev, true)
window.onkeyup = ev => playEvent(ev, false)






/*
 * 
 *      Variously filter raw events
 * 
*/

var keys = 'zxcvbnm,./asdfghjkl;\'qwertyuiop[]1234567890'
var shifting = false

function playEvent(ev, down) {
    // bail on special cases
    if (ev.metaKey) return
    if (ev.key === 'Tab') return

    // ping auto player if program text is targeted
    if (document.activeElement.id === 'progText') pingAutoPlay(false)

    // bail if focused on UI elements
    var focused = document.activeElement
    if (focused.type && focused.type.includes('text')) return
    if (focused.tagName === 'SELECT') {
        if (!/arrow/i.test(ev.key)) ev.preventDefault()
    }

    // prevent page from scrolling
    if (ev.key === ' ') ev.preventDefault()

    // handle key press
    if (ev.key === 'Shift') {
        shifting = !!down
        if (!down) handleKeyEvent(false, true, -1)
    } else {
        // implicitly handles <button> presses and spacebar like 'q'
        var keyStr = (ev.key && ev.key.toLowerCase()) || 'q'
        if (keyStr === ' ') keyStr = 'q'
        var keyIndex = keys.indexOf(keyStr)
        if (keyIndex < 0) {
            // tries mapping shift+3 into '3' instead of '#'
            var keyStr2 = String.fromCharCode(ev.keyCode)
            keyIndex = keys.indexOf(keyStr2)
        }
        if (keyIndex >= 0) handleKeyEvent(down, shifting, keyIndex)
    }
}








/*
 * 
 *      Play notes on keypress, when UI isn't focused
 * 
*/

import { startNote, bendNote, releaseNote } from './audio'

var shiftingFrom = 0
var lastNotePlayed = 60

function handleKeyEvent(down, shifted, keyIndex) {
    var note = keyIndexToNote(keyIndex)

    if (down) {
        if (!note) return
        if (shiftingFrom) {
            bendNote(shiftingFrom, note)
        } else {
            startNote(note)
            lastNotePlayed = note
            lastPlayed = performance.now()
            if (shifted) shiftingFrom = note
        }
    } else {
        if (note && !shiftingFrom) releaseNote(note)
        if (shiftingFrom && !note) {
            releaseNote(shiftingFrom)
            shiftingFrom = 0
        }
    }
}

function keyIndexToNote(ix) {
    if (ix < 0) return 0
    var scale = [0, 2, 4, 5, 7, 9, 11]
    var oct = Math.floor(ix / scale.length)
    var note = scale[ix % scale.length]
    return 33 + (12 * oct) + note
}




/*
 * 
 *      while program text is being edited, 
 *      periodically play a test note 
 * 
*/

var lastTouched = 0
var lastEdited = 0
var lastPlayed = 1

export function pingAutoPlay(editMade) {
    lastTouched = performance.now()
    if (editMade) lastEdited = lastTouched
}

setInterval(function () {
    var t = performance.now()
    if ((t - lastPlayed) < 1000) return // played recently
    if ((t - lastTouched) < 400) return // actively editing
    if (lastEdited < lastPlayed) return // no changes to play
    startNote(lastNotePlayed)
    releaseNote(lastNotePlayed, 0.5)
    lastPlayed = t
}, 250)


