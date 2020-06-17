const {global} = require ("../global.js");
var assert = require('assert');

//Controlla che sia aperta una singola finestra dell'applicazione
describe("Shows only one window", function(){
    it('Shows only one window', async () => {
        global.app.client.waitUntilWindowLoaded();
        const count = await global.app.client.getWindowCount();
        assert.equal(count, 1,"there are more windows");
    });
})

