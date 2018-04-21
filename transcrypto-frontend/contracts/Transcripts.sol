pragma solidity ^0.4.21;

contract Transcripts {
    
    mapping (address => bytes32[]) studentTranscripts;

    /**
     * @dev Associate a hash entry with the student address
     * @param _studentAddress The student address
     * @param _studentTranscript IPFS Hash
     */
    function record(address _studentAddress, bytes32 _studentTranscript) public returns (bytes32) {
        studentTranscripts[_studentAddress].push(_studentTranscript);
    }
    
    /**
     * @dev Get a array of hash associated with the student address
     * @param _studentAddress The student address
     * @return Array of IPFS hashes
     */
    function getTranscripts(address _studentAddress) public view returns (bytes32[]) {
        return studentTranscripts[_studentAddress];
    }
}