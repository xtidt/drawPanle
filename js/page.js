var vm = new Vue({
    el: "#tool",
    data: {
        tools: [
            { type: 0, name: "画笔", icon: "icon-pen" },
            { type: 1, name: "马克笔", icon: "icon-mark" },
            { type: 2, name: "橡皮擦", icon: "icon-easer" },
        ],
        colors: [
            "red",
            "Orange",
            "Yellow",
            "SpringGreen",
            "LightSkyBlue",
            "Blue",
            "Magenta"
        ],
        currentData: {
            tool: 0,
            color: 0
        },
        showToolPlane: false,
        showColorPlane: false
    },
    methods: {
        selectTool: function() {
            this.showToolPlane = true;
        },

        selectColor: function() {
            this.showColorPlane = true;
        },

        pickTool: function(dom) {
            this.currentData.tool = dom.item.type;
            this.showToolPlane = false;
            app.changeTool(dom.item.type);
        },

        pickColor: function(index) {
            this.currentData.color = index;
            this.showColorPlane = false;
            app.changeColor(this.colors[index]);
        },
    }
});


app.init({
    container: '#canvasDiv'
});