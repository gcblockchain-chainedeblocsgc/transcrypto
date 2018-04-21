const BigNumber = web3.BigNumber;
const Web3Utils = require('web3-utils');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Transcripts = artifacts.require('Transcripts');
const SchoolRegistry = artifacts.require('SchoolRegistry');


contract('Transcripts', function ([_, owner, student, university]) { 
  const transcriptHash = "0x7d5a99f603f231d53a4f39d1521f98d2e8bb279cf29bebfd0687dc98458e7f89";
  const schoolName = 'UofT';
  const schoolWebsite = 'https://www.utoronto.ca/';

  context('When Transcript and SchoolRegistry contracts are published', function (){
    beforeEach(async function () {
      this.transcripts = await Transcripts.new({from: owner});
      this.registry = await SchoolRegistry.new({from: owner});
    });

    it('should allow anyone to append a new transcript IPFS hash to a student array', async function () {
      await this.transcripts.record(student, transcriptHash).should.be.fulfilled;
    });

    it('should allow owner to set SchoolRegistry contract address', async function () {
      await this.transcripts.setSchoolRegistry(this.registry.address, {from : owner}).should.be.fulfilled;
    });

    describe('Verifying signed hashes from known university', function () {
      let sig; // hash signature

      beforeEach(async function () {
        //Register school
        await this.registry.editSchool(university, schoolName, schoolWebsite, {from: owner});

        // Set schoolRegistry address
        await this.transcripts.setSchoolRegistry(this.registry.address, {from : owner})
        
        // School signs transcript hash 
        sig = await web3.eth.sign(university, transcriptHash);
      });

      it('calling #getSignatureSigner() should return who signed the transcript hash', async function () {
        let signer = await this.transcripts.getSignatureSigner(transcriptHash, sig);
        signer.should.be.equal(university);
      })

      it('calling #isValidSignature should return true if signed hash from expected university', async function () {
        let isValid = await this.transcripts.isValidSignature(university, transcriptHash, sig);
        isValid.should.be.equal(true);
      });

      it('calling #getSignerSchoolRegistryInfo should return school information for given sig and hash', async function () {
        let info = await this.transcripts.getSignerSchoolRegistryInfo(transcriptHash, sig);
        info[0].should.be.equal(schoolName);
        info[1].should.be.equal(schoolWebsite);
      });

    }); 


    context('When student transcript was recorded in contract', function () {
      beforeEach(async function () {
        await this.transcripts.record(student, transcriptHash)
      });

      it('calling #getTranscripts() should return student transcript hash', async function () {
        let transcript = await this.transcripts.getTranscripts(student);
        transcript[0].should.be.equal(transcriptHash);    
      });


    }); 
  });
});
