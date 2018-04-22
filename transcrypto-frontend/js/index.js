web3Provider = null;
contracts = {};
let transcriptSigned;
let ipfsHashParsed;
let ipfsHashFromSmartContrat;
let sig;

function init () {  
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
        web3Provider = web3.currentProvider;
    } else {
        // If no injected web3 instance is detected, fall back to Ganache
        web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(web3Provider);

    return initContracts();
};

function initContracts() {
    $.getJSON('build/contracts/SchoolRegistry.json', function(data) {
        var SchoolRegistryArtifact = data;
        var SchoolRegistryContract = TruffleContract(SchoolRegistryArtifact);
        
        SchoolRegistryContract.setProvider(web3Provider); 
         
        console.log("SchoolRegistryContract:")
        console.log(SchoolRegistryContract)

        contracts.SchoolRegistry = SchoolRegistryContract.deployed();
    });
    $.getJSON('build/contracts/Transcripts.json', function (data) {
        var TranscriptsArtifact = data;
        var TranscriptsContract = TruffleContract(TranscriptsArtifact);

        TranscriptsContract.setProvider(web3Provider);

        console.log("TranscriptsContract:")
        console.log(TranscriptsContract)

        contracts.Transcripts = TranscriptsContract.deployed();
        return setWorkflow();    
    });   
};

function setWorkflow() {    
    console.log("initiating sequence...");

    let schoolAddress = web3.eth.accounts[0];
    let schoolRegistryContractAddress = "0xa48cb2e08db0de8a00935cc6686301e6a21a30c3"; // Get every time after deploying it
    let schoolName = "UofT";
    let schoolWebsite = "https://www.utoronto.ca/";
    let owner = web3.eth.accounts[0];
    let account = web3.eth.accounts[0];
    
    // Set SchoolRegistry contract address by the owner.
    setSchoolRegistry(schoolRegistryContractAddress, owner, () => {        
        // Register School with address and other data by the owner.
        editSchool(schoolAddress, schoolName, schoolWebsite, owner, () => {
            // 1. University signs a document for a given student (uni will sign the hash of the document basically)
            // 2. Someone adds the university's signature at the bottom of the document. 
            signTranscript(schoolAddress, () => {
                // 3. Student encrypts the whole document with a secondary key (using their 2nd private key). --> api
                // 4. Student (or uni) adds document on IPFS.  --> api 
                encryptAndSendTranscriptSignedToIpfs(transcriptSigned, () => {
                    //  5. Student (or uni) stores on the smart contract the IPFS hash for the student.
                    //recordTranscript(account);
                    recordTranscript(account, () => {
                        // 6. Student gives their public key to company X that want to decrypt the student's transcripts. --> front-end
                        // 7. Company X queries the blockchain to retrieve all the student's documents IPFS hash. --> front-end
                        getTranscripts(account, () => {
                            // 8. Company X goes to each IPFS hash and decrypt the document. --> api
                            // TODO: Get dynamic array of indexes
                            // let ipfsPath = ipfsHashFromSmartContrat[ipfsHashFromSmartContrat.length-1];
                            retrieveTranscriptSigned(ipfsHashParsed, () => {
                                // 9. Company X validates that each document was indeed signed by the right university / institution.
                                getSignerSchoolRegistryInfo(ipfsHashParsed, sig);
                            });
                        });
                    });
                });
            });
        });
    });
    
    // 10. Print and read over the transcript --> front-end
}

/**
 * Set SchoolRegistry contract address by the owner.
 * @param {string} schoolRegistryContractAddress Contract Address
 * @param {string} owner Owner of the contract address
 * @returns {string} tx
 */
function setSchoolRegistry(schoolRegistryContractAddress, owner, callback = undefined) {
    console.log('function setSchoolRegistry() schoolRegistryContractAddress: ' + schoolRegistryContractAddress + "owner: " + owner);  
    contracts.Transcripts
    .then(function(instance) {
        transcripts = instance;
        let result = transcripts.setSchoolRegistry.sendTransaction(schoolRegistryContractAddress, {from : owner});
        if(callback !== undefined)
            callback();

        return result;
    })
}

/**
 * Register School with address and other data by the owner.
 * @param {string} schoolAddress School Address
 * @param {string} schoolName School Name
 * @param {string} schoolWebsite School Website
 * @param {string} owner Owner of the contract
 * @returns {string} tx
 */
function editSchool(schoolAddress, schoolName, schoolWebsite, owner, callback = undefined) {  
    console.log('function editSchool() schoolAddress: ' + schoolAddress + 'schoolName: ' + schoolName + 'schoolWebsite: ' + schoolWebsite + "owner: " + owner);  
    contracts.SchoolRegistry
    .then(function(instance) {
        registry = instance;
        let result = registry.editSchool.sendTransaction(schoolAddress, schoolName, schoolWebsite, {from: owner});
        if(callback !== undefined)
            callback();

        return result;
    })
}

/**
 * 1. University signs a document for a given student (uni will sign the hash of the document basically)
 * 2. Someone adds the university's signature at the bottom of the document. 
 * @param {string} schoolAddress School Address
 * @returns {string} transcriptSigned
 */
