const BlockChain = require('./simpleChain');
const express = require('express');
const app = express();

var router = express.Router();
var port = process.env.PORT || 8000;

router.route('/block/:block_height')
    .get(function(req,res){
        let blockchain = new BlockChain();
        blockchain.getBlock(req.params.block_height)
            .then(value => {
                res.json(value);
            });
    });

app.use('/', router);
app.listen(3000);
console.log('Magic happens on port ' + port);

