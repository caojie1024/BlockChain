/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);


/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
      this.getBlockHeight().then(height=>{
          if (height === 0 ){
              this.addBlock(new Block("First block in the chain - Genesis block"));
          }
      });
  }

  // Add new block
  addBlock(newBlock){
       this.getBlockHeight().then(height =>{
           newBlock.height = height;
           // UTC timestamp
           newBlock.time = new Date().getTime().toString().slice(0,-3);
           if(height>0){
               this.getBlock(height-1)
                   .then(value => {
                       newBlock.previousBlockHash = value['hash'];
                       newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                       db.put(height,JSON.stringify(newBlock).toString());
                       return height;
                   })
                   .catch(function(err){console.error(err)})
           }else{
               // Block hash with SHA256 using newBlock and converting to a string
               newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
               db.put(height, JSON.stringify(newBlock).toString())
                   .then(function () {
                       return height;
                       console.log('New Block added')
                   })
                   .catch(function (err) {
                       console.error(err)
                   })
           }
       });        // Block height


  }

  // Get block height
  async getBlockHeight(){
       return new Promise(function (resolve,reject){
            let i = 0;
            db.createReadStream().on('data', function () {
                i++;
            }).on('error', function (err) {
                reject(err);
            }).on('close', function () {
                resolve(i);
            });
        });
    }




    // get block
  async getBlock(blockHeight){
      // return object as a single string
         return new Promise(function(resolve,reject){
             db.get(blockHeight).then(function(value){
                 resolve(JSON.parse(value));
             }).catch(function(err){console.error(err)});
         })

    }


    // validate block
  async validateBlock(blockHeight){
      // get block object
        let self = this;
        return new Promise(function(resolve,reject){
            self.getBlock(blockHeight)
                .then(function(block){
                    // get block hash
                    let blockHash = block['hash'];
                    // remove block hash to test block integrity
                    block['hash'] = '';
                    // generate block hash
                    let validBlockHash = SHA256(JSON.stringify(block)).toString();
                    // Compare
                    if (blockHash===validBlockHash) {
                        resolve(true) ;
                    } else {
                        console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
                        reject(false) ;
                    }
                })
                .catch(function(err){console.error(err);})
        })

    }

   // Validate blockchain
   async validateChain(){
      let errorLog = [];
     // let self = this;
      let height = await this.getBlockHeight()
          for (var i = 0; i < height-1; i++) {
              // validate block
              let result = await this.validateBlock(i);
              if ( !result)errorLog.push(i);
              // compare blocks hash link
              let blockHash = await this.getBlock(i)['hash'];
              let previousHash = await this.getBlock(i+1)['previousBlockHash'];
              if (blockHash!==previousHash) {
                  errorLog.push(i);
              }
          }
          if (errorLog.length>0) {
              console.log('Block errors = ' + errorLog.length);
              console.log('Blocks: '+errorLog);
          } else {
              console.log('No errors detected');
          }


    }
}

module.exports = Blockchain;
//module.exports = Block;