function signTranscript(schoolAddress, callback = undefined) {
    console.log('function signTranscript() schoolAddress: ' + schoolAddress);
    // Load document
    $.getJSON('../transcript.json', function(data) {
        var document = JSON.stringify(data);
        console.log('Transcript File: ' + document);
        var documentHash = web3.sha3(document, {encoding: 'hex'});
        console.log('Transcript Sha3: ' + documentHash);
        
        var signatureFromUni = web3.personal.sign(documentHash, schoolAddress, function(error, result){
            if(!error){
                data.Signature = result;
                sig = result;
                transcriptSigned = JSON.stringify(data);
                console.log("transcriptSigned: " + transcriptSigned);
                if(callback !== undefined)
                    callback();
                return transcriptSigned;
            }
            else
                console.error(error);
        });
    }); 
};

/**
 *  3. Student encrypts the whole document with a secondary key (using their 2nd private key). --> api (done)
 *  4. Student (or uni) adds document on IPFS.  --> api (done)
 * @param {string} transcriptSigned Transcript with school signature
 * @returns {string} transcriptSigned
 */
function encryptAndSendTranscriptSignedToIpfs(transcriptSigned, callback = undefined) {
    console.log('function encryptAndSendTranscriptSignedToIpfs() transcriptSigned: ' + transcriptSigned);
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:5000/trancripts",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Postman-Token": "d9ee0c70-f92d-0b14-7fe1-be7a37e9e2f4"
        },
        "processData": false,
        "data": transcriptSigned
    }

    $.ajax(settings).done(function (response) {
        ipfsHashParsed = response;
        console.log("ipfsHashParsed: " + response);
        if(callback !== undefined)
            callback();
    });    
}

/**
 *  5. Student (or uni) stores on the smart contract the IPFS hash for the student.
 * @param {string} account Student account address
 * @returns {string[]} ipfsHashFromSmartContrat
 */
function recordTranscript(account, callback = undefined) {
    console.log('function recordTranscript() Account: ' + account);
    
    contracts.Transcripts
    .then(function(instance) {
        transcript = instance;
        console.log("showing how the ipfs hash is before storing..." + ipfsHashParsed);
        return transcript.record.sendTransaction(account, ipfsHashParsed, {from: account});
    })
    .then(function (result) {
        console.log("Successfully added hash to the solidity contract!");
        console.log("tx:" + result);
    })
    .then(function() {
        return transcript.getTranscripts.call(account, {from: account});
    })
    .then(function (result) {
        console.log( "Hash array retrieved from the smart contract. Right after putting in.");
        console.log(result);
        ipfsHashFromSmartContrat = null;
        ipfsHashFromSmartContrat = result;
    })
    .catch(function(error) {
        console.log( "Error trying to retrive the hash arrays from the smart contract: " + error.toString());
    });
    if(callback !== undefined)
        callback();
};

/**
 *  6. Student gives their public key to company X that want to decrypt the student's transcripts. --> front-end
 *  7. Company X queries the blockchain to retrieve all the student's documents IPFS hash. --> front-end
 * @param {string} account Account requesting transcripts
 * @returns {string[]} Ipfs Hash Path Array
 */
function getTranscripts(account, callback = undefined) {
    console.log('function getTranscripts() Account: ' + account);
    
    contracts.Transcripts
    .then(function(instance) {
        transcript = instance;
        return transcript.getTranscripts.call(account, {from: account});
    })
    .then (function (result) {
        console.log("Hash array retrieved from the smart contract.");
        console.log(result);
        return result;
    })
    .catch(function(error) {
        console.log( "Error trying to retrive the hash arrays from the smart contract: " + error.toString());
    });
    
    if(callback !== undefined)
        callback();
}
 
/**
 * 8. Company X goes to each IPFS hash and decrypt the document.
 * @param {string} ipfsPath Transcript IPFS Hash Path - hex format
 * @returns {string} decryptedTranscript
 */
function retrieveTranscriptSigned(ipfsPath, callback = undefined) {
    console.log("function retrieveTranscriptSigned() ipfsPath: " + ipfsPath);
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:5000/trancripts/"+ ipfsPath,
        "method": "GET",
        "headers": {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Postman-Token": "d9ee0c70-f92d-0b14-7fe1-be7a37e9e2f4"
        },
        "processData": false
    }
    $.ajax(settings).done(function (response) {
        let decryptedTranscript = response;
        console.log("Received transcript decrypted: " + response);
        
        if(callback !== undefined)
            callback(); 
        return decryptedTranscript;
    });    
}

/**
 * 9. Company X validates that each document was indeed signed by the right university / institution.
 * @param {string} transcriptHash Transcript IPFS Hash hex format
 * @param {string} sig Signature sent to validate
 * @returns {string} Return (0x0, 0x0) if signature is from unknown signer or if signature is invalid for the given hash 
 */
function getSignerSchoolRegistryInfo(transcriptHash, sig) {
    console.log("function getSignerSchoolRegistryInfo() transcriptHash: " + transcriptHash + " sig: " + sig);
    contracts.Transcripts
    .then(function(instance) {
        transcripts = instance;
        return transcripts.getSignerSchoolRegistryInfo.sendTransaction(transcriptHash, sig);
    })
	.then(function(result) {
        console.log(" result ");
        for(let i = 0; i < result.length; i++) 
            console.log(" " + result[i]);
        //TODO
	})
}

// 10. Print and read over the transcript --> front-end

window.addEventListener('load', function() {
    init();
});