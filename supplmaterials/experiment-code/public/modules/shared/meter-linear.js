var meter = {}

//---------------------------------------------------
// init parameters
//---------------------------------------------------
var margintop = 35, marginbottom = 20, marginleft = 35, marginright = 52
var innerWidth = 30,
    innerHeight = 600
var outerWidth = innerWidth + marginleft + marginright;
var outerHeight = innerHeight + margintop + marginbottom;
var meterStartX = innerWidth / 2 - 4
var meterStartY = 0
var meterHeight = innerHeight
var meterHalfHeight = meterHeight / 2
var meterWidth = innerWidth
var needleSize = 330
var needleX = (meterWidth + Math.sqrt(needleSize) + 10)
var needleY = meterHeight / 2
var fontSize = 13.5
var needleTextX = meterWidth / 2 + fontSize - 2
var needleTextOffSet = -2
var needleYOffSet = 0.5
var meterStroke = 0.25
var tickX = meterStartX - 0.5
var TOTAL_NUM = 100
var textColor = "#2B2D34"
var step = innerHeight / (TOTAL_NUM * 2)


var meterColor = "#efeeee",
    fillColor = "#0083f8",
    meterBorderColor = "#545454",
    needleTextColor = "white",
    needleColor = "#efeeee",//"#dedddd",
    needleTrustColor = "#0083f8",
    needleDisTrustColor = "#777777", //545454
    needleActiveColor = needleTrustColor

// the label on the meter
var ticks = []
for (var i = 0; i <= TOTAL_NUM * 2; i++) {
    if (i == 0) ticks.push({ "n": 0.15, "w": 10, "s": 0.5 })
    else if (i == TOTAL_NUM * 2) ticks.push({ "n": 199.85, "w": 10, "s": 0.5 })
    else if (i == TOTAL_NUM) ticks.push({ "neutral": true, "n": 100, "w": 14, "s": 1.25 })
    else if (i % TOTAL_NUM / 2 == 0) ticks.push({ "n": i, "w": 12, "s": 1.0 })
    // else if (i % 50 == 0) ticks.push({ "n":i, "w": 8, "s": 0.75 })
    else if (i % 10 == 0) ticks.push({ "n": i, "w": 6, "s": 0.5 })
    else if (i % 1 == 0) ticks.push({ "n": i, "w": 2, "s": 0.4 })
}

function relatedInit(sessionName) {
    d3.select("#trust-more-button")
        .on("click", () => {
            let q
            if (sessionName == "main") {
                console.log(data[sessionName])
                let l1 = data[sessionName].length
                let l2 = data[sessionName][l1 - 1].length
                if (!data[sessionName][l1 - 1][l2 - 1].meterChanges) {
                    data[sessionName][l1 - 1][l2 - 1].meterChanges = []
                }
                q = data[sessionName][l1 - 1][l2 - 1].meterChanges
            } else {
                if (!data[sessionName].meterChanges) {
                    data[sessionName].meterChanges = []
                }
                q = data[sessionName].meterChanges
            }

            let status = sessionName
            if (sessionName == "main") {
                let subSessionIndex = Object.keys(data[sessionName]).length - 1 // using index as name
                let trialIndex = data[sessionName][subSessionIndex].length - 1
                let statusIndex = data[sessionName][subSessionIndex][trialIndex]["trialStatus"].length - 1
                status = data[sessionName][subSessionIndex][trialIndex]["trialStatus"][statusIndex]
            }
            q.push({ "timestamp": new Date().getTime(), "before": meter.read(), "read": meter.read(), "way": "increase5", "status": status })
            meter.increase5()
        })
        .style("cursor", "pointer")
        .on("mouseover", () => {
            d3.select("#trust-more-button").style("opacity", 0.5)
        })
        .on("mouseout", () => {
            d3.select("#trust-more-button").style("opacity", 1)
        })



    d3.select("#trust-less-button")
        .style("cursor", "pointer")
        .on("click", () => {
            let q
            if (sessionName == "main") {
                let l1 = data[sessionName].length
                let l2 = data[sessionName][l1 - 1].length
                if (!data[sessionName][l1 - 1][l2 - 1].meterChanges) {
                    data[sessionName][l1 - 1][l2 - 1].meterChanges = []
                }
                q = data[sessionName][l1 - 1][l2 - 1].meterChanges
            } else {
                if (!data[sessionName].meterChanges) {
                    data[sessionName].meterChanges = []
                }
                q = data[sessionName].meterChanges
            }
            let status = sessionName
            if (sessionName == "main") {
                let subSessionIndex = Object.keys(data[sessionName]).length - 1 // using index as name
                let trialIndex = data[sessionName][subSessionIndex].length - 1
                let statusIndex = data[sessionName][subSessionIndex][trialIndex]["trialStatus"].length - 1
                status = data[sessionName][subSessionIndex][trialIndex]["trialStatus"][statusIndex]
            }
            q.push({ "timestamp": new Date().getTime(), "read": meter.read(), "status": status, "before": meter.read(), "way": "decrease5" })
            meter.decrease5()
        })
        .on("mouseover", () => {
            d3.select("#trust-less-button").style("opacity", 0.5)
        })
        .on("mouseout", () => {
            d3.select("#trust-less-button").style("opacity", 1)
        })
}


