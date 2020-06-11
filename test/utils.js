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
    }
}
module.exports = {utils};