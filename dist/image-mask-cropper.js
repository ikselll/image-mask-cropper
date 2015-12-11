/**
 * imageMaskCropper.
 * Jquery library that gives you ability to move images across container using mask as well.
 *
 * @author Miłosz Sobczak <milosz.sobczak@pixers.pl>
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
    /* <--class core-->  */
    /**
     * Avaliable statuses with comments.
     * @type {array}
     */
    var statuses = [
        1, //none
        2, //isRunning
        4, //Done
        8 //ImagesFailed
    ];
    /**
     * Sets status if is avaliable in global statuses.
     * 
     * @param {int} status
     */
    var setStatus = function (status) {
        if (statuses.indexOf(status) === -1) {
            throw new Error('There is no status given like that.');
        }
        this.status = status;

    };
    /**
     * Loads image and returns promise
     * 
     * @param  {string} src srouce of image
     * @return {promise}
     */
    var loadImage = function (src) {
        return $.get(src);
    };
    /**
     * DOMHandler class fot manipulating DOM.
     * 
     * @param {object} superClass instance of imageMaskCropper
     * @return {void}
     */
    var DOMHandler = function (superClass) {
        this.super = superClass;

        this.init();
    };
    /**
     * DOMHandler methods.
     * @type {object}
     */
    DOMHandler.prototype = {
        /**
         * Initialization methods.
         * 
         * @return {void}
         */
        init: function () {
            this._insertIntoContainer();
        },
        /**
         * Inserts or replaces container with new $element.
         * 
         * @return {void}
         */
        _insertIntoContainer: function () {
            var $container = null,
                cClass = this.super.settings.cropperContainerClass;

            if (this._isContainerExisting() === false) {
                $container = $('<div/>').addClass(cClass).insertAfter(this.super.$element);
                this.super.$element.appendTo($container);
            }
            else {
                $('.' + cClass).append(this.super.$element);
            }
        },
        /**
         * Checks if container is already in DOM.
         * 
         * @return {boolean} [description]
         */
        _isContainerExisting: function () {
            var cClass = this.super.settings.cropperContainerClass;
            return ($('.' + cClass).length > 0 && $('.' + cClass).contains(this.super.$element));
        }
        /**
         * Applies CSS into parent container.
         * 
         * @return {void}
         */
        _applyContainerCss: function () {
            
        }
    };
    /**
     * Returns image object with given properties. Check its correct as well.
     * 
     * @param  {string} type is it a main image or a mask.
     * @param  {string} src source of the image
     * @return {object} proper ~image Object
     */
    var ImageObject = function (type, src) {
        var imageObject = {},
            avaliableTypes = ['imageMain', 'imageMask'];

        Object.defineProperties(imageObject, {
            'type': {
                set: function (value) {
                    if (typeof value !== 'string' || avaliableTypes.indexOf(value) === -1) {
                        return this._type;
                    }
                    this._type = value;
                },
                get: function () {
                    return this._type = value;
                }
            },
            'src': {
                set: function (value) {
                    if (typeof value !== 'string') {
                        return this._src;
                    }
                    this._src = value;
                },
                get: function () {
                    return this._src;
                }
            }
        });

        imageObject.type = type;
        imageObject.src = src;

        return imageObject;
    };
    /**
     * imageMaskCropper class.
     * 
     * @param  {object} options options taken from plugin
     * @return {void}
     */
    var imageMaskCropper = function (options, $element) {
        this.settings = options || $.fn.imageMaskCropper.defaults;
        this.$element = $element;

        this.imageMain = null;
        this.imageMask = null;

        this.DOMHandler = null;

        this.status = 1;

        this.init();
    };
    /**
     * imageMaskCropper methods.
     * 
     * @type {object}
     */
    imageMaskCropper.prototype = {
        /**
         * Initialization method.
         *
         * @return {void}
         */
        init: function () {
            var self = this;

            this._checkElementLengthCorrect();
            this._checkElementTypeCorrect();
            
            this.createImages();

            setStatus.call(this, 2);
            this.runImgLoader().done(function (data) {
                setStatus.call(self, 4);
            }).fail(function () {
                setStatus.call(self, 8);
            }).always(function () {
                self.initDOM();
            });
        },
        /**
         * Executes prv functions to check existance of its attrs and initializes them.
         * 
         * @return {void}
         */
        createImages: function () {
            this._checkExistanceOfMask();
            this._checkExistanceOfSrc();
        },
        /**
         * Async image loading.
         * 
         * @return {promise}
         */
        runImgLoader: function () {
            var self = this,
                images = [loadImage(this.imageMain.src)],
                defer = $.Deferred();

            if (this.imageMask instanceof ImageObject) {
                images.push(loadImage(this.imageMask.src));
            }

            $.when(images).then(function (data) {
                data.forEach(function (singleData){
                    if ($.isNumeric(singleData.status) && singleData.status !== 200) {
                        defer.reject(singleData);
                    }
                });
                defer.resolve(data);
            });

            return defer;
        },
        /**
         * Initializes DOM Hanlder instance.
         * 
         * @return {void}
         */
        initDOM: function () {
            if (this.status !== 4) {
                throw new Error('Cannot set DOM because images haven\'t loaded properly.')
            }
            this.DOMHandler = new DOMHandler(this);
        },
        /**
         * Checks if there is one DOM element of its selector.
         *
         * @todo   adds posibility to define more than one instance
         * @return {error|boolean}
         */
        _checkElementLengthCorrect: function () {
            if (this.$element.length !== 1) {
                throw new Error('Right now it can be only one DOM element of given selector!');
            }
            return true;
        },
        /**
         * Checks if DOM element is an image.
         * 
         * @todo   adds posibility to define svg, picture tags as well
         * @return {error|boolean}
         */
        _checkElementTypeCorrect: function () {
            if (this.$element.is('img') === false) {
                throw new Error('Wrong type of dom element given');
            }
            return true;
        },
        /**
         * Checks existance of mask in data attribute or settings given.
         * 
         * @return {object}
         */
        _checkExistanceOfMask: function () {
            var srcMask = this.$element.attr('data-mask-image') || this.settings.maskImage;
            if (!!!srcMask) {
                return this.imageMask = null;
            }
            return this.imageMask = new ImageObject('imageMask', srcMask);
        },
        /**
         * Checks existance of src attr in given $element.
         * 
         * @return {object}
         */
        _checkExistanceOfSrc: function () {
            var srcMain = this.$element.attr('src');
            if (!!!srcMain) {
                return this.imageMain = null;
            }
            return this.imageMain = new ImageObject('imageMain', srcMain);
        }
    }
    /* <--END: class core-->  */

    /* <--plugin core-->  */
    /**
     * Plugin constructor.
     * 
     * @param  {object} options plugin options
     * @return {object}
     */
    $.fn.imageMaskCropper = function (options) {
        var settings = $.extend({}, $.fn.imageMaskCropper.defaults, options);

        this.maskCropperInstance = new imageMaskCropper(settings, this);
        return this;
    };
    /**
     * Default options of plugin.
     * 
     * @type {object}
     */
    $.fn.imageMaskCropper.defaults = {
        maskImage: '',
        cropperContainerClass: 'image-mask-cropper'
    };
    /* <--END: plugin core-->  */
}));