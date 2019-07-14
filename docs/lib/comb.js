'use strict'
/* eslint-disable */





/*
 * 
 * source: github.com/web-audio-components/comb/
 * copied here since the original uses a package format
 * npm doesn't understand
 * 
*/








/**
 * Lowpass feedback comb filter implementation.
 *
 * Based on the implementation used in the Freeverb algorithm.
 * http://en.wikipedia.org/wiki/Comb_filter
 * https://ccrma.stanford.edu/~jos/pasp/Lowpass_Feedback_Comb_Filter.html
 *
 * @param {AudioContext} context
 * @param {object} opts
 * @param {number} opts.delay
 * @param {number} opts.feedback
 * @param {number} opts.damping
 * @param {number} opts.cutoff
 */

function Comb (context, opts) {
    this.input = context.createGain();
    this.output = context.createGain();
  
    // Internal AudioNodes
    this._delay = context.createDelay();
    this._damping = context.createGain();
    this._filter = context.createBiquadFilter();
    this._feedback = context.createGain();
  
    // AudioNode graph routing
    this.input.connect(this._delay);
    this._delay.connect(this._damping);
    this._damping.connect(this.output);
  
    this._damping.connect(this._filter);
    this._filter.connect(this._feedback);
    this._feedback.connect(this.input);
  
    // Defaults
    var p = this.meta.params;
    opts = opts || {};
    this._delay.delayTime.value   = opts.delay     || p.delay.defaultValue;
    this._feedback.gain.value     = opts.feedback  || p.feedback.defaultValue;
    this._damping.gain.value      = opts.damping   || p.damping.defaultValue;
    this._filter.frequency.value  = opts.cutoff    || p.damping.defaultValue;
  
    // Prevent positive feedback loops
    if (this.feedback * this.damping >= 1.0) {
      throw new Error("These parameter values will create a positive feedback loop.");
    }
  }
  
  Comb.prototype = Object.create(null, {
  
    /**
     * AudioNode prototype `connect` method.
     *
     * @param {AudioNode} dest
     */
  
    connect: {
      value: function (dest) {
        this.output.connect( dest.input ? dest.input : dest );
      }
    },
  
    /**
     * AudioNode prototype `disconnect` method.
     */
  
    disconnect: {
      value: function () {
        this.output.disconnect();
      }
    },
  
    /**
     * Module parameter metadata.
     */
  
    meta: {
      value: {
        name: "Comb Filter",
        params: {
          delay: {
            min: 0,
            max: 3,
            defaultValue: 0.027,
            type: "float"
          },
          feedback: {
            min: 0,
            max: 1,
            defaultValue: 0.84,
            type: "float"
          },
          damping: {
            min: 0,
            max: 1,
            defaultValue: 0.52,
            type: "float"
          },
          cutoff: {
            min: 0,
            max: 22050,
            defaultValue: 3000,
            type: "float"
          }
        }
      }
    },
  
    /**
     * Public parameters.
     */
  
    delay: {
      enumerable: true,
      get: function () { return this._delay.delayTime.value; },
      set: function (value) {
        this._delay.delayTime.setValueAtTime(value, 0);
      }
    },
  
    feedback: {
      enumerable: true,
      get: function () { return this._feedback.gain.value; },
      set: function (value) {
        this._feedback.gain.setValueAtTime(value, 0);
      }
    },
  
    damping: {
      enumerable: true,
      get: function () { return this._damping.gain.value; },
      set: function (value) {
        this._damping.gain.setValueAtTime(value, 0);
      }
    },
  
    cutoff: {
      enumerable: true,
      get: function () { return this._filter.frequency.value; },
      set: function (value) {
        this._filter.frequency.setValueAtTime(value, 0);
      }
    }
  
  });
  
  /**
   * Exports.
   */
  
  module.exports = Comb;
  