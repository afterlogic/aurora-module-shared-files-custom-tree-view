'use strict';

const
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js')
;

module.exports = {
	DisplayOwnerSourcePath: false,

	/**
	 * Initializes settings from AppData object sections.
	 * 
	 * @param {Object} appData Object contained modules settings.
	 */
	init: function (appData)
	{
		const appDataSection = appData['%ModuleName%'];
		this.DisplayOwnerSourcePath = Types.pBool(appDataSection && appDataSection.DisplayOwnerSourcePath, this.DisplayOwnerSourcePath);
	}
};
