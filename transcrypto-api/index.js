const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

var crypto = require('crypto');
var algorithm = 'aes-256-ctr'; 
var symKey = crypto.randomBytes(32);
var IV = new Buffer(crypto.randomBytes(16));

const bs58 = require('bs58');
const ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'})
const IPFS = require('ipfs')
const node = new IPFS()

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

//Global Variables, possibly going to DB
let pubkeyStudent;
let privkeyStudent;
let transcript;
let encryptedTranscript;
let ipfsHash;
let ipfsHashParsed;

app.post('/trancripts', (req, res) => {
    // Extract Student transcript received in the POST as string
    transcript = JSON.stringify(req.body);

    // 3. Student encrypts the transcript(s) with their private key
    console.log("Transcript file: "+ transcript);
    encryptedTranscript = encrypt(transcript);
    console.log("Encrypted Transcript: " + encryptedTranscript);

    // 4. Student (or uni) adds document on IPFS. 
    sendEncryptedFileToIpfs();

    console.log("parsing...");
    ipfsHashParsed = fromIPFSHash(ipfsHash).bytes32Hash;
    console.log('returning ipfsHashParsed' + ipfsHashParsed);
    res.send(ipfsHashParsed);
})

// 5. Student (or uni) stores on the smart contract the IPFS hash for the student. --> front-end (done)
// 6. Student gives their public key to company X that want to decrypt the student's transcripts. --> front-end
// 7. Company X queries the blockchain to retrieve all the student's documents IPFS hash. --> front-end
// 8. Company X goes to each IPFS hash and decrypt the document. --> api
app.get('/trancripts/:hash', (req, res) => {
    console.log("Hash received from solidity contract. " + req.params);

    ipfsBase58 = toIPFSHash(req.params.hash);
    console.log("parsing hex to base58: " + ipfsBase58);

    // Retrieve document from IPFS. 
    let file = retriveEncryptedFileFromIpfs(ipfsBase58);

    // Decrypt the transcript(s) with the private key
    console.log("Encrypted transcript file: "+ file);
    let decryptedTranscript = decrypt(file);

    console.log('returning decryptedTranscript' + decryptedTranscript);
    res.send(decryptedTranscript);
})

// 9. Company X validates that each document was indeed signed by the right university / instiution. --> front-end
// 10. Print and read over the transcript --> front-end

//console.log('Decrypted Transcript: ' + decryptedTranscript);

/**
 * Here "aes-256-cbc" is the advance encyption standard we used for encrytion.
 * @param {string} text Confidential data which we need to encrypt using 'password'(Key).
 * @returns {dec}
 */
function encrypt(text) {
    var cipher = crypto.createCipheriv(algorithm, symKey, IV);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

/**
 * Here "aes-256-cbc" is the advance encyption standard we used for encrytion.
 * @param {string} text Cipher which we need to decrypt using 'password'(Key).
 * @returns {dec}
 */
function decrypt(text) {
   var decipher = crypto.createDecipheriv(algorithm, symKey, IV);
   var dec = decipher.update(text,'hex','utf8');
   dec += decipher.final('utf8');
   return dec;
}

/**
 * Add file to IPFS
 */
const sendEncryptedFileToIpfs = function() {
    // node.on('ready', () => {
    //     // Your node is now ready to use \o/
    //     console.log('ready');
    //     // stopping a node
    //     node.stop(() => {
    //         // node is now 'offline'
    //     })
    //     })

    console.log('hello ipfs!');
    let encryptedTranscriptBuffer = new Buffer(encryptedTranscript);
    ipfs.files.add(encryptedTranscriptBuffer, (err, filesAdded) => {
        if (err)
            return console.error('err', err)
        
        const file = filesAdded[0];
        ipfsHash = file.hash;
        console.log('IPFS Hash: ' + file.hash);
    })
}

const retriveEncryptedFileFromIpfs = function(ipfsPath) {
    console.log('hello ipfs! ' + ipfsPath);
    ipfs.files.cat(ipfsPath, function (err, file) {
        if (err) {
          throw err
        }
      
        console.log("File from ipfs: " + file.toString('utf8'));
        return file;
      })
}

/**
 * Partition multihash string into object representing multihash
 *
 * @param {string} hash A base58 encoded multihash string
 * @returns {hash}
 */
function fromIPFSHash(hash) {
    const decoded = bs58.decode(hash);
    return {
        bytes32Hash: `0x${decoded.slice(2).toString('hex')}`,
    };
}  
  
/**
 * Encode a bytes32 hash into base58 encoded multihash string
 *
 * @param {Multihash} multihash
 * @returns {(string|null)} base58 encoded multihash string
 */
function toIPFSHash(bytes32Hash) {
    console.log("toIPFSHash input: " + bytes32Hash);
    let digest = bytes32Hash;
    // cut off leading "0x"
    const remove0x = bytes32Hash.slice(2);
    console.log("hashBytes: " + remove0x);
    
    // add back the multihash id
    const bytes = Buffer.from(`1220${remove0x}`, "hex");
    const hash = bs58.encode(bytes);
    console.log("toIPFSHash result: " + multihashBytes);
    return hash;
}

//Run the server with node index.js
const port = process.env.PORT || 5000;
app.listen(port,() => console.log(`Listening on port ${port}...`));