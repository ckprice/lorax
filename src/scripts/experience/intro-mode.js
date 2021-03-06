/* global define:true */
define([
    'pixi',
    'gs',
    'experience/circle',
    'experience/mode',
    'experience/responsive'
], function (
    PIXI,
    gs,
    Circle,
    Mode,
    Responsive
) {
    'use strict';

    var IntroMode = function (canvas) {
        this._canvas = canvas;

        return this;
    };

    IntroMode.prototype = new Mode();
    IntroMode.prototype.constructor = IntroMode;

    IntroMode.prototype.init = function () {
        Mode.prototype.init.call(this);

        this._introContainer = new PIXI.DisplayObjectContainer();
        this._introContainer.x = Math.round(this._canvas.canvasSize.x / 2);
        this._introContainer.y = Math.round(this._canvas.canvasSize.y / 2);

        var messageStyle = {font: '200 24px "Fira Sans", sans-serif', fill: '#222222'};
        this._message = new PIXI.Text(this._introData.message, messageStyle);
        this._message.resolution = Responsive.RATIO;
        this._message.x = Math.round(-(this._message.width / Responsive.RATIO) / 2);
        this._message.y = -90;
        this._message.alpha = 0;
        this._introContainer.addChild(this._message);

        var internetStyle = {font: '300 12px "Fira Sans", sans-serif', fill: '#222222'};
        this._internet = new PIXI.Text(this._introData.internet, internetStyle);
        this._internet.resolution = Responsive.RATIO;
        this._internet.x = Math.round(-(this._internet.width / Responsive.RATIO) / 2);
        this._internet.y = 25;
        this._internet.alpha = 0;
        this._introContainer.addChild(this._internet);

        this._circle = new Circle();
        this._circle.draw(6);
        this._introContainer.addChild(this._circle.elm);
        this._circle._resumeStaticAnimation();
        this._circle.stopMoving();
        this._circle.elm.alpha = 0;

        this._clickArea = new PIXI.Graphics();
        this._clickArea.hitArea = new PIXI.Rectangle(0, 0, this._canvas.canvasSize.x, this._canvas.canvasSize.y);
        this._clickArea.x = -this._introContainer.x;
        this._clickArea.y = -this._introContainer.y;
        this._clickArea.interactive = true;
        this._clickArea.buttonMode = true;
        this._clickArea.mousedown = this._clickArea.tap = this._onPressClose.bind(this);
        this._introContainer.addChild(this._clickArea);

        if (Responsive.IS_SMALL()) {
            this._message.setStyle({
                font: '200 16px "Fira Sans", sans-serif',
                fill: '#222222',
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Responsive.SIZE.x - 80
            });
            this._message.x = Math.round(-(this._message.width / Responsive.RATIO) / 2);
            this._message.y = -(this._message.height / Responsive.RATIO) - 30;
        }
    };

    IntroMode.prototype.setData = function (data) {
        this._introData = data;
    };

    IntroMode.prototype._onPressClose = function () {
        this.hide();
    };

    IntroMode.prototype._onStartShow = function () {
        var issue;
        var i;

        for (i = 0; i < this._canvas.issues.length; i ++) {
            issue = this._canvas.issues[i];
            issue.elm.interactive = false;
        }

        for (i = 0; i < this._canvas.tags.length; i ++) {
            issue = this._canvas.tags[i];
            issue.elm.interactive = false;
        }

        this._canvas.addChild(this._introContainer);
        gs.TweenMax.to(this._circle.elm, 0.4, {alpha: 1, overwrite: true});
        gs.TweenMax.to(this._message, 0.4, {alpha: 1, overwrite: true, delay: 2.5});
        gs.TweenMax.to(this._internet, 0.4, {alpha: 1, overwrite: true});

        setTimeout(this._onShow.bind(this), 500);
    };

    IntroMode.prototype._onStartHide = function () {
        var issue;
        var i;

        for (i = 0; i < this._canvas.issues.length; i ++) {
            issue = this._canvas.issues[i];
            issue.elm.interactive = true;
        }

        for (i = 0; i < this._canvas.tags.length; i ++) {
            issue = this._canvas.tags[i];
            issue.elm.interactive = true;
        }

        this._circle.elm.alpha = 0;
        gs.TweenMax.to(this._message, 0.2, {alpha: 0, overwrite: true});
        gs.TweenMax.to(this._internet, 0.2, {alpha: 0, overwrite: true});

        setTimeout(function () {
            this._canvas.removeChild(this._introContainer);
        }.bind(this), 200);

        setTimeout(this._onHide.bind(this), 100);
    };

    return IntroMode;
});
