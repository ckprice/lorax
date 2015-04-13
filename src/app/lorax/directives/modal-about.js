/**
 * @fileOverview About Modal directive
 * @author <a href="mailto:owen@work.co">Owen Herterich</a>
 * @author <a href="mailto:chris@work.co">Chris James</a>
 */
define(function () {
    'use strict';

    /**
     * About Modal directive
     */
    var ModalAboutDirective = function () {
        return {
            restrict: 'A',
            replace: true,
            scope: true,
            controller: ModalAboutController,
            templateUrl: '/app/lorax/directives/modal-about.tpl.html'
        };
    };

    /**
    * Controller for About Modal directive
    * @constructor
    */
    var ModalAboutController = function (
        $scope,
        dataService,
        experienceService,
        windowService
    ) {
        this._$scope = $scope;
        this._dataService = dataService;
        this._experienceService = experienceService;
        this._windowService = windowService;

        $scope.modalLegend = {};
        $scope.modalAbout = {
            open: false,
            closeModal: this.closeModal.bind(this)
        };

        // only set the about modal to open if the current view
        // is the ecosystem view.
        if (this._experienceService._view === 'ecosystem') {
            $scope.modalAbout.open = true;
        }

        // listen for $broadcast of 'openAboutModal'
        $scope.$on('openAboutModal', this.openModal.bind(this));

        this._dataService.getMain().then(function (model) {
            this._$scope.modalAbout.content = model.getModals().about;
            this._$scope.modalLegend.content = model.getModals().legend;
        }.bind(this));
    };

    /**
    * Array of dependencies to be injected into controller
    * @type {Array}
    */
    ModalAboutController.$inject = [
        '$scope',
        'dataService',
        'experienceService',
        'windowService'
    ];

    ModalAboutController.prototype.openModal = function () {
        this._$scope.modalAbout.open = true;
        this._windowService.setSidePanelOpen(true, 'about');
        this._windowService.publish('onOpenModal', [true]);
    };

    ModalAboutController.prototype.closeModal = function () {
        this._$scope.modalAbout.open = false;
        this._windowService.setSidePanelOpen(false, 'about');
        this._windowService.publish('onOpenModal', [false]);
    };

    return ModalAboutDirective;
});
