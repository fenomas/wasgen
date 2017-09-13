'use strict'

module.exports = GuiState



function GuiState() {
    this.signals = initSignals(3)
    this.sweeps = initSweeps(3)
    this.envs = initRnvs(3)
    this.effects = initRffects(3)
}


function initSignals(n) {
    var ret = []
    while (ret.length < n) ret.push({
        w: 'sine',
        o: '',
    })
    return ret
}


function initSweeps(n) {
    var ret = []
    while (ret.length < n) ret.push({
        t: 1,
        f: '',
    })
    return ret
}



