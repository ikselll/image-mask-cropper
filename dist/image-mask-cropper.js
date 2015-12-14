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
    ],
    /**
     * Avaliable types of images.
     * @type {array}
     */
    avaliableTypes = ['imageMain', 'imageMask'];
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
        return $('<img>').attr('src', src).load();
    };
    /**
     * eventHandler class for retrieve /drag events.
     * 
     * @param  {object} superClass instance of DOMHandler
     * @return {void}
     */
    var eventHandler = function (superClass) {
        var self = this;

        self.super = superClass;
        self.$elToMove = (function() {
            if (self.super.$imageMask === null) {
                return;//cropelement
            }
            return self.super.$imageMain;
        })();

        self.maskOptions = (function(dataMaskOptions) {
             if (typeof dataMaskOptions === 'string') {
                return JSON.parse(dataMaskOptions);
             }
             return self.super.super.settings.maskOptions;
        })(self.super.super.$element.attr('data-mask-options'));

        self.initEvents();
    }
    /**
     * eventHandler methods.
     * @type {object}
     */
    eventHandler.prototype = {
        /**
         * Initialization methods.
         * 
         * @return {void}
         */
        initEvents: function () {
            this._onMove();
        },
        _onMove: function () {
            var startMousePos = null;

            $(document).on('mousedown touchstart', this.super.$container, function (e) {
                e.preventDefault();
                startMousePos = {
                    x: e.pageX,
                    y: e.pageY
                };
            });

            $(document).on('mousemove touchmove', this.super.$container, function (e) {
                e.preventDefault();
                var diff = {
                    x: 0,
                    y: 0
                };
                if (startMousePos !== null) {
                    diff.x = startMousePos.x - e.pageX;
                    diff.y = startMousePos.y - e.pageY;
                }
            });

            $(document).on('mouseup touchend', this.super.$container, function (e) {
                e.preventDefault();

                startMousePos = null;
            });
        }
    };
    /**
     * DOMHandler class for manipulating DOM.
     * 
     * @param  {object} superClass instance of imageMaskCropper
     * @return {void}
     */
    var DOMHandler = function (superClass) {
        this.super = superClass;

        this.$container = null;
        this.$imageMain = null;
        this.$imageMask = null;

        this.eventHandler = null;

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
            this._insertElementsIntoContainer();
            this._initEvents();
        },
        /**
         * Images Events initialization.
         * 
         * @return {void}
         */
        _initEvents: function () {
            this.eventHandler = new eventHandler(this);
        },
        /**
         * Inserts img elements into created container.
         * 
         * @return {void}
         */
        _insertElementsIntoContainer: function () {
            if (this._areImagesInitialized() === false) {
                this._createNewImageInstances();
            }
            else {
                this._changeImageInstances();   
            }
            if (this._isContainerExisting() === false) {
                this._createContainer();
            }
            this.super.$element.css({
                display: 'none'
            });
            this._appendImage('imageMain');
            this._appendImage('imageMask');

            this._fitImageToMask();
        },
        /**
         * Checks if images are assigned to DOMHandler.
         * 
         * @return {boolean}
         */
        _areImagesInitialized: function() {
            return ((this.super.imageMain !== null && this.$imageMain !== null) ||
                    (this.super.imageMask !== null && this.$imageMask !== null))
        },
        /**
         * Crates new Image instance (also adds image tag into DOM with proper classes).
         * 
         * @return {void}
         */
        _createNewImageInstances: function() {
            if (this.super.imageMain !== null) {
                this.$imageMain = this._createImage('imageMain');
            }
            if (this.super.imageMask !== null) {
                this.$imageMask = this._createImage('imageMask');
            }
            this._applyImagesCSS();
        },
        /**
         * Creates DOM image based on parameter.
         *
         * @param  {string} imageType type of dom image
         * @return {object} jquery image
         */
        _createImage: function (imageType) {
            if (avaliableTypes.indexOf(imageType) === -1) {
                throw new Error('Cannot create dom image with wrong image type!')
            }
            return $('<img>').attr('src', this.super[imageType].src).addClass(this.super.settings[imageType + 'Class']);
        },
        /**
         * Appends image into container.
         * 
         * @param  {string} imageType type of dom image
         * @return {void}
         */
        _appendImage: function (imageType) {
            if (avaliableTypes.indexOf(imageType) === -1) {
                throw new Error('Cannot append dom image with wrong image type!')
            }
            if (this['$' + imageType] !== null) {
                this['$' + imageType].appendTo(this.$container);
            }
        },
        /**
         * Changes src of images used in plugin.
         * 
         * @return {void}
         */
        _changeImageInstances: function () {
            var self = this;
            avaliableTypes.forEach(function (image) {
                if (self.super[image] !== null && self.super[image] !== null) {
                    if (self['$' + image].length === 0) {
                        self['$' + image] = this._createImage(image);
                        self._appendImage(image);
                    }
                    self['$' + image].attr('src', self.super[image].src);
                }
                else {
                    self['$' + image].remove();
                    self['$' + image] = null;
                }
            });

            this._applyImagesCSS();
        },
        /**
         * Applies CSS into given image.
         * 
         * @return {boolean}
         */
        _applyImagesCSS: function () {
            if (this.$imageMask === null) {
                this.$imageMain.removeAttr('style').css({
                    position: 'static'
                });
            }
            else {
                this.$imageMain.removeAttr('style').css({
                    position: 'absolute'
                });
                this.$imageMask.removeAttr('style').css({
                    position: 'relative',
                    width: '100%'
                });
            }
        },
        /**
         * Fits image into mask procentage values
         * 
         * @return {void}
         */
        _fitImageToMask: function () {
            var self = this,
                options = null;

            if (self.$imageMask === null) {
                return false;
            }
            options = (function(dataMaskOptions) {
                if (typeof dataMaskOptions === 'string') {
                    return JSON.parse(dataMaskOptions);
                }
                return self.super.settings.maskOptions;
            })(self.super.$element.attr('data-mask-options'));

            if (self.$imageMain.height() > self.$imageMain.width()) {
                self.$imageMain.css({
                    width: options.width + '%',
                    left: options.left + '%'
                });
            }
            else {
                self.$imageMain.css({
                    height: options.height + '%',
                    top: options.top + '%'
                });
            }
            self._centerImageToMask();
        },
        /**
         * Centers main image based on mask size.
         * 
         * @return {void}
         */
        _centerImageToMask: function () {
            var self = this,
                imgProp = self.$imageMain.width() / self.$imageMain.height() * 100,
                options = null;

            if (self.$imageMask === null) {
                return false;
            }

            options = (function(dataMaskOptions) {
                if (typeof dataMaskOptions === 'string') {
                    return JSON.parse(dataMaskOptions);
                }
                return self.super.settings.maskOptions;
            })(self.super.$element.attr('data-mask-options'));

            if (self.$imageMain.height() > self.$imageMain.width()) {
                
            }
        },
        /**
         * Checks if container is already in DOM.
         * 
         * @return {boolean}
         */
        _isContainerExisting: function () {
            var cClass = this.super.settings.cropperContainerClass;
            return ($('.' + cClass).length > 0 && this.super.$element.parent().find($('.' + cClass)));
        },
        /**
         * Creates the container div baed in cropperContainerClass.
         * 
         * @return {void}
         */
        _createContainer: function () {
            var cClass = this.super.settings.cropperContainerClass;
            this.$container = $('<div/>').addClass(cClass).insertAfter(this.super.$element);

            this._applyContainerCss();
        },
        /**
         * Applies CSS into parent container.
         * 
         * @return {void}
         */
        _applyContainerCss: function () {
            this.$container.css({
                overflow: 'hidden',
                position: 'relative'
            });
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
        var imageObject = {};

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
        this.initEvents();
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

            if (this.status === 2) {
                throw new Error ('Application is processing! Try in few seconds later');
            }

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
         * Initializes main plugin events.
         * 
         * @return {void}
         */
        initEvents: function () {
          this._onChangeImageMain();
          this._onChangeImageMask();
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
            if (this.DOMHandler === null) {
                this.DOMHandler = new DOMHandler(this);
            }
            else {
                this.DOMHandler.init();
            }
        },
        /**
         * Events changes main image src.
         * 
         * @return {void}
         */
        _onChangeImageMain: function () {
            var self = this;
            this.$element.on('imageMaskCropper:self:ChangeImageMain', function (e, imageSrc) {
                self.$element.attr({
                    src: imageSrc
                });
                self.init();
            });
        },
        /**
         * Event changes maks image attr.
         * 
         * @return {void}
         */
        _onChangeImageMask: function () {
            var self = this;
            /**
             * @param {string|null} imageSrc (if null is given, than Image is removed)
             */
            this.$element.on('imageMaskCropper:self:ChangeImageMask', function (e, imageSrc) {
                if (imageSrc === null) {
                    self.$element.removeAttr('data-mask-image');
                }
                else {
                    self.$element.attr({
                        'data-mask-image': imageSrc
                    });
                }
                self.init();
            });
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

        window.maskCropperInstance = this.maskCropperInstance = new imageMaskCropper(settings, this);
        return this;
    };
    /**
     * Default options of plugin.
     * 
     * @type {object}
     */
    $.fn.imageMaskCropper.defaults = {
        maskImage: '',
        /**
         * PercentageValues
         * @type oObject}
         */
        maskOptions: {
            left: 0,
            right: 0,
            width: 100,
            height: 100
        },
        cropperContainerClass: 'image-mask-cropper',
        imageMainClass: 'cropper-image-main',
        imageMaskClass: 'cropper-image-mask',
    };
    /* <--END: plugin core-->  */
}));