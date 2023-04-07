'use strict';

const
	ko = require('knockout'),

	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),

	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	Routing = require('%PathToCoreWebclientModule%/js/Routing.js'),

	LinksUtils = require('modules/FilesWebclient/js/utils/Links.js'),

	CFolderView = require('modules/%ModuleName%/js/views/CFolderView.js'),

	SHARED_OWNER_PREFIX = 'sharedOwner.'
;

function CSharedStorageView()
{
	this.type = 'shared';
	this.ownersData = ko.observableArray([]);
	this.currentOwner = ko.observable('');
	this.currentPath = ko.observable('');
	this.currentPath.subscribe(function (currentPath) {
		if (currentPath) {
			const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
			let parentFolderView;
			this.ownersData().forEach((ownerData) => {
				if (!parentFolderView) {
					parentFolderView = this.findDeepFolderView(ownerData.folders, parentPath);
				}
			});
			if (parentFolderView) {
				parentFolderView.toggleExpanded(true);
			}
		}
	}, this);

	this.isFirstRoute = true;

	App.subscribeEvent('ReceiveAjaxResponse::before', (oParams) => {
		const requestParams = oParams.Request.Parameters;
		if ((oParams.Request.Module === 'Files' || oParams.Request.Module === 'SharedFilesCustomTreeView') &&
				oParams.Request.Method === 'GetFiles' &&
				requestParams.Type === this.type
		) {
			if (requestParams.Path === '' && requestParams.Pattern === '') {
				this.parseRootSharedResponse(oParams.Response);
			}
			if (requestParams.Path === '' && this.currentOwner() !== '') {
				const rawItems = Types.pArray(oParams.Response && oParams.Response.Result && oParams.Response.Result.Items);
				if (Array.isArray(rawItems)) {
					oParams.Response.Result.Items = rawItems
							.filter(item => !item.IsFolder && item.Owner === this.currentOwner());
				}
			}
		}
	});
}

CSharedStorageView.prototype.ViewTemplate = '%ModuleName%_SharedStorageView';

CSharedStorageView.prototype.findDeepFolderView = function (folders, path) {
	let foundFolderView;
	foundFolderView = folders.find(folderView => folderView.fullPath() === path);

	if (!foundFolderView) {
		folders.forEach((folderView) => {
			if (!foundFolderView) {
				foundFolderView = this.findDeepFolderView(folderView.subfolders(), path);
			}
		});
	}
	return foundFolderView;
};

CSharedStorageView.prototype.findFolderView = function (owner, fullPath) {
	const ownerData = this.ownersData()
			.find(ownerData => ownerData.owner === owner);
	return ownerData && ownerData.folders
			.find(folderView => folderView.fullPath() === fullPath);
};

CSharedStorageView.prototype.parseRootSharedResponse = function (response) {
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

CSharedStorageView.prototype.onShow = function () {
	const parameters = {
		Type: this.type,
		Path: '',
		Pattern: '',
		PathRequired: false
	};
	Ajax.send('%ModuleName%', 'GetFiles', parameters);
};

CSharedStorageView.prototype.onRoute = function (params) {
	//	const { Name, Path, PathParts, Search, Storage, Custom } = params
	if (params.Storage !== this.type) {
		this.currentPath('');
		this.currentOwner('');
		this.isFirstRoute = false;
		return;
	}

	let owner = '';
	const prefixLength = SHARED_OWNER_PREFIX.length;
	if (params.Custom &&
		params.Custom.length > prefixLength &&
		params.Custom.indexOf(SHARED_OWNER_PREFIX) === 0
	) {
		owner = params.Custom.substr(prefixLength);
	}

	if (this.isFirstRoute && params.Path) {
		const pathParts = params.Path.split('/').filter(part => part);
		const ownerRoutingPart = {};
		if (owner) {
			ownerRoutingPart = { prefix: SHARED_OWNER_PREFIX, value: owner };
		}
		Routing.replaceHash(LinksUtils.getFiles(this.type, `/${pathParts[0]}`, params.Search, ownerRoutingPart));
		this.currentPath('');
		this.currentOwner('');
	} else {
		this.currentPath(params.Path);
		this.currentOwner(owner);
	}
	this.isFirstRoute = false;
};

CSharedStorageView.prototype.routeOwnerFiles = function (owner) {
	Routing.setHash(LinksUtils.getFiles(this.type, '', '', { prefix: SHARED_OWNER_PREFIX, value: owner }));
};

module.exports = new CSharedStorageView();
