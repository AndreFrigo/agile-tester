var Application = require('spectron').Application;
var assert = require('assert');
const {testList} = require ("./test-list.js");
var app = null;

// Italiano:1, Inglese:2, Spagnolo:3
var language = 0;



//apre l'applicazione prima di iniziare il test
before(function(done) {
    app = new Application({
        path: 'C:\\Program Files (x86)\\Praim\\Agile\\AgileConfigurator\\AgileConfigurator.exe'
    });
    console.log("Applicazione caricata");
    app.start();
    done();
});

//chiude l'applicazione alla fine dei test
after(function (done) {
    if (app && app.isRunning()) {
        app.stop();
    }
    done();
});



describe('Test', function(){

    //pausetta tra i vari test
    beforeEach(function(done){
        this.timeout(5000);
        setTimeout(done,4000);
    })

    //Controlla se l'applicazione è attiva
    if(testList.appIsRunning){
        it('App is running', async () => {
        var running = app.isRunning();
        assert.equal(running, true);
        });
    };
    

    //Controlla che sia aperta una singola finestra dell'applicazione
    if(testList.onlyOneWindow){
        it('Shows an initial window', async () => {
        app.client.waitUntilWindowLoaded();
        const count = await app.client.getWindowCount();
        assert.equal(count, 1);
        });
    };

    //Va nella sezione impostazioni, nessun controllo
    it('Navigates to settings', async () => {
        await app.client.click('#menu-link-1');
        app.client.waitUntilWindowLoaded();
        assert.equal(1,1);
    });
    
    //Dalla sezione impostazioni va a quella della lingua, nessun controllo
    it('Navigates to language', async () => {
        const lingua = app.client.$('#language-tab.tab > a');
        await lingua.click();
        app.client.waitUntilWindowLoaded();
        assert.equal(1,1);
    });

    
})
