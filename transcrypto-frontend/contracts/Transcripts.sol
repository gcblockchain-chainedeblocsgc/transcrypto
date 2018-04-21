pragma solidity ^0.4.21;

import './ownership/Ownable.sol';
import './SchoolRegistry.sol';

//Transcripts
contract Transcripts is Ownable {
    
    SchoolRegistry public schoolRegistry;
    mapping (address => bytes32[]) studentTranscripts;
    
    event TranscriptAdded(address _student, bytes32 _transcriptHash);
    event SchoolRegistryUpdated(address _oldSchoolRegistry, address _newSchoolRegistry);

    /**
     * @dev Associate a hash entry with the student address
     * @param _studentAddress The student address
     * @param _studentTranscriptHash IPFS Hash
     */
    function record(address _studentAddress, bytes32 _studentTranscriptHash) public {
        studentTranscripts[_studentAddress].push(_studentTranscriptHash);
        
        emit TranscriptAdded(_studentAddress, _studentTranscriptHash);
    }
    
    /**
     * @dev Get a array of hash associated with the student address
     * @param _studentAddress The student address
     * @return Array of IPFS hashes
     */
    function getTranscripts(address _studentAddress) public view returns (bytes32[]) {
        return studentTranscripts[_studentAddress];
    }
    
    /**
     * @dev Set schoolRegistry address
     * @param _schoolRegistry The school registry address
     */
    function setSchoolRegistry(SchoolRegistry _schoolRegistry) onlyOwner public {
        require(address(_schoolRegistry) != 0x0);
        emit SchoolRegistryUpdated(schoolRegistry, _schoolRegistry);
         
        //Update school registry 
        schoolRegistry = _schoolRegistry;
     }
     
     
    /**
     * @dev Return who signed the provided signature
     * @param _hash hash that was signed
     * @param _sig Signature
     */
     function getSignatureSigner(bytes32 _hash, bytes _sig) public view returns (address signer) {
        
        //ECDSA variables
        bytes32 r;
        bytes32 s;
        uint8 v;
    
        //Extract ECDSA signature variables from `sig`
        assembly {
          r := mload(add(_sig, 32))
          s := mload(add(_sig, 64))
          v := byte(0, mload(add(_sig, 96)))
        }
    
        // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
        if (v < 27) {
          v += 27;
        }
        
        //Adding prefix to hash to confirm to geth signature scheme
        bytes32 prefixedHash = keccak256("\x19Ethereum Signed Message:\n32", _hash);
    
        //Recover signer's address
        signer = ecrecover( prefixedHash, v, r, s);
    
        //Check if signer is expected school
        return signer;
     }

    /**
     * @dev Verify if a document was signed by a given school
     * @param _ipfsHash Transcript IPFS hash
     * @param _schoolAddress Address of expected school that signed Transcript
     * @param _sig Signature
     */
     function isValidSignature(address _schoolAddress, bytes32 _ipfsHash, bytes _sig) public view returns (bool) {
        return (getSignatureSigner(_ipfsHash, _sig) == _schoolAddress);
     }
     
    /**
     * @dev Return the school information from the school that signed the transcript's hash
     * @param _ipfsHash Transcript IPFS hash
     * @param _sig Signature
     */
     function getSignerSchoolRegistryInfo(bytes32 _ipfsHash, bytes _sig) public view returns (string schoolName, string schoolWebsite) {
        address signer = getSignatureSigner(_ipfsHash, _sig);
        (schoolName, schoolWebsite) = schoolRegistry.getSchoolInfo(signer);
        return (schoolName, schoolWebsite);
     }
}