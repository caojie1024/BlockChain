/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
const SHA256 = require('crypto-js/sha256');


// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
    db.put(key, value, function (err) {
        if (err) return console.log('Block ' + key + ' submission failed', err);
    })
}

// Get data from levelDB with key
function getLevelDBData (key) {
    db.get(key, function (err, value) {
        if (err) return console.log('Not found!', err);
        console.log('Value = ' + value);
    })
}
function delLevelDBData(key) {
    if (key) {
        db.del(key, function (err) {
            if (err) return console.log('Can not deleted!', err);
        })
    } else {
        console.log('No key', key);
    }
}

// Add data to levelDB with value
function addDataToLevelDB() {
    let i = 0;
    db.createReadStream().on('data', function () {
        i++;
    }).on('error', function (err) {
        return console.log('Unable to read data stream!', err)
    }).on('close', function () {
        console.log('Block #' + i);
        return Promise.resolve(i)
        addLevelDBData(i, value);
    });
}

function delDataFromLevelDB(key) {
    let i = 0;
    db.createReadStream().on('data', function () {
        i++;
    }).on('error', function (err) {
        return console.log('Unabble to ready data stream!', err)
    }).on('close', function () {
        console.log('Block #' + i);
        delLevelDBData(key);
    })
}

function getBlockHeight(){
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

function getBlock(blockHeight){
    // return object as a single string
    return new Promise(function(resolve,reject){
        db.get(blockHeight).then(function(value){
            resolve(JSON.parse(value));
        }).catch(function(err){console.error(err)});
    })

}

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


/*(function theLoop(i) {
    setTimeout(function () {
        delDataFromLevelDB(i);
        if (--i) theLoop(i);
    }, 100);
})(7);*/
function validateBlock(blockHeight){
    // get block object
    return new Promise(function(resolve,reject){
        getBlock(blockHeight)
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


