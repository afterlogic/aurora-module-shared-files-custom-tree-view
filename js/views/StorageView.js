'use strict';

const
	ko = require('knockout'),

	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),

	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	Routing = require('%PathToCoreWebclientModule%/js/Routing.js'),

	LinksUtils = require('modules/FilesWebclient/js/utils/Links.js'),

	CFolderView = require('modules/%ModuleName%/js/views/CFolderView.js')
;

function CStorageView()
{
	this.type = 'shared';
	this.ownersData = ko.observableArray([]);
	this.currentOwner = ko.observable('');
	this.currentPath = ko.observable('');

	App.subscribeEvent('ReceiveAjaxResponse::before', (oParams) => {
		const requestParams = oParams.Request.Parameters;
		if ((oParams.Request.Module === 'Files' || oParams.Request.Module === 'SharedFilesCustomTreeView') &&
				oParams.Request.Method === 'GetFiles' &&
				requestParams.Type === this.type
		) {
			if (requestParams.Path === '' && requestParams.Pattern === '') {
				this.parseRootSharedResponse(oParams.Response);
			}
			if (this.currentOwner() !== '') {
				const rawItems = Types.pArray(oParams.Response && oParams.Response.Result && oParams.Response.Result.Items);
				if (Array.isArray(rawItems)) {
					oParams.Response.Result.Items = rawItems
							.filter(item => !item.IsFolder && item.Owner === this.currentOwner());
				}
			}
		}
		if (oParams.Request.Module === 'Files' &&
				oParams.Request.Method === 'GetStorages'
		) {
			if (Array.isArray(oParams.Response.Result)) {
				oParams.Response.Result = oParams.Response.Result
						.map(item => ({ ...item, HideInList: item.Type === this.type }));
			}
		}
	});
}

CStorageView.prototype.ViewTemplate = '%ModuleName%_StorageView';

CStorageView.prototype.findFolderView = function (owner, fullPath) {
	const ownerData = this.ownersData()
			.find(ownerData => ownerData.owner === owner);
	return ownerData && ownerData.folders
			.find(folderView => folderView.fullPath() === fullPath);
};

CStorageView.prototype.parseRootSharedResponse = function (response) {
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
	Ajax.send('%ModuleName%', 'GetFiles', parameters);
};

CStorageView.prototype.onRoute = function (params) {
//	const { Name, Path, PathParts, Search, Storage, Custom } = params
	this.currentPath(params.Path);
	this.currentOwner(params.Custom ? params.Custom.substr(12) : '');
};

CStorageView.prototype.routeOwnerFiles = function (owner) {
	Routing.setHash(LinksUtils.getFiles(this.type, '', '', { prefix: 'sharedOwner.', value: owner }));
};

module.exports = new CStorageView();
