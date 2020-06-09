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
