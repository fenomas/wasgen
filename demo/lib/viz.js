

import Viz from 'webaudio-viz'
import { ctx, audioDestination } from './audio'




var fps = 20
var mode = 0
var canvas = document.querySelector('#viz')
var label = document.querySelector('#vizLabel')
var viz = new Viz(ctx, canvas, audioDestination, fps, mode)




viz.paused = true
viz.clear('#FFF')

var state = 0
canvas.addEventListener('click', ev => {
    state = (state + 1) % 4
    viz.mode = state - 1
    viz.paused = (state === 0)
    if (state === 0) viz.clear('#FFF')
    label.style.visibility = (state === 0) ? '' : 'hidden'
})


// expose a way to set the audio node
export function setVisualizerNode(node) {
    if (node) {
        viz.setInput(node)
    } else {
        viz.setInput(audioDestination)
    }
}

