'use strict';

const
	ko = require('knockout'),

	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),

	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	App = require('%PathToCoreWebclientModule%/js/App.js'),

	CFolderView = require('modules/%ModuleName%/js/views/CFolderView.js')
;

function CStorageView()
{
	this.type = 'shared';
	this.displayName = ko.observable('shared');
	this.ownersData = ko.observableArray([]);
	this.currentPath = ko.observable('');
	
//	App.subscribeEvent('ReceiveAjaxResponse::after', (oParams) => {
//		const requestParams = oParams.Request.Parameters;
//		if ((oParams.Request.Module === 'Files' || oParams.Request.Module === 'SharedFilesCustomTreeView') &&
//				oParams.Request.Method === 'GetFiles' &&
//				requestParams.Type === this.type
//		) {
//			if (requestParams.Path === '' && requestParams.Pattern === '') {
//				this.parseRootSharedResponse(oParams.Response);
//			}
//		}
//	});
}

CStorageView.prototype.ViewTemplate = '%ModuleName%_StorageView';

CStorageView.prototype.findFolderView = function (owner, fullPath) {
	const ownerData = this.ownersData()
			.find(ownerData => ownerData.owner === owner);
	return ownerData && ownerData.folders
			.find(folderView => folderView.fullPath() === fullPath);
};

CStorageView.prototype.parseGetFilesResponse = function (response) {
	const rawItems = Types.pArray(response && response.Result && response.Result.Items);
	const ownersData = [];

	rawItems.forEach(folderData => {
		let ownerData = ownersData.find(data => data.owner === folderData.Owner);
		if (!ownerData) {
			ownerData = {
				owner: folderData.Owner,
				folders: [],
				hasFiles: false
			};
			ownersData.push(ownerData);
		}
		if (folderData.IsFolder) {
			const folderView = this.findFolderView(folderData.Owner, folderData.FullPath);
			if (folderView) {
				folderView.parse(folderData);
				ownerData.folders.push(folderView);
			} else {
				ownerData.folders.push(new CFolderView(folderData, 1, CFolderView));
			}
		} else {
			ownerData.hasFiles = true;
		}
	});

	this.ownersData(ownersData);
};

CStorageView.prototype.onShow = function () {
	const parameters = {
		Type: this.type,
		Path: '',
		Pattern: '',
		PathRequired: false
	};
	Ajax.send('%ModuleName%', 'GetFiles', parameters, this.parseGetFilesResponse, this);
};

CStorageView.prototype.onRoute = function (params) {
//	const { Name, Path, PathParts, Search, Storage } = params
	this.currentPath(params.Path);
};

module.exports = new CStorageView();
