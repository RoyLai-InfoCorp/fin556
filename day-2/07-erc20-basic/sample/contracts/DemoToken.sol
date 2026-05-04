// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract DemoToken {
    uint256 _totalSupply;

    mapping(address => uint256) _balances;

    mapping(address => mapping(address => uint256)) _allowances;

    // ERC20 events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ERC20 read-only functions

    function name() public pure returns (string memory) {
        return "DemoToken";
    }

    function symbol() public pure returns (string memory) {
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
        return _allowances[_owner][_spender];
    }

    // ERC20 constructor

    constructor(uint256 totalSupply_, address owner_) {
        _totalSupply = totalSupply_;
        _balances[owner_] = totalSupply_;
    }

    // transfer: send _value from caller to _to

    function transfer(
        address _to,
        uint256 _value
    ) external virtual returns (bool success) {
        require(_balances[msg.sender] >= _value, "Insufficient balance");

        _balances[msg.sender] -= _value;
        _balances[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    // transferFrom: spend _value from _from to _to using allowance

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external virtual returns (bool success) {
        require(_balances[_from] >= _value, "Insufficient balance");
        require(
            _allowances[_from][msg.sender] >= _value,
            "Insufficient allowance"
        );

        _balances[_from] -= _value;
        _balances[_to] += _value;
        _allowances[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }

    // approve: set allowance for _spender

    function approve(
        address _spender,
        uint256 _value
    ) external virtual returns (bool success) {
        _allowances[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }
}