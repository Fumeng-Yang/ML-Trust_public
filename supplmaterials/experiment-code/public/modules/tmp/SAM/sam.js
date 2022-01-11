var sam = function (sessionName) {
    // data is the global variable
    // it should be defined before this function is called..

    data["timestamps"][sessionName] = {}
    data[sessionName] = {}

    data["timestamps"][sessionName]["loadingTime"] = new Date().getTime()

    var log = {}

    d3.selectAll("img")
        .attr("width", "120px")
        .style("margin-bottom", "-5px")

    d3.select("#warning-msg")
        .style("visibility", "hidden")

    d3.selectAll('input')
        .filter(function (d) {
            return this.name === 'sam-valence' ? this : null;
        })
        .on('change', function () {
            log.sam_valence = this.value;
        });

    d3.selectAll('input')
        .filter(function (d) {
            return this.name === 'sam-arousal' ? this : null;
        })
        .on('change', function () {
            log.sam_arousal = this.value;
        });

    d3.selectAll('input')
        .filter(function (d) {
            return this.name === 'sam-dominance' ? this : null;
        })
        .on('change', function () {
            log.sam_dominance = this.value;
        });


    d3.select("#next-button")
        .on("click", () => {
            if ((log.sam_valence && log.sam_arousal && log.sam_dominance) || globalDebug) {
                data[sessionName]['sam_valence'] = log['sam_valence']
                data[sessionName]['sam_arousal'] = log['sam_arousal']
                data[sessionName]['sam_dominance'] = log['sam_dominance']
                data["timestamps"][sessionName]["finishTime"] = new Date().getTime()
                experimentr.addData(data);
                experimentr.next()
            } else {
                data["timestamps"][sessionName]["warningTime"] = new Date().getTime()
                d3.select("#warning-msg")
                    .style("visibility", "visible")

                setTimeout(() => {
                    d3.select("#warning-msg")
                        .style("visibility", "hidden")
                }, settings.warningTime)
            }
        })
}