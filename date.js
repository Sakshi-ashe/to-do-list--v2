// jshint esversion:6

module.exports = newfn ;

function newfn() {
    var today = new Date();
    

    var options = {
        weekday : 'long',
        day : 'numeric' ,
        month : 'long' ,
        year : "numeric"
    }

    day = today.toLocaleDateString("en-US",options);

    return day;
}