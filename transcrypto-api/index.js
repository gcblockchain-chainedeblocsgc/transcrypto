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
    console.log("Encrypted transcript file: " + encryptedTranscript);

    let encryptedTranscriptBuffer = new Buffer(encryptedTranscript);
    ipfs.files.add(encryptedTranscriptBuffer, (err, filesAdded) => {
        if (err)
            return console.error('err', err)
        
        const file = filesAdded[0];
        ipfsHash = file.hash;
        ipfsHashParsed = fromIPFSHash(file.hash).bytes32Hash;
        
        res.send(ipfsHashParsed);            
    });    
})

// 5. Student (or uni) stores on the smart contract the IPFS hash for the student. --> front-end (done)
// 6. Student gives their public key to company X that want to decrypt the student's transcripts. --> front-end
// 7. Company X queries the blockchain to retrieve all the student's documents IPFS hash. --> front-end
// 8. Company X goes to each IPFS hash and decrypt the document. --> api
app.get('/trancripts/:hash', (req, res) => {
    console.log("Hash received from solidity contract. " + req.params.hash);

    ipfsBase58 = toIPFSHash(req.params.hash);

    // Retrieve document from IPFS. 
    ipfs.files.cat(ipfsBase58, function (err, file) {
        if (err) {
          throw err
        }
        
        // Decrypt the transcript(s) with the private key
        console.log("Encrypted transcript file: " + file);
        let decryptedTranscript = decrypt(file.toString());

        console.log('returning decryptedTranscript' + decryptedTranscript);
        res.send(decryptedTranscript);
    })
})

// 9. Company X validates that each document was indeed signed by the right university / instiution. --> front-end
// 10. Print and read over the transcript --> front-end

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
 * @param {string} bytes32Hash
 * @returns {(string|null)} base58 encoded multihash string
 */
function toIPFSHash(bytes32Hash) {
    // cut off leading "0x"
    const remove0x = bytes32Hash.slice(2);
    
    // add back the multihash id
    const bytes = Buffer.from(`1220${remove0x}`, "hex");
    const hash = bs58.encode(bytes);

    return hash;
}

//Run the server with node index.js
const port = process.env.PORT || 5000;
app.listen(port,() => console.log(`Listening on port ${port}...`));