module.exports = {
	findDeepFolderView (folders, path) {
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
	}
};