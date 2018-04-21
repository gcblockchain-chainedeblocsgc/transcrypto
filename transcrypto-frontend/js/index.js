web3Provider = null;
contracts = {};
let transcriptSigned;
let ipfsHashParsed;
let ipfsHashFromSmartContrat;

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

let transcriptsContractInstance;

function initContracts() {
    // $.getJSON('./SchoolRegistry.json', function(data) {
    //     // Get the necessary contract artifact file and instantiate it with truffle-contract
    //     var SchoolRegistry = data;
    //     contracts.SchoolRegistry = TruffleContract(SchoolRegistry);
        
    //     // Set the provider for our contract
    //     contracts.SchoolRegistry.setProvider(web3Provider);  
    // });
    // Get Contract
    $.getJSON('build/contracts/Transcripts.json', function (data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var TranscriptsArtifact = data;
        var TranscriptsContract = TruffleContract(TranscriptsArtifact);

        // Set the provider for our contract
        TranscriptsContract.setProvider(web3Provider);

        console.log("TranscriptsContract:")
        console.log(TranscriptsContract)

        contracts.Transcripts = TranscriptsContract.deployed();
    });   
    
    console.log("sending metamask request to sign...");
    return signTranscript();    
};

// 1. University signs a document for a given student (uni will sign the hash of the document basically)
// 2. Someone adds the university's signature at the bottom of the document. 
function signTranscript() {
    // Load document
    $.getJSON('../transcript.json', function(data) {
        var document = JSON.stringify(data);
        console.log('Transcript File: ' + document);
        var documentHash = web3.sha3(document, {encoding: 'hex'});
        console.log('Transcript Sha3: ' + documentHash);
        
        universityAddress = web3.eth.accounts[0];
        var signatureFromUni = web3.personal.sign(documentHash, universityAddress, function(error, result){
            if(!error){
                data.Signature = result;
                transcriptSigned = JSON.stringify(data);
                console.log(transcriptSigned);
                return transcriptSigned;
            }
            else
                console.error(error);
        });
    }); 
};

function sendTranscriptSigned() {
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
        //"data": "{\n\t\"owner_id\": \"5\",\n\t\"file\" : \n\t\t{\n\t\t\t\"name\" :\"Paula\",\n\t\t\t\"degree\" : \"BS CS\",\n\t\t\t\"courses\": [\n\t\t\t\t{\n\t\t\t\t\t\"name\": \"Math\",\n\t\t\t\t\t\"grade\": \"80\"\n\t\t\t\t},\n\t\t\t\t{\n\t\t\t\t\t\"name\": \"Algorithms\",\n\t\t\t\t\t\"grade\": \"100\"\n\t\t\t\t}\n\t\t\t]\n\t\t}\n\t\n}\n"
        "data": transcriptSigned
    }

    $.ajax(settings).done(function (response) {
        ipfsHashParsed = response;
        console.log(response);
    });    
}

// 3. Student encrypts the whole document with a secondary key (using their 2nd private key). --> api (done)
// 4. Student (or uni) adds document on IPFS.  --> api (done)
// 5. Student (or uni) stores on the smart contract the IPFS hash for the student. --> (done)

function recordTranscript() {
    let account = web3.eth.accounts[0];
    console.log('calling record.. Account: ' + account);
    
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
};

// 6. Student gives their public key to company X that want to decrypt the student's transcripts. --> front-end
// 7. Company X queries the blockchain to retrieve all the student's documents IPFS hash. --> front-end

function getTranscripts() {
    let account = web3.eth.accounts[0];
    console.log('calling getTranscripts.. Account: ' + account);
    
    contracts.Transcripts
    .then(function(instance) {
        transcript = instance;
        return transcript.getTranscripts.call(account, {from: account});
    })
    .then (function (result) {
        console.log("Hash array retrieved from the smart contract.");
        console.log(result);
    })
    .catch(function(error) {
        console.log( "Error trying to retrive the hash arrays from the smart contract: " + error.toString());
    });
}

// 8. Company X goes to each IPFS hash and decrypt the document. --> api
function retrieveTranscriptSigned() {
    console.log("retrieveTranscriptSigned()" + ipfsHashFromSmartContrat[ipfsHashFromSmartContrat.length-1]);
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:5000/trancripts/"+ ipfsHashFromSmartContrat[ipfsHashFromSmartContrat.length-1],
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
    });    
}

// 9. Company X validates that each document was indeed signed by the right university / instiution. --> front-end
// 10. Print and read over the transcript --> front-end

window.addEventListener('load', function() {
    init();
});