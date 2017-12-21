var alphabet = "0123456789abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var base = alphabet.length;


//convert base10 ro base58
//map and encode to alphabet
function encode(num){   
    num = parseInt(num);
    console.log(`encode function: ${num}`);
    var encoded = '';
    
    while(num){
        var remainder = num % base;
        num = Math.floor(num/base);
        
        console.log(`base58 data: ${num} -- ${remainder}`);
        encoded = alphabet[remainder].toString() + encoded;
    }
    return encoded;
}
    
//decode short url to its original long
function decode(str){
    var decoded = 0;
    while(str) {
        var index = alphabet.indexOf(str[0]);
        var power = str.length - 1;
        decode += index * (Math.pow(base,power));
        console.log(`base58 data: ${decoded} --  ${str} -- ${power} -- ${index} `);
        str = str.slice(1);
    }
    return decoded;
}

module.exports.encode = encode;
module.exports.decode = decode;