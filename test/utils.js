const {db} = require ("./db.js");
const {global} = require ("../global.js");

const utils={
    //funzione di wait
    sleep : time => new Promise(r => setTimeout(r, time)),


}

module.exports = {utils}