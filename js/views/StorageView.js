'use strict';

const
	ko = require('knockout'),

	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),

	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),

	CFolderView = require('modules/%ModuleName%/js/views/CFolderView.js')
;

function CStorageView()
{
	this.type = 'shared';
	this.displayName = ko.observable('shared');
	this.ownersData = ko.observableArray([]);
	this.currentPath = ko.observable('');
}

CStorageView.prototype.ViewTemplate = '%ModuleName%_StorageView';

CStorageView.prototype.onShow = function () {
	const parameters = {
		Type: this.type,
		Path: '',
		Pattern: '',
		PathRequired: false
	};

	Ajax.send('%ModuleName%', 'GetFiles', parameters, (response) => {
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
				ownerData.folders.push(new CFolderView(folderData));
			} else {
				ownerData.hasFiles = true;
			}
		});

		this.ownersData(ownersData);
	});
};

CStorageView.prototype.onRoute = function (params) {
//	const { Name, Path, PathParts, Search, Storage } = params
	this.currentPath(params.Path);
};

module.exports = new CStorageView();
