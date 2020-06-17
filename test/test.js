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
//dati per creazione USB redirection (test: addUsbRedirection)
const agileUSB = {description: "agile_usb_test", vid: 2323, pid: 3232}
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
        assert.equal(count, 1,"there are more windows");
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
            if(l == "Impostazioni di Sistema") assert.equal(language, 1)
            else if(l == "System Settings") assert.equal(language, 2)
            else if(l == "Ajustes del Sistema") assert.equal(language, 3)
            else assert.ok(false, "error while checking the language")
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
                    assert.ok(click, "error while opening the settings menù");
                });
            }
            
            //Dalla sezione impostazioni va a quella della lingua
            it('Navigates to language', async () => {
                const lingua = app.client.$('#language-tab.tab > a');
                const click = await lingua.click();
                app.client.waitUntilWindowLoaded();
                assert.ok(click, "error while opening the language tab");
            });

            //Controllo che la lingua selezionata sia quella attuale 
            it('Control that displayed current language is correct', async () => {
                const lan = app.client.$('#language > span > div > div > div > input.select-dropdown');
                lan.getValue().then(function(l){
                    if(l == "Italiano") assert.equal(language, 1)
                    else if(l == "English") assert.equal(language, 2)
                    else if(l == "Español") assert.equal(language, 3)
                    else assert.ok(false, "error while checking language")
                })
            })

            //Dalla sezione lingua, apre la scelta della lingua
            it('Open language list', async () => {
                const sbe = app.client.$('#language > span > div > div > div > input.select-dropdown');
                const click = await sbe.click();
                assert.ok(click, "error while clicking the button");
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
                assert.equal(language,2, "error, the current language is not english");
            });

            it('Check if db language is english', async () => {
                var lan = await db.dbLanguage();
                assert(lan, "en-GB", "error, the db language is not english");
            });

            //Controllo che la lingua selezionata sia english
            it('Control that displayed current language is english', async () => {
                const lan = app.client.$('#language > span > div > div > div > input.select-dropdown');
                lan.getValue().then(function(l){
                    if(l == "Italiano") assert.equal(language, 1)
                    else if(l == "English") assert.equal(language, 2)
                    else if(l == "Español") assert.equal(language, 3)
                    else assert.ok(false, "error while checking language")
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
                    assert.ok(click, "error while opening the thinman settings menù");
                })
                //Preme su add address
                it("Press Add Address", async () => {
                    const addAddress = app.client.$('h5 > a');
                    const click = await addAddress.click();
                    app.client.waitUntilWindowLoaded();
                    assert.ok(click, "error while clicking the button");
                })
                //inserisce l'hostname settato in agileAddress
                it("Insert hostname", async () => { 
                    const hostname = app.client.$("#new-address");
                    hostname.setValue(agileAddress.address);
                    hostname.getValue().then(function(v){
                        assert.equal(agileAddress.address, v, "error while inserting the hostname");
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
                        assert.equal(v, agileAddress.port, "error while inserting the port");
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
                        assert.equal(v, agileAddress.timeout, "error while inserting the timeout");
                    })
                })
                //preme ok creando così il nuovo indirizzo
                it("Create the new address", async () => {
                    const ok = app.client.$("#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a");
                    const click = await ok.click();
                    assert.ok(click, "error while clicking the button");
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

    if(testList.addUsbRedirection){

        //TODO: da decidere come valutare errori, per esempio input vid e pid devono essere numeri di 4 cifre

        describe("Add USB redirection rule", function(){

            //Controlla che non ci sia già una regola con vid e pid stabiliti
            it("Check if there is already a rule with the given vid and pid in the db", async () => {
                const usb = await db.getUSBFromVidPid(agileUSB.vid, agileUSB.pid);
                assert.ok(usb == null, "there is already a rule with the given vid and pid");
            })

            //Apre menù USB Redirection
            it("Navigates to USB Redirection ", async () => {
                const click = await app.client.click('#menu-link-10');
                app.client.waitUntilWindowLoaded();
                assert.ok(click, "Error while opening the usb redirection menù");
            })

            //Clicca nel link Add redirection rule
            it("Click on Add redirection rule", async () => {
                const click = await app.client.click("#citrix > div > div > div > a");
                app.client.waitUntilWindowLoaded();
                assert.ok(click, "error while clicking the botton");
            })

            //inserisce la descrizione da agileUSB
            it("Insert description", async () => {
                const description = app.client.$("#description");
                description.click();
                description.setValue(agileUSB.description);
                description.getValue().then(function(v){
                    assert.equal(v, agileUSB.description, "error while inserting the description");
                })
            })

            //inserisce il vid da agileUSB
            it("Insert vid", async () => {
                const vid = app.client.$("#vid");
                vid.click();
                vid.setValue(agileUSB.vid);
                vid.getValue().then(function(v){
                    assert.equal(v, agileUSB.vid, "error while inserting vid");
                })
            })

            //inserisce il pid da agileUSB
            it("Insert pid", async () => {
                const pid = app.client.$("#pid");
                pid.click();
                pid.setValue(agileUSB.pid);
                pid.getValue().then(function(v){
                    assert.equal(v, agileUSB.pid, "error while inserting pid");
                })
            })

            //preme ok creando così la nuova regola
            it("Create the rule", async () => {
                const ok = app.client.$("#add-usb-rule-modal > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
                const click = await ok.click();
                assert.ok(click, "error while clicking the button");
            })

            //controlla che la regola sia ora presente nel db
            it("Check if the rule with the given data is now in the db", async () => {
                const usb = await db.getUSBFromVidPid(agileUSB.vid, agileUSB.pid);
                if(usb.description == agileUSB.description){
                    assert.ok(true);
                }else assert.ok(false, "the new rule is not been inserted in the db");
            })

            //controlla che la regola sia presente nella lista di agile 
            it("Check if the new rule is in the list of agile", async () => {
                //numero di address agile 
                const length = await db.getUSBRedirectionListLength();

                //indica se ho trovato un'address con quell'hostname
                var found = null;
                var description = null;
                var vidPid = null;

                for(i = 1; i <= length; i++){
                    description = await app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div > div.usbredir-item-properties > div > div").getText();
                    vidPid = await app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div > div.usbredir-item-properties > div > p > span").getText();
                    if(description == agileUSB.description && vidPid == "Vid: "+agileUSB.vid+", Pid: "+agileUSB.pid){
                        console.log("ciclo "+i+" description: "+description+" e vidpid: "+vidPid);
                        found = true;
                    }
                } 
                assert.ok(found, "the element is not in the list")
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
                    assert.ok(click, "error while opening the agile preview menù");
                })
            }
            
            //Mostra la Agile preview aprendola come nuova applicazione della path e non dall'interfaccia
            it('Start Agile preview', async () => {
                agilePreview = new Application({
                    path: AGILE_PATH + '\\Agile\\Agile.exe',
                });
                const start = agilePreview.start();
                assert.ok(start, "error while starting the preview")
            });
        })
    }
    
})
