const {global} = require ("../global.js");
var assert = require('assert');


//Controlla se l'applicazione è attiva
it('App is running', async () => {
    var running = global.app.isRunning();
    assert.equal(running, true);
});
