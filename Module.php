<?php
/**
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\SharedFilesCustomTreeView;

/**
 * Displays a custom tree view of shared folders/files in the storage list
 *
 * @license https://www.gnu.org/licenses/agpl-3.0.html AGPL-3.0
 * @license https://afterlogic.com/products/common-licensing Afterlogic Software License
 * @copyright Copyright (c) 2023, Afterlogic Corp.
 *
 * @package Modules
 */
class Module extends \Aurora\System\Module\AbstractWebclientModule
{
    /***** public functions might be called with web API *****/
    /**
     * Obtains list of module settings for authenticated user.
     *
     * @return array
     */
    public function GetSettings()
    {
        \Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::Anonymous);

        return [
            'DisplayOwnerSourcePath' => $this->getConfig('DisplayOwnerSourcePath', '')
        ];
    }

    public function GetFiles($UserId, $Type, $Path, $Pattern, $Shared = false)
    {
        return \Aurora\Modules\Files\Module::Decorator()->GetFiles($UserId, $Type, $Path, $Pattern, $Shared);
    }
    /***** public functions might be called with web API *****/
}
