var Application = require('spectron').Application;
var assert = require('assert');
const {testList} = require ("./test-list.js");
var app = null;
var agilePreview = null;
var conn = null;
const redis = require('redis')

//da impostare prima di eseguire
//path per la cartella Praim/Agile
const AGILE_PATH = "C:\\Program Files (x86)\\Praim\\Agile"
//dati per la creazione di un nuovo indirizzo agile (test: addThinManAddress), perchè il test funzioni non deve esistere nessun indirizzo con llo stesso hostname
const newAddress = {address: "agile_test", timeout: 23, port: 378};
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
        conn = redis.createClient(1681);
        conn.auth("9C81F1AAC9769BF2824B8F139BE38B87E7BFE0F14BA8DD4E2CA685A36277DE8EACEA38665F5F64C14B07009AB36762FBD5C735EDEE38F6E74A5730417825C3BEAD4E92C3DB3B372FAA9ADC83C5432895EE5925E5907C1E197AC92673FF57642463529C795629060B1E2E7A7349C6A330826BFC552556FB546F7643CA164514870F5A30BE6991F2DCACBF0551B58CDE00BE583C2B9ED938A4A22A6AB86E0EA963A24B649DB9FD29A8348266DB72B4CBA0A0DAA3790291B39C2B7F613C64DCA04E4266C046A8D53172FECE4372805C57905B98C86922A73204C9EF6EC44585E8624FC8C65C3FD5076E364C6DD0A61FBE39667EB7C37558D66A0284");
        
        //controllo lingua di agile
        conn.select(1);
        conn.get("config_locale", function(err, res){
            var lan = JSON.parse(res).current_locale_agile;
            if(lan == "it-IT") language = 1;
            else if(lan == "en-GB") language = 2;
            else if(lan == "es-ES") language = 3;
            else console.log("Error on checking agile language");
            //console.log("Agile language: " + lan);
        });
        if(language > 0 &&  language < 4){
            assert.ok(language);
        }
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

            it('Check if language is english', async () => {
                conn.select(1);
                await conn.get("config_locale", function(err, res){
                    //controlla che la lingua settata nel database sia en-GB
                    var lan = JSON.parse(res).current_locale_agile;
                    assert(lan, "en-GB");
                });
            })
        })
    }

    if(testList.addThinManAddress){
        //Aggiunge un address all'elenco dei ThinMan
        describe("Add a new address of ThinMan", function(){
            //controlla se è già nel menù corretto
            if(leftMenu != 2){
                //Va nella sezione ThinMan Setting
                it("Navigates to ThinMan Settings", async () => {
                    const click = await app.client.click('#menu-link-2');
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
                //inserisce l'hostname settato in newAddress
                it("Insert hostname", async () => { 
                    const hostname = app.client.$("#new-address");
                    hostname.setValue(newAddress.address);
                    hostname.getValue().then(function(v){
                        assert.equal(newAddress.address, v);
                    })
                })
                //inserisce la porta settata in newAddress
                it("Insert port", async () => {
                    const port = app.client.$("#new-port");
                    port.click();
                    port.getValue().then(function(result){
                        for(i=0;i<result.length;i++){
                            app.client.keys("Backspace");
                        }
                    });
                    port.setValue(newAddress.port);
                    port.getValue().then(function(v){
                        assert.equal(v, newAddress.port);
                    })
                })
                //inserisce il timeout settato in newAddress
                it("Insert timeout", async () => {
                    const timeout = app.client.$("#new-timeout");
                    timeout.click();
                    timeout.getValue().then(function(result){
                        for(i=0;i<result.length;i++){
                            app.client.keys("Backspace");
                        }
                    });
                    timeout.setValue(newAddress.timeout);
                    timeout.getValue().then(function(v){
                        assert.equal(v, newAddress.timeout);
                    })
                })
                //preme ok creando così il nuovo indirizzo
                it("Create the new address", async () => {
                    const ok = app.client.$("#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a");
                    const click = await ok.click();
                    assert.ok(click);
                })
                //controlla se è stato creato l'indirizzo correttamente 
                it("Check if the new address has been created successfully", async () => {
                    var ok = false;
                    var address = null;
                    conn.select(1);
                    conn.get("thinman", function(err,res){
                        var ok = false;
                        address = JSON.parse(res).address;
                        address.forEach(element => {
                            if(element.address == newAddress.address){
                                if(element.port == newAddress.port && element.timeout == newAddress.timeout){
                                    ok = true;
                                } 
                            }
                        });
                        assert.ok(ok,"the new address has not been created successfully");
                    })
                })
            }
            
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
