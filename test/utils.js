const utils={
    //input: 
        //list: list of address
        //hostname: hostname of the address to find 
    //output:
        //address to find (object), null if no address is found
    getThinManFromHostname: function(list, hostname){
        var elem = null;
        list.forEach(element => {
            if(element.address == hostname){
                elem = element;
            }
        });
        return elem;
    },
    getJsonFromDb: function(conn, par1, par2){
        conn.select(1);
        conn.get(par1, function(err,res){
            var r = JSON.parse(res).par2;
            return r;
        })
    }
}
module.exports = {utils};