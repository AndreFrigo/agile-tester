var Application = require('spectron').Application;
const {testList} = require ("./test-list.js");
const {global} = require ("./global.js");
const {db} = require ("./db.js");

//da impostare prima di eseguire
//path per la cartella Praim/Agile
const AGILE_PATH = "C:\\Program Files (x86)\\Praim\\Agile"

//apre l'applicazione prima di iniziare il test
before(function(done) {
    global.app = new Application({
        path: AGILE_PATH + '\\AgileConfigurator\\AgileConfigurator.exe',
    });
    global.app.start();
    done();
});

//chiude l'applicazione alla fine dei test
// after(function (done) {
//     if (app && app.isRunning()) {
//         app.stop();
//     }
//     done();
// });

var test = function(test){
    require(test);
}

describe("TEST", function () {
    
    //pausetta tra i vari test
    beforeEach(function(done){
        this.timeout(5000);
        setTimeout(done,4000);
    })

    before(async function(){    
        //connessione al database
        db.dbConnection();
        //aggiorno la lingua in base a quella del db
        global.language = await db.dbLanguage();
    })


    //INSERIRE QUI I TEST
    global.agileAddress.address= "test"
    test(testList.addThinmanAddress)
    test(testList.checkLanguage)
    test(testList.appIsRunning)
    test(testList.deleteThinmanAddress)
    global.agileAddress.address = "test"
    global.agileAddress.port = 1117
    test(testList.addThinmanAddress)
    global.agileUSB.pid = 9996
    test(testList.addUsbRedirection)
    test(testList.setEnglishLanguage)

    
});