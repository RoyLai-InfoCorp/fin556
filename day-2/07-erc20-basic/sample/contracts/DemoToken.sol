// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract DemoToken {
    uint256 _totalSupply;
    mapping(address => uint256) _balances;
    mapping(address => mapping(address => uint256)) _allowance;
    // ERC20 Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    // ERC20 Read-only functions

    function name() public view returns (string memory) {
        return "DemoToken";
    }
    function symbol() public view returns (string memory) {
        return "DEMO";
    }
    function decimals() public pure returns (uint8) {
        return 18;
    }
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return _balances[_owner];
    }
    function allowance(
        address _owner,
        address _spender
    ) public view returns (uint256 remaining) {
        return _allowance[_owner][_spender];
    }

    // ERC20 Constructor

    constructor(uint256 totalSupply_, address owner_) {
        _totalSupply = totalSupply_;
        _balances[owner_] = totalSupply_;
    }

    // transfer: Send _value to _to from caller's account

    function transfer(
        address _to,
        uint256 _value
    ) external virtual returns (bool success) {
        require(_balances[msg.sender] >= _value, "Insufficient balance");
        _balances[msg.sender] -= _value;
        _balances[_to] += _value;

        // Emit Transfer event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    // transferFrom: Withdraw _value from _from to _to based on approved allowance

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external virtual returns (bool success) {
        require(_balances[_from] >= _value, "Insufficient balance");
        require(
            _allowance[_from][msg.sender] >= _value,
            "Insufficient allowance"
        );
        _balances[_from] -= _value;
        _balances[_to] += _value;
        _allowance[_from][msg.sender] -= _value;

        // Emit Transfer event
        emit Transfer(_from, _to, _value);

        return true;
    }

    // approve: Set allowance for _spender to withdraw from caller's account

    function approve(
        address _spender,
        uint256 _value
    ) external virtual returns (bool success) {
        _allowance[msg.sender][_spender] = _value;

        // Emit Approval event
        emit Approval(msg.sender, _spender, _value);

        return true;
    }
}