meter.init = function (sessionName) {
    // console.log(sessionName)

    relatedInit(sessionName);

    var svg = d3.select('#trust-meter-linear')
        .append('svg')
        .attr('width', outerWidth)
        .attr('height', outerHeight)
        .attr("id", 'meter-canvas')

    var g = svg.append('g')
        .attr('transform', 'translate(' + marginleft + ',' + margintop + ')')
        .attr("id", "meter-bar")

    var backgroundMeter = g.append("rect")
        .attr("x", meterStartX)
        .attr("y", meterStartY)
        .attr("width", meterWidth)
        .attr("height", meterHeight)
        .style("fill", meterColor)
        .style("stroke", meterBorderColor)
        .style("stroke-width", meterStroke + "px")
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("id", "backgroundMeter")

    var foregroundMeter = g.append("rect")
        .attr("x", meterStartX + meterStroke)
        .attr("y", meterHeight)
        .attr("width", meterWidth - 2 * meterStroke)
        .attr("height", 0)
        .style("fill", needleActiveColor)
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("id", "foregroundMeter")


    // ------------------------------------------
    // draw the three special words
    // ------------------------------------------
    var textLabels = [
        {
            "text": "completely trust",
            "x": meterStartX - 35,
            "y": -fontSize / 1.65,
            "fontSize": 12,
            "color": "black"
        },
        {
            "text": "completely distrust",
            "x": meterStartX - 43,
            "y": innerHeight + fontSize / 1.4,
            "fontSize": 12,
            "color": "black"
        },
        {
            "text": "+100",
            "x": meterStartX + innerWidth + 2,
            "y": 3,
            "fontSize": 9,
            "color": meterBorderColor
        },
        {
            "text": "-100",
            "x": meterStartX + innerWidth + 3,
            "y": innerHeight - 3,
            "fontSize": 9,
            "color": meterBorderColor
        }
    ]

    g.selectAll(".ticks")
        .data(ticks)
        .enter()
        .append("line")
        .attr("x1", (d) => {
            if (d["neutral"])
                return tickX + meterWidth + 13
            else
                return tickX
        })
        .attr("y1", (d) => {
            return innerHeight * (+d.n / (TOTAL_NUM * 2))
        })
        .attr("x2", (d, i) => {
            return tickX - +d.w
        })
        .attr("y2", (d) => {
            return innerHeight * (+d.n / (TOTAL_NUM * 2))
        })
        // .style("fill", meterBorderColor)
        .style("stroke", meterBorderColor)
        .style("stroke-width", (d) => { return d.s })

    g.selectAll(".textLabels")
        .data(textLabels)
        .enter()
        .append("text")
        .text((d) => {
            return d.text;
        })
        .attr("x", (d) => {
            return d.x
        })
        .attr("y", (d) => {
            return d.y + 3
        })
        .style("font-size", (d) => { return d.fontSize })
        .style("text-anchor", (d) => {
            return d.anchor
        })
        .style("fill", (d) => { return d.color })
    // .style("stroke", (d) => { return d.color })


    // //------------------------------------------
    // // draw a needle
    // //------------------------------------------
    // // the read of the meter at the botto
    var needleReaderNum = g.append("text")
        .attr("x", needleTextX)
        .attr("y", needleY + needleTextOffSet)
        .style("scale", 0.5)
        .style("text-anchor", "middle")
        .attr("id", "meter-reader-num")
        .attr("class", "meter-reader")
        .style("font-size", fontSize)
        .style("font-weight", "bold")
        .style("fill", needleTextColor)
        .style("opacity", 0.8)
        // .style("stroke-size", "0")
        // .style("font-weight", "bold")
        .text("0")

    // var needleReaderPerc = g.append("text")
    //     .attr("x", needleTextX)
    //     .attr("y", needleY + needleTextOffSet)
    //     .style("scale", 0.5)
    //     .attr("dx", "10px")
    //     .style("text-anchor", "right")
    //     .attr("id", "meter-reader-perc")
    //     .attr("class", "meter-reader")
    //     .style("font-size", fontSize - 4)
    //     .style("stroke", needleTextColor)
    //     .style("opacity", 0.8)
    //     .style("stroke-size", "0")
    //     .style("font-weight", "light")
    //     .text("%")

    // // draw a needle
    var symbol = d3.symbol().size([needleSize])

    var needle = g.append("path")
        .attr("d", symbol.type(d3.symbolTriangle))
        .attr("transform", "translate(" + needleX + "," + (needleY + needleYOffSet) + ")" + " scale(1, 0.75) rotate(-90, 0, 0) ")
        .style("stroke", meterBorderColor)
        .style("stroke-width", "0.25pt")
        .style("fill", needleColor)
        .attr("size", needleSize)
        .attr("id", "meter-needle")
        .on("mouseover", (d, i) => {
            if (meter.read() != 0)
                d3.select("#meter-needle").style("fill", needleActiveColor);
            else
                d3.select("#meter-needle").style("fill", "white");
        })
        .on("mouseout", (d, i) => {
            d3.select("#meter-needle").style("fill", needleColor);
        })


    // //------------------------------------------
    // // definition mouse drag behavior
    // //------------------------------------------
    g.call(d3.drag().on("start", () => {
        d3.select("#meter-needle").style("fill", needleActiveColor);
    })
        .on("end", () => {
            d3.select("#meter-needle").style("fill", needleColor)

            let box = d3.select("#meter-canvas").node().getBBox()
            let currY = d3.event.y - margintop

            currY = currY < 0 ? 0 : currY
            currY = currY > (meterHeight + meterStartY) ? (meterHeight + meterStartY) : currY

            let currHeight = (meterHalfHeight - currY)
            currHeight = currHeight < -meterHalfHeight ? -meterHalfHeight : currHeight
            currHeight = currHeight > meterHalfHeight ? meterHalfHeight : currHeight

            let finalPerc = currHeight / meterHalfHeight
            currHeight = finalPerc * step * TOTAL_NUM
            let finalReader = Math.round(finalPerc * 100)
            // console.log("finalReader: " + finalReader)
            currY = meterHalfHeight - currHeight
            let newneedleY = currY
            if (currHeight > 0) {
                needleActiveColor = needleTrustColor
                d3.select("#meter-reader-num").text(Math.round(finalReader))
                d3.selectAll(".meter-reader").attr("y", (newneedleY + fontSize)).style("fill", needleTextColor)
                foregroundMeter.attr("y", currY).attr("height", currHeight).style("fill", needleActiveColor)
                d3.select("#meter-needle").attr("transform", "translate(" + needleX + "," + (newneedleY + needleYOffSet) + ")" + " scale(1, 0.75)  rotate(-90, 0, 0)")
            } else {
                needleActiveColor = needleDisTrustColor
                d3.select("#meter-reader-num").text(Math.round(finalReader))
                d3.selectAll(".meter-reader").attr("y", (newneedleY - fontSize / 3)).style("fill", needleTextColor)
                foregroundMeter.attr("y", meterHalfHeight).attr("height", -currHeight).style("fill", needleActiveColor)
                d3.select("#meter-needle").attr("transform", "translate(" + needleX + "," + (newneedleY - needleYOffSet) + ")" + " scale(1, 0.75)  rotate(-90, 0, 0)")

            }
        })
        .on("drag", () => {
            d3.select("#meter-needle").style("fill", needleActiveColor);
            let box = d3.select("#meter-canvas").node().getBBox()
            let currY = d3.event.y - margintop

            currY = currY < 0 ? 0 : currY
            currY = currY > (meterHeight + meterStartY) ? (meterHeight + meterStartY) : currY
            let currHeight = (meterHalfHeight - currY)

            currHeight = currHeight < -meterHalfHeight ? -meterHalfHeight : currHeight
            currHeight = currHeight > meterHalfHeight ? meterHalfHeight : currHeight
            let currPerc = (currHeight / meterHalfHeight)
            currHeight = currPerc * step * TOTAL_NUM
            let currReader = Math.round(currPerc * 100)
            if (globalDebug) console.log("currReader: " + currReader)
            currY = meterHalfHeight - currHeight
            let newneedleY = currY

            if (currHeight > 0) {
                needleActiveColor = needleTrustColor
                d3.select("#meter-reader-num").text(Math.round(currReader))
                d3.selectAll(".meter-reader").attr("y", (newneedleY + fontSize)).style("fill", needleTextColor)
                foregroundMeter.attr("y", currY).attr("height", currHeight).style("fill", needleActiveColor)
                d3.select("#meter-needle").attr("transform", "translate(" + needleX + "," + newneedleY + ")" + " scale(1, 0.75)  rotate(-90, 0, 0)")

            } else {
                needleActiveColor = needleDisTrustColor
                d3.select("#meter-reader-num").text(Math.round(currReader))
                d3.selectAll(".meter-reader").attr("y", (newneedleY - fontSize / 3)).style("fill", needleTextColor)
                foregroundMeter.attr("y", meterHalfHeight).attr("height", -currHeight).style("fill", needleActiveColor)
                d3.select("#meter-needle").attr("transform", "translate(" + needleX + "," + newneedleY + ")" + " scale(1, 0.75)  rotate(-90, 0, 0)")

            }
            if (sessionName == "main") {
                let subSessionIndex = Object.keys(data[sessionName]).length - 1 // using index as name
                let trialIndex = data[sessionName][subSessionIndex].length - 1
                let statusIndex = data[sessionName][subSessionIndex][trialIndex]["trialStatus"].length - 1
                let status = data[sessionName][subSessionIndex][trialIndex]["trialStatus"][statusIndex]
                if (!data[sessionName][subSessionIndex][trialIndex].meterChanges)
                    data[sessionName][subSessionIndex][trialIndex].meterChanges = []
                else {
                    data[sessionName][subSessionIndex][trialIndex].meterChanges.push({
                        "timestamp": new Date().getTime(),
                        "x": d3.event.x,
                        "y": d3.event.y,
                        "px": d3.event.sourceEvent.pageX,
                        "py": d3.event.sourceEvent.pageY,
                        "way": "drag",
                        "read": this.read(),
                        "status": status
                    })
                }
            } else {
                if (!data[sessionName].meterChanges)
                    data[sessionName].meterChanges = []
                data[sessionName].meterChanges.push({
                    "timestamp": new Date().getTime(),
                    "x": d3.event.x,
                    "y": d3.event.y,
                    "px": d3.event.sourceEvent.pageX,
                    "py": d3.event.sourceEvent.pageY,
                    "read": this.read(),
                    "status": status
                })
            }
        }))
}

