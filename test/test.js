var Application = require('spectron').Application;
var assert = require('assert');
const {testList} = require ("./test-list.js");
const {utils} = require ("./utils.js");
const {db} = require ("./db.js");
var app = null;
var agilePreview = null;
var conn = null;
const redis = require('redis')

//da impostare prima di eseguire
//path per la cartella Praim/Agile
const AGILE_PATH = "C:\\Program Files (x86)\\Praim\\Agile"
//dati per la creazione di un nuovo indirizzo agile (test: addThinManAddress), perchè il test funzioni non deve esistere nessun indirizzo con llo stesso hostname
const agileAddress = {address: "agile_test", timeout: 23, port: 378};
// about:0, system settings:1, .....
var leftMenu = 0;
// Italiano:1, Inglese:2, Spagnolo:3
var language = 0;



//apre l'applicazione prima di iniziare il test
before(function(done) {
    app = new Application({
        path: AGILE_PATH + '\\AgileConfigurator\\AgileConfigurator.exe',
    });
    app.start();
    done();
});

//chiude l'applicazione alla fine dei test
// after(function (done) {
//     if (app && app.isRunning()) {
//         app.stop();
//     }
//     done();
// });



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

    
    //Controlla la lingua del sistema
    it('Checking language', async () => {
        //connessione al database
        db.dbConnection();

        //aggiorno la lingua in base a quella del db
        language = await db.dbLanguage();

        //controllo lingua di agile dall'interfaccia
        const lang = app.client.$('#menu-link-1');
        await lang.getText().then(function(l){
            if(l == "Impostazioni di Sistema") assert.equal(language, 1);
            if(l == "System Settings") assert.equal(language, 2);
            if(l == "Ajustes del Sistema") assert.equal(language, 3);
        })
    });
    
    //Imposta la lingua di sistema in english
    if(testList.englishLanguage){
        describe("Choose english as language", function(){
            //controlla se si è gia nel menù corretto
            if(leftMenu != 1){
                //Va nella sezione impostazioni
                it('Navigates to settings', async () => {
                    const click = await app.client.click('#menu-link-1');
                    app.client.waitUntilWindowLoaded();
                    leftMenu = 1;
                    assert.ok(click);
                });
            }
            
            //Dalla sezione impostazioni va a quella della lingua
            it('Navigates to language', async () => {
                const lingua = app.client.$('#language-tab.tab > a');
                const click = await lingua.click();
                app.client.waitUntilWindowLoaded();
                assert.ok(click);
            });

            //Controllo che la lingua selezionata sia quella attuale 
            it('Control that displayed current language is correct', async () => {
                const lan = app.client.$('#language > span > div > div > div > input.select-dropdown');
                lan.getValue().then(function(l){
                    if(l == "Italiano") assert.equal(language, 1);
                    if(l == "English") assert.equal(language, 2);
                    if(l == "Español") assert.equal(language, 3);
                })
            })

            //Dalla sezione lingua, apre la scelta della lingua
            it('Open language list', async () => {
                const sbe = app.client.$('#language > span > div > div > div > input.select-dropdown');
                const click = await sbe.click();
                assert.ok(click);
            });

            //Sceglie la lingua inglese
            it('Select english as language', async () => {
                var choice = ""
                switch(language){
                    case 1 : {
                        choice+="span=Inglese";
                        break;
                    }
                    case 2 : {
                        choice+="span=English";
                        break;
                    }
                    case 3 : {
                        choice+="span=Inglés";
                        break;
                    }
                    default : {
                        console.log("Undefined language!" + language);
                        break;
                    }
                }
                await app.client.click(choice).then(function(){
                    //aggiorna la lingua corrente
                    language = 2;
                });
                //controlla che la lingua corrente sia inglese
                assert.equal(language,2);
            });

            it('Check if db language is english', async () => {
                var lan = await db.dbLanguage();
                assert(lan, "en-GB");
            });

            //Controllo che la lingua selezionata sia english
            it('Control that displayed current language is english', async () => {
                const lan = app.client.$('#language > span > div > div > div > input.select-dropdown');
                lan.getValue().then(function(l){
                    if(l == "Italiano") assert.equal(language, 1);
                    if(l == "English") assert.equal(language, 2);
                    if(l == "Español") assert.equal(language, 3);
                })
            })
        })
    }

    if(testList.addThinManAddress){
        //Aggiunge un address all'elenco dei ThinMan (info in agileAddress)
        describe("Add a new address of ThinMan", function(){
            //controlla se è già nel menù corretto
            if(leftMenu != 2){
                //Va nella sezione ThinMan Setting
                it("Navigates to ThinMan Settings", async () => {
                    const click = await app.client.click('#menu-link-3');
                    app.client.waitUntilWindowLoaded();
                    leftMenu = 2;
                    assert.ok(click);
                })
                //Preme su add address
                it("Press Add Address", async () => {
                    const addAddress = app.client.$('h5 > a');
                    const click = await addAddress.click();
                    app.client.waitUntilWindowLoaded();
                    assert.ok(click);
                })
                //inserisce l'hostname settato in agileAddress
                it("Insert hostname", async () => { 
                    const hostname = app.client.$("#new-address");
                    hostname.setValue(agileAddress.address);
                    hostname.getValue().then(function(v){
                        assert.equal(agileAddress.address, v);
                    })
                })
                //inserisce la porta settata in agileAddress
                it("Insert port", async () => {
                    const port = app.client.$("#new-port");
                    port.click();
                    port.clearElement();
                    //TODO: need to insert a pause
                    port.setValue(agileAddress.port);
                    port.getValue().then(function(v){
                        assert.equal(v, agileAddress.port);
                    })
                })
                //inserisce il timeout settato in agileAddress
                it("Insert timeout", async () => {
                    const timeout = app.client.$("#new-timeout");
                    timeout.click();
                    timeout.clearElement();
                    //TODO: need to insert a pause
                    timeout.setValue(agileAddress.timeout);
                    timeout.getValue().then(function(v){
                        assert.equal(v, agileAddress.timeout);
                    })
                })
                //preme ok creando così il nuovo indirizzo
                it("Create the new address", async () => {
                    const ok = app.client.$("#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a");
                    const click = await ok.click();
                    assert.ok(click);
                })
                //controlla se l'indirizzo è stato inserito nel db 
                it("Check if the new address is in the db ", async () => {
                    //indirizzo con lo stesso hostname di quello desiderato
                    const address = await db.getThinManFromHostname(agileAddress.address);
                    if(address){
                        if(address.port == agileAddress.port && address.timeout == agileAddress.timeout){
                            assert.ok(true,"the new address has not been created successfully");
                        }else{
                            assert.ok(false, "port or timeout are different from the given values")
                        }
                    }else{
                        assert.ok(false, "can't find an address with the given hostname")
                    }
                })

                //controlla se l'indirizzo è ora presente nella lista di agile
                it("Check if the new address is in the list of agile", async () => {
                    //numero di address agile 
                    const length = await db.getThinManListLength();

                    var thinman = app.client.$("#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul");
                    var child = null;
                    //indica se ho trovato un'address con quell'hostname
                    var found = null;
                    for(i=1;i<=length;i++){
                        //cerco l'address
                        child = thinman.$("li:nth-child("+i+") > div > div");
                        //string per html che dipende dalla lingua in uso
                        var indirizzo = null;
                        if(language == 1) indirizzo = "Indirizzo"
                        else if(language == 2) indirizzo = "Address"
                        else if(language == 3) indirizzo = "Dirección"
                        //guardo se gli address corrispondono
                        const x = await child.$("div.address-info > div").getHTML();
                        if(x == "<div><b>"+indirizzo+":</b> "+ agileAddress.address +"</div>"){
                            //aggiorno found
                            found = true;
                        }
                    } 
                    assert.ok(found, "l'elemento non si trova ancora nella lista")
                })
            }
            
        })
    }

    if(testList.deleteThinManAddress){
        //Elimina un address dall'elenco dei ThinMan (info in agileAddress)
        describe("Delete agile address", function(){
            //Controlla che ci sia un indirizzo con l'hostname dato
            it("Check if there is an address with the given hostname in the db", async () => {
                const address = await db.getThinManFromHostname(agileAddress.address);
                assert.ok(address, "there isn't any address with the given hostname");
            })
            //controlla se è già nel menù corretto
            if(leftMenu != 2){
                //Va nella sezione ThinMan Setting
                it("Navigates to ThinMan Settings", async () => {
                    const click = await app.client.click('#menu-link-3');
                    app.client.waitUntilWindowLoaded();
                    leftMenu = 2;
                    assert.ok(click);
                })
            }
            
            it("Delete the selected address", async () => {
                //numero di address agile 
                const length = await db.getThinManListLength();

                var thinman = app.client.$("#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul");
                var child = null;
                //selector per il bottone da premere
                var elimina = null;
                for(i=1;i<=length;i++){
                    //cerco l'address che voglio eliminare
                    child = thinman.$("li:nth-child("+i+") > div > div");
                    //string per html che dipende dalla lingua in uso
                    var indirizzo = null;
                    if(language == 1) indirizzo = "Indirizzo"
                    else if(language == 2) indirizzo = "Address"
                    else if(language == 3) indirizzo = "Dirección"
                    //guardo se gli address corrispondono
                    const x = await child.$("div.address-info > div").getHTML();
                    if(x == "<div><b>"+indirizzo+":</b> "+ agileAddress.address +"</div>"){
                        //salvo elemento da eliminare per eliminarlo in seguito
                        elimina = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul > li:nth-child("+i+") > div > div > div.address-item-delete > i";
                    }
                } 
                //bottone da premere per eliminare l'elemento
                const elim = await app.client.$(elimina).click();
                assert.ok(elim);
            })
            //Controlla che non ci sia più l'indirizzo con l'hostname dato
            it("Check if the address is not in the list of address anymore", async () => {
                //numero di address agile 
                const length = await db.getThinManListLength();

                var thinman = app.client.$("#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul");
                var child = null;
                //indica se ho trovato un'address con quell'hostname
                var found = null;
                for(i=1;i<=length;i++){
                    //cerco l'address
                    child = thinman.$("li:nth-child("+i+") > div > div");
                    //string per html che dipende dalla lingua in uso
                    var indirizzo = null;
                    if(language == 1) indirizzo = "Indirizzo"
                    else if(language == 2) indirizzo = "Address"
                    else if(language == 3) indirizzo = "Dirección"
                    //guardo se gli address corrispondono
                    const x = await child.$("div.address-info > div").getHTML();
                    if(x == "<div><b>"+indirizzo+":</b> "+ agileAddress.address +"</div>"){
                        //aggiorno found
                        found = true;
                    }
                } 
                assert.ok(!found, "l'elemento si trova ancora nella lista")
            })
            //Controlla che non ci sia più l'indirizzo con l'hostname dato nel database
            it("Check if the address is not in the db anymore", async () => {
                const address = await db.getThinManFromHostname(agileAddress.address);
                assert.ok(address==null, "the address with the given hostname is still in the database");
            })

        })
    }

    if(testList.previewAgile){
        //Avvia anteprima modalità Agile
        describe("Show Agile preview", function(){
            //controlla se si è gia nel menù corretto
            if(leftMenu != 10){
                //Va nella sezione Modalità d'uso
                it("Navigates to Agile/Browser/Desktop Mode ", async () => {
                    const click = await app.client.click('#menu-link-12');
                    app.client.waitUntilWindowLoaded();
                    leftMenu = 10;
                    assert.ok(click);
                })
            }
            
            //Mostra la Agile preview aprendola come nuova applicazione della path e non dall'interfaccia
            it('Start Agile preview', async () => {
                agilePreview = new Application({
                    path: AGILE_PATH + '\\Agile\\Agile.exe',
                });
                const start = agilePreview.start();
                assert.ok(start)
            });
        })
    }
    
})
