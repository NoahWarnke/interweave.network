pragma solidity ^0.4.25;

/// @title A very simple contract that can set one ipfs hash (a string) for each Eth address.
/// @author interweaver
contract SetHash {
    
    /// @notice The mapping that goes from addresses to hashes (strings). 
    mapping(address => string) private hashOf;
    
    /// @notice An event that fires when a hash is changed.
    /// @param owner The address whose hash changed. Indexable.
    /// @param newHash The new value of the hash (there may or may not have been an old one.)
    event HashChanged(address indexed owner, string newHash);
    
    /// @notice A function that allows a user to set the ipfs hash associated with their address.
    /// @param _hash The new value of the hash. Must be 46 characters long.
    function setHash(string _hash) public {
        
        // Enforce byte-length to be 46 
        require(bytes(_hash).length == 46, "IPFS hashes must be 46 characters long.");
        
        // Save the hash.
        hashOf[msg.sender] = _hash;
        
        // Notify any watchers.
        emit HashChanged(msg.sender, _hash);
    }
    
    /// @notice A function that allows anyone to look up the hash for any address.
    /// @param _owner The address to look up.
    /// @return The hash (a string), or the empty string if it was never set.
    function getHash(address _owner) public view returns (string) {
        return hashOf[_owner];
    }
}
