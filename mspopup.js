/*
 * eZmodal
 * doc: http://markusslima.github.io/ezmodal/
 * github: https://github.com/markusslima/ezmodal
 *
 * Copyright (c) 2015 Markus Vinicius da Silva Lima
 * Version 0.1.0
 * Licensed under the MIT license.
 */
(function ($) {
    "use strict";
    
    $(window).on('keyup', function (event) {
        if (event.keyCode === 27) {
            var data = $('.mspopup').data('mspopup');
            if (data.options.closable) {
                $('.mspopup').mspopup('hide');
            }
        }
    });

    $(document).on('click', '.mspopup', function () {
        var data = $(this).data('mspopup');
        if (data.options.closable) {
            $(this).mspopup('hide');
        }
    });

    $(document).on('click', '.mspopup .mspopup-container', function (event) {
        event.stopPropagation();
    });
    
    $(document).on('click', '[data-dismiss="mspopup"]', function () {
        $(this).parent().parent().parent().mspopup('hide');
    });

    $(document).on('click', '[mspopup-target]', function () {
        $($(this).attr('mspopup-target')).mspopup('show');
    });

    var mspopup = function (element, options) {
        this.options = options;
        this.$element = $(element);
    };

    mspopup.prototype = {
        width: function () {

            
        },
        
        show: function () {
            this.$element.show();
            this.options.onShow();
        },
        
        hide: function () {
            this.$element.hide();
            this.options.onClose();
        },

        isVisible: function () {
            return this.$element.css('visibility') === 'visible' ? true : false;
        },
        
        constructor: function () {
            var _this = this,
                container = this.$element.find('.mspopup-container');
                
            if (this.options.autoOpen) {
                this.show();
            }
            
            if (Number(this.options.width)) {
                container.css({
                    'width':  _this.options.width+'px'
                });
            } else {
                switch (_this.options.width) {
                    case 'small':
                        container.css({'width': '40%'});
                        break;
                    case 'medium':
                        container.css({'width': '75%'});
                        break;
                    case 'full':
                        container.css({'width': '95%'});
                        break;
                }
            }
        }
    };

    var old = $.fn.mspopup;

    $.fn.mspopup = function (option, value) {
        var get = '',
            element = this.each(function () {
                var $this = $(this),
                    data = $this.data('mspopup'),
                    options = $.extend({}, $.fn.mspopup.defaults, option, typeof option === 'object' && option);

                if (!data) {
                    $this.data('mspopup', (data = new mspopup(this, options)));
                    data.constructor();
                }

                if (typeof option === 'string') {
                    get = data[option](value);
                }
            });

        if (typeof get !== 'undefined') {
            return get;
        } else {
            return element;
        }
    };

    $.fn.mspopup.defaults = {
        'width': 500,
        'closable': true,
        'autoOpen': false,
        'onShow': function () {},
        'onClose': function () {}
    };

    $.fn.mspopup.noConflict = function () {
        $.fn.mspopup = old;
        return this;
    };
})(window.jQuery);
