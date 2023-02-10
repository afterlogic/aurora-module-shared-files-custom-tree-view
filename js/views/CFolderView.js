'use strict';

const
	ko = require('knockout'),

	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js')
;

/**
 * @constructor
 * @param {object} folderData
 */
function CFolderView(folderData)
{
	this.type = Types.pString(folderData.Type);
	this.fullPath = Types.pString(folderData.FullPath);
	this.name = Types.pString(folderData.Name);

	this.expanded = ko.observable(false);
}

CFolderView.prototype.toggleExpanded = function (view, e) {
	e.stopPropagation();
	this.expanded(!this.expanded());
};

module.exports = CFolderView;
