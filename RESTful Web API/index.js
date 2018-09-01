const SimpleChain = require('./simpleChain');
const BlockClass = require('./ClassBlock');
const express = require('express');
const app = express();

var router = express.Router();
var port = process.env.PORT || 8000;

router.route('/block/:block_height')
    .get(function(req,res){
        let blockchain = new SimpleChain;
        blockchain.getBlock(req.params.block_height)
            .then(value => {
                res.json(value);
            });
    });
app.post('/block',function(req,res){
    let block = new BlockClass(req.params.value);
    let blockchain = new SimpleChain;
    blockchain.addBlock(block)
        .then(data=>{
            res.json(blockchain.getBlock(data));
        });
});

app.use('/', router);
app.listen(port);
console.log('Magic happens on port ' + port);

