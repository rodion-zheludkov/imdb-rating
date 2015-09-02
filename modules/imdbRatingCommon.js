var EXPORTED_SYMBOLS = [ "ImdbRating" ];

if ("undefined" == typeof(ImdbRating)) {
    var ImdbRating = {
        arrayIndexOf: function(array, obj) {
            var result = -1;
            for (var i = 0; i < array.length; i++) {
                if (array[i] == obj) {
                    result = i;
                    break;
                }
            }
            return result;
        },

        arrayContains: function(array, obj) {
            return (this.arrayIndexOf(array, obj) >= 0);
        },

        arrayAppend: function(array, obj, nodup) {
           if (!(nodup && this.arrayContains(array, obj))) {
               array[array.length]=obj;
           }
           return array;
        },

        arrayRemove: function(array, s) {
            for(i = 0; i < array.length; i++) {
                if(s == array[i]) {
                    return array.splice(i, 1);
                }
            }
        },

        arrayClear: function(array) {
            array.length = 0;
        },

        stringTrim: function(s) {
            return s.replace(/^\s+|\s+$/g,"");
        }
        
    };
};
