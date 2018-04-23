var SchoolRegistry = artifacts.require("./SchoolRegistry.sol");
var Transcripts = artifacts.require("./Transcripts.sol");

module.exports = function(deployer) {
    deployer.deploy(SchoolRegistry);
    deployer.then( () => {      
        return deployer.deploy(Transcripts);
    });
};
