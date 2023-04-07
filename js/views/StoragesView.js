'use strict';

const
	ko = require('knockout'),

	App = require('%PathToCoreWebclientModule%/js/App.js'),

	CCommonStorageView = require('modules/%ModuleName%/js/views/CCommonStorageView.js'),
	SharedStorageView = require('modules/%ModuleName%/js/views/SharedStorageView.js')
;

function CStoragesView()
{
	this.isShown = ko.observable(false);
	this.filesView = ko.observable(null);
	this.storagesViews = ko.observableArray([]);

	App.subscribeEvent('ReceiveAjaxResponse::before', (oParams) => {
		if (oParams.Request.Module === 'Files' &&
				oParams.Request.Method === 'GetStorages'
		) {
			if (Array.isArray(oParams.Response.Result)) {
				this.storagesViews(oParams.Response.Result.map(storage => {
					if (storage.Type === 'shared') {
						return SharedStorageView;
					}
					return new CCommonStorageView(storage, this.filesView);
				}));
				if (this.isShown()) {
					this.onShow();
				}
				oParams.Response.Result = oParams.Response.Result
						.map(item => ({ ...item, HideInList: true }));
			}
		}
	});
}

CStoragesView.prototype.ViewTemplate = '%ModuleName%_StoragesView';

CStoragesView.prototype.useFilesViewData = function (filesView) {
	this.filesView(filesView);
};

CStoragesView.prototype.onShow = function () {
	this.storagesViews().forEach(storageView => {
		if (typeof storageView.onShow === 'function') {
			storageView.onShow();
		}
	});
	this.isShown(true);
};

CStoragesView.prototype.onRoute = function (params) {
	this.storagesViews().forEach(storageView => {
		if (typeof storageView.onRoute === 'function') {
			storageView.onRoute(params);
		}
	});
};

CStoragesView.prototype.onHide = function () {
	this.storagesViews().forEach(storageView => {
		if (typeof storageView.onHide === 'function') {
			storageView.onHide();
		}
	});
	this.isShown(false);
};

module.exports = new CStoragesView();
