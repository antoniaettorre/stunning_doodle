let Utils = {
    djb2: function(str){
        var hash = 5381;
        for (var i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
        }
        return hash;
    },
    hashStringToColor: function(str){
        var hash = Utils.djb2(str);
        var r = (hash & 0xFF0000) >> 16;
        var g = (hash & 0x00FF00) >> 8;
        var b = hash & 0x0000FF;
        return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
    },
    contrastColor: function(color) {
        var d = 0;
        // Counting the perceptive luminance - human eye favors green color...
        const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;

        if (luminance > 0.5)
            d = 0; // bright colors - black font
        else
            d = 255; // dark colors - white font

        return d3.rgb(d, d, d);
    },
    groupBy: function(arr, key) {
    return (arr || []).reduce((acc, x = {}) => ({
        ...acc,
        [x[key]]: [...acc[x[key]] || [], x]
    }), {})
}

}
export {Utils};
