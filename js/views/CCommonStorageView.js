'use strict';

const
	ko = require('knockout'),

	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),

	FoldersUtils = require('modules/%ModuleName%/js/utils/Folders.js'),

	CFolderView = require('modules/%ModuleName%/js/views/CFolderView.js')
;

function CCommonStorageView(storage, filesView)
{
	this.filesView = filesView;
	this.isExternal = !!storage.IsExternal;
	this.type = storage.Type;
	this.displayName = storage.DisplayName,
	this.droppable = ko.computed(() => {
		return storage.IsDroppable && this.filesView() && this.filesView().isCurrentStorageDroppable();
	});
	this.folders = ko.observableArray([]);
	this.currentPath = ko.observable('');
	this.currentPath.subscribe(function (currentPath) {
		if (currentPath) {
			const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
			const parentFolderView = FoldersUtils.findDeepFolderView(this.folders(), parentPath);
			if (parentFolderView) {
				parentFolderView.toggleExpanded(true);
			}
		}
	}, this);
}

CCommonStorageView.prototype.ViewTemplate = '%ModuleName%_CommonStorageView';

CCommonStorageView.prototype.parseFilesResponse = function (params) {
	if (params.Request.Parameters.Pattern !== '') {
		return;
	}

	const result = params.Response && params.Response.Result;
	const rawItems = Types.pArray(result && result.Items);
	const folders = [];

	rawItems.forEach(folderData => {
		if (folderData.IsFolder) {
			const folderView = this.folders().find(folderView => folderView.fullPath() === folderData.FullPath);
			if (folderView) {
				folderView.parse(folderData);
				folders.push(folderView);
			} else {
				folders.push(new CFolderView(folderData, 1, CFolderView));
			}
		}
	});

	this.folders(folders);
};

CCommonStorageView.prototype.onRoute = function (params) {
	//	const { Name, Path, PathParts, Search, Storage, Custom } = params
	if (params.Storage === this.type) {
		this.currentPath(params.Path);
	} else {
		this.currentPath('');
	}
};

module.exports = CCommonStorageView;
