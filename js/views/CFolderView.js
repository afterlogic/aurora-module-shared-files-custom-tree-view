'use strict';

const
	ko = require('knockout'),

	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),

	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js')
;

let CSubfolderView = null;

/**
 * @constructor
 * @param {object} folderData
 * @param {number} level
 * @param {constructor} folderViewConstructor
 */
function CFolderView(folderData, level, folderViewConstructor)
{
	CSubfolderView = folderViewConstructor;
//	const { Actions, Content, ContentType, ETag, ExtendedProps, FullPath, GroupId, Hash, Id,
//		Initiator, IsExternal, IsFolder, IsLink, LastModified, LinkType, LinkUrl, Name, OembedHtml,
//		Owner, Path, Published, Shared, Size, Type } = folderData;

	this.level = level;
	this.type = ko.observable('');
	this.fullPath = ko.observable('');
	this.name = ko.observable('');
	this.parse(folderData);

	this.subfolders = ko.observableArray([]);
	this.expanded = ko.observable(false);
	this.explicitlyNoSubfolders = ko.observable(false);
}

CFolderView.prototype.ViewTemplate = '%ModuleName%_FolderView';

CFolderView.prototype.parse = function (folderData) {
	this.type(Types.pString(folderData.Type));
	this.fullPath(Types.pString(folderData.FullPath));
	this.name(Types.pString(folderData.Name));
};

CFolderView.prototype.parseGetFilesResponse = function (response) {
	if (!CSubfolderView) {
		return;
	}

	const rawItems = Types.pArray(response && response.Result && response.Result.Items);
	const subfolders = [];

	rawItems.forEach(folderData => {
		if (folderData.IsFolder) {
			const folderView = this.subfolders().find(folderView => folderView.fullPath() === folderData.FullPath);
			if (folderView) {
				folderView.parse(folderData);
				folderView.explicitlyNoSubfolders(false);
				subfolders.push(folderView);
			} else {
				subfolders.push(new CSubfolderView(folderData, this.level + 1, CSubfolderView));
			}
		}
	});
	
	this.explicitlyNoSubfolders(subfolders.length === 0 ? true : false);
	if (subfolders.length === 0) {
		this.expanded(false);
	}

	this.subfolders(subfolders);
};

CFolderView.prototype.toggleExpanded = function (view, e) {
	e.stopPropagation();
	this.expanded(!this.expanded());
	if (this.expanded()) {
		const parameters = {
			Type: this.type(),
			Path: this.fullPath(),
			Pattern: '',
			PathRequired: false
		};
		Ajax.send('%ModuleName%', 'GetFiles', parameters, this.parseGetFilesResponse, this);
	}
};

module.exports = CFolderView;
