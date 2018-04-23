pragma solidity ^0.4.21;

import './ownership/Ownable.sol';

//School registry
contract SchoolRegistry is Ownable {

    struct School { 
      string name;
      string website;
    }

    mapping(address => School) public schools;

    event SchoolInfoUpdated(address _school, string _newName, string _newWebsite);
  
    /**
     * @dev Allows the owner to edit a school
     * @param _schoolAddress The address to be edited.
     * @param _schoolName The name to be edited.
     * @param _schoolWebsite The website to be edited.
     */
    function editSchool(address _schoolAddress, string _schoolName, string _schoolWebsite) public onlyOwner {
       schools[_schoolAddress] = School(_schoolName, _schoolWebsite);
       SchoolInfoUpdated(_schoolAddress, _schoolName, _schoolWebsite);
    }

    /**
     * @dev Return school information
     * @param _schoolAddress The address to retrieve information for.
     */
     function getSchoolInfo(address _schoolAddress) public view returns (string _name, string _website) {
         return (schools[_schoolAddress].name , schools[_schoolAddress].website);
     }
    
}