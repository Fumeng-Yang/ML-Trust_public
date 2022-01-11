var meter = {}

meter.init = function (sessionName) {
    //------------------------------------------------------
    // will be called in the other javascript
    //------------------------------------------------------
    function toRadians(degrees) {
        var pi = Math.PI;
        return degrees * (pi / 180);
    }

    //---------------------------------------------------
    // init parameters
    //---------------------------------------------------
    var margin = 20
    var innerWidth = 450,
        innerHeight = 130
    var outerWidth = innerWidth + margin * 2;
    var outerHeight = innerHeight + margin * 2;
    var radius = innerHeight;
    var meterWidth = innerWidth * 0.03;
    var smallerRadius = radius - meterWidth
    var needleRadius = 10
    var cgx = (outerWidth / 2) - margin,
        cgy = outerHeight - margin



    // the label on the donut
    var ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    var MAX_NUM = 100,
        MAX_DEGREE = 180
    var startAngle = -Math.PI / 2,
        endAngle = Math.PI / 2
    var angleStep = Math.PI / (ticks.length - 1)
    var meterColor = "#444"

    // to hack a donut chart
    var dataset = [25, 25, 25, 25]
    var colors = ["#f2a922", "#f5ec1b", "#57e4c2", "#1db779"];

    var svg = d3.select('#trust-meter')
        .append('svg')
        .attr('width', outerWidth)
        .attr('height', outerHeight)
        .style("margin-top", "-30px")

    var g = svg.append('g')
        .attr('transform', 'translate(' + cgx + ',' + cgy + ')');

    //------------------------------------------
    // draw the donut
    //------------------------------------------
    var arc = d3.arc()
        .innerRadius(smallerRadius)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function (d) {
            return d;
        })
        .startAngle(startAngle)
        .endAngle(endAngle)
        .sort(null);

    var path = g.selectAll('path')
        .data(pie(dataset))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => {
            return colors[i];
        });

    // //------------------------------------------
    // // draw all the numbers
    // //------------------------------------------
    // var textLabels = ["Don't trust", "Very Skeptical", "Skeptical", "Slightly Skeptical", "Neutral",
    //     "Slightly trust", "Trust", "Mostly Trust", "Completely Trust"]
    // var angleStep2 = Math.PI / (textLabels.length - 1)
    // var textTick = g.selectAll(".textLabels")
    //     .data(textLabels)
    //     .enter()
    //     .append("text")
    //     .text(function (t) {
    //         return "" + t
    //     })
    //     .attr("x", function (t, i) {
    //         return -radius * 1.1 * Math.cos(angleStep2 * i)
    //     })
    //     .attr("y", function (t, i) {
    //         return -radius * 1.1 * Math.sin(angleStep2 * i)
    //     })
    //     // .attr("dx", "-0.5em")
    //     // .attr("dy", "0.2em")
    //     .attr("class", "ticksText")
    //     .style("font-size", "9pt")
    //     .style("text-anchor", function (d, i) {
    //         if (i < textLabels.length / 2 - 1)
    //             return "end"
    //         else if (i > textLabels.length / 2)
    //             return "start"
    //         else return "middle"
    //     })

    // ------------------------------------------
    // draw the three special words
    // ------------------------------------------
    var fontSize = 9
    var textLabels = [
        {
            "text": "Completely trust",
            "x": innerWidth / 2 + fontSize * 2,
            "y": 0,
            "anchor": "end"
        },
        {
            "text": "Neutral",
            "x": 0,
            "y": -innerHeight - fontSize,
            "anchor": "middle"
        },
        {
            "text": "Don't trust",
            "x": -innerWidth / 2 + fontSize,
            "y": 0,
            "anchor": "start"
        }
    ]
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
        .style("text-anchor", (d) => {
            return d.anchor
        })
        .style("font-size", fontSize + "pt")

    //------------------------------------------
    // draw all the bars
    //------------------------------------------
    var axes = g.selectAll(".axis")
        .data(ticks)
        .enter()
        .append("g")
        .attr("class", "axis")

    axes.append("line")
        .attr("x1", (d, i) => {
            return -radius * Math.cos(angleStep * i)
        })
        .attr("y1", (d, i) => {
            return -radius * Math.sin(angleStep * i)
        })
        .attr("x2", (d, i) => {
            return -(radius - meterWidth) * Math.cos(angleStep * i)
        })
        .attr("y2", (d, i) => {
            return -(radius - meterWidth) * Math.sin(angleStep * i)
        })
        .attr("class", "line")
        .style("stroke", "black")
        .style("stroke-width", "1px");

    //------------------------------------------
    // draw a needle
    //------------------------------------------
    // the read of the meter at the botto
    var needleReader = g.append("text")
        .attr("dx", 15).attr("dy", margin - 10)
        .attr("text-anchor", "middle")
        .attr("id", "meter-reader")
        .text(MAX_NUM / 2)
        .style("font-size", "0pt")
        .attr("color", "white")

    // draw a needle
    var needle = g
        .append("g")
        .attr("class", "needle")
        .attr("id", "meter-needle")

    needle.append("path")
        .attr("d", () => {
            return "M -" + needleRadius + " 0 L" + needleRadius + " 0 L 0 " + (-smallerRadius + needleRadius) + " Z";
        })
        .style("stroke", "none")
        .style("stroke-width", "none")
        .style("fill", meterColor)

    needle.append("circle")
        .attr("cx", 0).attr("cy", 0).attr("r", needleRadius)
        .style("fill", meterColor);


    var needlePre = g
        .append("g")
        .attr("class", "needle")
        .attr("id", "meter-needle")

    needlePre.append("path")
        .attr("d", () => {
            return "M -" + needleRadius + " 0 L" + needleRadius + " 0 L 0 " + (-smallerRadius + needleRadius) + " Z";
        })
        .style("stroke", "none")
        .style("stroke-width", "none")
        .style("fill", meterColor)
        .style("opacity", "0.15")

    needlePre.append("circle")
        .attr("cx", 0).attr("cy", 0).attr("r", needleRadius)
        .style("fill", meterColor)
        .style("opacity", "0.15")

    //------------------------------------------
    // definition mouse drag behavior
    //------------------------------------------
    svg.call(d3.drag().on("drag", () => {
        let e = d3.event.sourceEvent
        let mx = e.offsetX,
            my = e.offsetY

        let dx = mx - cgx,
            dy = my - cgy,
            dist = Math.sqrt(dx * dx + dy + dy)
        let theta = (Math.atan2(dy, dx) - startAngle) * MAX_DEGREE / Math.PI + startAngle;

        if (globalDebug)
            console.log("theta = " + theta)

        let meterRead = theta / MAX_DEGREE * MAX_NUM + MAX_NUM / 2
        if (meterRead > -0.5 && meterRead < MAX_NUM + 0.5) {
            needle.attr("transform", "rotate(" + theta + ")")
            d3.select("#meter-reader").text(Math.round(meterRead))
        }

        let subsessionIndex = Object.keys(data[sessionName]).length - 1 // using index as name
        let trialIndex = data[sessionName][subsessionIndex].length - 1
        if (!data[sessionName][subsessionIndex][trialIndex].meterChanges)
            data[sessionName][subsessionIndex][trialIndex].meterChanges = []
        else {
            data[sessionName][subsessionIndex][trialIndex].meterChanges.push({
                "timestamp": new Date().getTime(),
                "trust": meterRead,
                "theta": theta,
                "x": mx,
                "y": my,
                "px": e.pageX,
                "py": e.pageY
            })
        }
    }))
}

meter.resetMeter = function () {
    d3.select("#meter-needle").attr("transform", "rotate(0)")
    d3.select("#meter-reader").text("50")
}

meter.read = function () {
    return -1 || d3.select("#meter-reader").text()
}