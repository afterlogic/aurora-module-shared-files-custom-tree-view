'use strict';

module.exports = function (appData) {
	const
		App = require('%PathToCoreWebclientModule%/js/App.js'),
		ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),

		Settings = require('modules/%ModuleName%/js/Settings.js')
	;

	if (!ModulesManager.isModuleAvailable('FilesWebclient')) {
		return null;
	}

	Settings.init(appData);

	if (App.isUserNormalOrTenant()) {
		return {
			start() {
				App.subscribeEvent('FilesWebclient::RegisterFilesController', (registerHandler) => {
					registerHandler(require('modules/%ModuleName%/js/views/StorageView.js'), 'Storage');
				});
			}
		};
	}

	return null;
};
