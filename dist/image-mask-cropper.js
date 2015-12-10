/**
 * imageMaskCropper.
 * Jquery library that gives you ability to move images across container using mask as well.
 * 
 * @return {object} imageMaskCropper plugin
 */
;(function (factory) { 
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module. 
        define(['jquery'], factory); 
    }
    else if (typeof exports === 'object') {
        // Node/CommonJS 
        factory(require('jquery')); 
    }
    else { 
        // Browser globals 
        factory(window.jQuery || window.Zepto); 
    } 
 }(function($) { 
    $.fn.imageMaskCropper = function (options) {
        var settings = $.extend({
        }, options);
        return this;
    };
}));