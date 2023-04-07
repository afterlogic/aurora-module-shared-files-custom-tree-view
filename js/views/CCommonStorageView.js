'use strict';

const
	ko = require('knockout')
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
}

CCommonStorageView.prototype.ViewTemplate = '%ModuleName%_CommonStorageView';

module.exports = CCommonStorageView;