meter.reset = function () {

    needleActiveColor = needleTrustColor

    d3.select("#meter-reader-num").text("0")

    d3.selectAll(".meter-reader")
        .attr("x", needleTextX)
        .attr("y", needleY)
        .style("fill", needleTextColor)

    d3.select("#meter-needle")
        .attr("transform", "translate(" + needleX + "," + needleY + ")" + " scale(1, 0.75) rotate(-90, 0, 0)")

    d3.select("#foregroundMeter").attr("x", meterStartX + meterStroke)
        .attr("y", meterHalfHeight)
        .attr("width", meterWidth - 2 * meterStroke)
        .attr("height", 0)
}

meter.setMeter = function (num) {

    if (num >= -100 && num <= 100) {
        let height = num / 100 * meterHalfHeight
        let newneedleY = meterHalfHeight - height

        d3.select("#meter-reader-num").text(num)


        if (num >= 0) {
            needleActiveColor = needleTrustColor

            d3.selectAll(".meter-reader")
                .attr("y", newneedleY + fontSize)
                .style("fill", needleTextColor)

            d3.select("#meter-needle")
                .attr("transform", "translate(" + needleX + "," + newneedleY + ")" + " scale(1, 0.75)  rotate(-90, 0, 0)")

            d3.select("#foregroundMeter").attr("x", meterStartX + meterStroke)
                .attr("y", newneedleY)
                .attr("height", height)
                .style("fill", needleActiveColor)
        } else {
            needleActiveColor = needleDisTrustColor

            d3.selectAll(".meter-reader")
                .attr("y", newneedleY - fontSize / 3)
                .style("fill", needleTextColor)

            d3.select("#meter-needle")
                .attr("transform", "translate(" + needleX + "," + newneedleY + ")" + " scale(1, 0.75)  rotate(-90, 0, 0)")

            d3.select("#foregroundMeter").attr("x", meterStartX + meterStroke)
                .attr("y", meterHalfHeight)
                .attr("height", -height)
                .style("fill", needleActiveColor)
        }
    }
}

meter.read = function () {
    let text = d3.select("#meter-reader-num").text()
    return +text
}

meter.flash = function () {
    d3.select("#div-trust-meter") //div-trust-meter
        .transition()
        .style("opacity", data["animationOpacity"])
        .duration(data['animationTime'])
        .transition()
        .style("opacity", 1)
        .duration(data['animationTime'])
}


meter.increase5 = function () {
    let num = this.read()

    num += 5
    if (num >= 100) num = 100

    this.setMeter(num)

}


meter.decrease5 = function () {
    let num = this.read()

    num -= 5
    if (num <= -100) num = 0

    this.setMeter(num)
}



meter.read = function () {
    var t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

    let text = d3.select("#meter-reader-num").text()
    return +text
}