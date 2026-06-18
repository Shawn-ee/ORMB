// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract ORMBToken is ERC20, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant WHITELIST_ADMIN_ROLE = keccak256("WHITELIST_ADMIN_ROLE");

    mapping(address wallet => bool whitelisted) private _whitelisted;

    event WalletWhitelistUpdated(address indexed wallet, bool whitelisted, address indexed admin);

    constructor(address admin) ERC20("Offshore RMB Token", "ORMB") {
        require(admin != address(0), "ORMB: admin is zero address");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(WHITELIST_ADMIN_ROLE, admin);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function isWhitelisted(address wallet) external view returns (bool) {
        return _whitelisted[wallet];
    }

    function setWhitelisted(address wallet, bool whitelisted) external onlyRole(WHITELIST_ADMIN_ROLE) {
        require(wallet != address(0), "ORMB: wallet is zero address");

        _whitelisted[wallet] = whitelisted;
        emit WalletWhitelistUpdated(wallet, whitelisted, msg.sender);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(_whitelisted[to], "ORMB: mint to non-whitelisted wallet");

        _mint(to, amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        if (from == address(0)) {
            require(_whitelisted[to], "ORMB: mint to non-whitelisted wallet");
        } else if (to != address(0)) {
            require(_whitelisted[from] && _whitelisted[to], "ORMB: transfer requires whitelisted wallets");
        }

        super._update(from, to, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
