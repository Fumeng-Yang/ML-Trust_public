var trial = function (sessionName, experimentIndex) {

    // build the trials

    var totalTrial = 0, acctTrial = 0;

    //----------------------------------------------------------------------
    // create containers to hold the data
    //----------------------------------------------------------------------
    data[sessionName] = []
    data["timestamps"][sessionName] = {}
    var timestampsHolder = data["timestamps"][sessionName]

    timestampsHolder["load" + sessionName] = new Date().getTime()

    if (globalDebug) console.log("loading " + sessionName + " " + new Date().getTime());

    //----------------------------------------------------------------------
    // init the setup
    //----------------------------------------------------------------------
    var trialIndex = 0,
        subSessionIndex = 0,
        trialStatus = "recommendation",
        sessionStatus = "practice"

    var currSessions = data["sessions"]
    var currSettings = currSessions[subSessionIndex]
    var currDataset = currSettings.dataset; // images vs radars
    var currSequence = currSettings.sequence;
    var currCondition = currSettings.condition;

    currSessions.forEach((s) => {
        totalTrial += s.sequence.length
    })

    // console.log("totalTrial " + totalTrial)

    //----------------------------------------------------------------------
    // hide the next button
    //----------------------------------------------------------------------
    experimentr.hideNext()

    d3.select("#continuity")
        .style("display", "none")

    // hide warning msg
    d3.select("#questions-warning").style("display", "none")

    d3.select("#interlude")
        .style("display", "none")

    d3.select("#practiceend")
        .style("display", "none")

    // this is a hack...
    d3.selectAll("input")
        .style("margin-left", "0pt")

    //----------------------------------------------------------------------
    // display explanations
    //----------------------------------------------------------------------
    buildVisExplanation()
    buildTrial()
    meter.reset()

    // init
    d3.select("#classifier-explanation")
        .style("display", "block")

    //----------------------------------------------------------------------
    //  the next button for introduction of vis
    //----------------------------------------------------------------------

    d3.select("#intro-vis-next")
        .on("click", () => {
            //----------------------------------------------------------------------
            // build the interface, the first trial of the entire session
            //----------------------------------------------------------------------
            d3.selectAll(".curtain")
                .style("display", "none")

            d3.select("#continuity")
                .style("display", "block")


            d3.select("#subtitle-in-header")
                .text("(practice)")

            d3.selectAll(".classifier-index")
                .text((subSessionIndex + 1))

            data["timestamps"][sessionName]["clickIntroVisNext" + subSessionIndex + "Time"] = new Date().getTime()
            data["timestamps"][sessionName]["realLoadingPart" + subSessionIndex + "LoadingTime"] = new Date().getTime()
            sessionStatus = "practice"
        })

    //----------------------------------------------------------------------
    // define the actions on the first submit button
    //----------------------------------------------------------------------

    d3.select("#interlude-next").on("click", () => {

        d3.selectAll(".curtain")
            .style("display", "none")

        buildVisExplanation()

        d3.select("#classifier-explanation")
            .style("display", "block")

        d3.select("#continuity")
            .style("display", "none")

        d3.select("#session-in-header")
            .text(() => { return "Classifier " + (subSessionIndex + 1) })

        data["timestamps"][sessionName]["clickInterludeNext" + subSessionIndex + "Time"] = new Date().getTime()
    })

    d3.select("#sessionend-button").on("click", () => {

        d3.selectAll(".curtain")
            .style("display", "none")

        data["timestamps"][sessionName]["clickSessionEndTime"] = new Date().getTime()

        experimentr.addData(data)
        experimentr.next()
    })

    d3.select("#practiceend-button").on("click", () => {
        d3.selectAll(".curtain")
            .style("display", "none")

        d3.select("#continuity")
            .style("display", "block")

        d3.select("#session-in-header")
            .text(() => {
                return " Classifier " + (subSessionIndex + 1)
            })

        d3.select("#subtitle-in-header")
            .text("(main)")

        sessionStatus = "main"

        data["timestamps"][sessionName]["clickPracticeNext" + subSessionIndex + "Time"] = new Date().getTime()

    })

    function flashReminder(delay = 0) {
        setTimeout(() => {
            meter.flash();
            d3.selectAll(".adjust-trust-meter-reminder")
                .transition()
                .style("opacity", data["animationOpacity"])
                .duration(data['animationTime'])
                .transition()
                .style("opacity", 1)
                .duration(data['animationTime'])
        }, delay);
    }

    //------------------------------------------------------
    // flash the meter when click on anything...
    //------------------------------------------------------

    d3.selectAll("input[type=radio]")
        .on("change", () => {
            flashReminder(0)
        })


    d3.select("#submit-button")
        .on("click", function () {

            // meter.flash()
            console.log("subsession/trial: " + subSessionIndex + "/" + trialIndex)

            if (trialStatus == "recommendation") {
                let n1, n2, n3// if they have unfinished question

                if (((n1 = d3.select("input[name='follow_question']:checked").node()) &&
                    (n2 = d3.select("input[name='comfort_decision']:checked").node()) &&
                    (n3 = d3.select("input[name='helpful_scale']:checked").node() ||
                        currCondition == "control")) || globalDebug) {

                    // read the memter
                    if (globalDebug) console.log(meter.read())
                    data[sessionName][subSessionIndex][trialIndex]['condition'] = currCondition
                    data[sessionName][subSessionIndex][trialIndex]['representation'] = currDataset
                    data[sessionName][subSessionIndex][trialIndex]['sessionStatus'] = sessionStatus
                    data[sessionName][subSessionIndex][trialIndex]['firstMeterReadTime'] = new Date().getTime()
                    data[sessionName][subSessionIndex][trialIndex]['firstMeterRead'] = meter.read()

                    data[sessionName][subSessionIndex][trialIndex]['followRecommendation'] = n1 ? n1.value : "NA"
                    data[sessionName][subSessionIndex][trialIndex]['comfortDecision'] = n2 ? n2.value : "NA"
                    data[sessionName][subSessionIndex][trialIndex]['explanHelpful'] = n3 ? n3.value : "NA"

                    data[sessionName][subSessionIndex][trialIndex]["trialStatus"].push(trialStatus)

                    d3.selectAll(".trial-step2")
                        .style("display", "block")

                    d3.selectAll(".trial-step1")
                        .style("display", "none")

                    if (globalDebug) console.log(data)

                    let currTrialResult = data[sessionName][subSessionIndex][trialIndex]
                    // clean up the machine recommendation
                    let trialData = currSequence[trialIndex]

                    let feedbackText = trialData['recommendationCorrectnessDescription']
                    feedbackText += trialData['actualClassDescription']

                    feedbackText += "<br>"

                    if (trialData.predCorrectness == true && currTrialResult.followRecommendation == "follow_recommendation") {
                        feedbackText += data['settings']['recommendationCorrectFollowFeedback']
                        data[sessionName][subSessionIndex][trialIndex]['decisionCorrectness'] = true;
                    }
                    if (trialData.predCorrectness == true && currTrialResult.followRecommendation == "reject_recommendation") {
                        feedbackText += data['settings']['recommendationCorrectNotFollowFeedback']
                        data[sessionName][subSessionIndex][trialIndex]['decisionCorrectness'] = false;
                    }
                    if (trialData.predCorrectness == false && currTrialResult.followRecommendation == "follow_recommendation") {
                        feedbackText += data['settings']['recommendationIncorrectFollowFeedback']
                        data[sessionName][subSessionIndex][trialIndex]['decisionCorrectness'] = false;
                    }
                    if (trialData.predCorrectness == false && currTrialResult.followRecommendation == "reject_recommendation") {
                        feedbackText += data['settings']['recommendationIncorrectNotFollowFeedback']
                        data[sessionName][subSessionIndex][trialIndex]['decisionCorrectness'] = true;
                    }

                    feedbackText += "<br> <br> <span class=\"color-font adjust-trust-meter-reminde\">" + trialData.practiceText + "</span>"

                    d3.select("#pred-correctness").style("visibility", "visible")
                        .append("div").html(feedbackText).style("margin", "5pt")
                        .attr("class", "feedbackcontainer")

                    let delayTime = data["settings"]["waitClickTime"]

                    flashReminder(delayTime)

                    //.attr("class", "bigger-font")
                    //.attr("class", "question-header")
                    // border: 0.5px solid white;
                    // border-radius: 3px;


                    trialStatus = "feedback"
                    data[sessionName][subSessionIndex][trialIndex]["trialStatus"].push(trialStatus)

                } else {
                    data[sessionName][subSessionIndex][trialIndex]['firstWarning'] = new Date().getTime()
                    d3.select("#questions-warning").style("display", "inline")

                    setTimeout(() => {
                        d3.select("#questions-warning").style("display", "none")
                    }, data['settings']['warningTime'])

                    if (globalDebug) console.log(data)
                }

            } else if (trialStatus == "feedback") {
                let time = new Date().getTime()
                let lastReadTime = data[sessionName][subSessionIndex][trialIndex]['firstMeterReadTime']
                //wait for five seconds
                if (time - +lastReadTime > data['settings']['waitClickTime']) {
                    data[sessionName][subSessionIndex][trialIndex]['secondMeterReadTime'] = new Date().getTime()
                    data[sessionName][subSessionIndex][trialIndex]['secondMeterRead'] = meter.read()
                    data[sessionName][subSessionIndex][trialIndex]["finishing"] = new Date().getTime()
                    if (globalDebug) console.log(data)
                    updateIndice()
                    buildTrial()
                }
                // log data
            }
            d3.selectAll(".classifier-index")
                .text((subSessionIndex + 1))
        })


    //----------------------------------------------------------------------
    // load the explanation and text
    //----------------------------------------------------------------------

    function buildVisExplanation() {
        d3.select("#vis-intro")
            .html(currSettings.explanationIntro)

        d3.select("#vis-explanation")
            .attr("src", "files/vis/" + currCondition + "-" + currDataset + "-explanation.png")
            .attr("width", "950px")
            .style("display", "block")
    }
    //----------------------------------------------------------------------
    // update the indices after each trial
    //----------------------------------------------------------------------
    function updateIndice() {
        if (globalDebug) console.log("trialIndex is " + trialIndex)

        if (trialIndex >= currSequence.length - 1 && subSessionIndex >= currSessions.length - 1) {
            // finish all the subsessions 
            if (globalDebug) console.log("finish this session")

            data["timestamps"][sessionName]["finishPart3Time"] = data["timestamps"][sessionName]["finish" + sessionName] = new Date().getTime()
            trialStatus = "sessionend"

            data[sessionName][subSessionIndex][trialIndex]["trialStatus"].push(trialStatus)

            d3.selectAll(".curtain")
                .style("display", "none")

            d3.select("#sessionend")
                .style("display", "block")

            d3.select("#continuity")
                .style("display", "none")

        } else if (trialIndex == currSettings.trainingThreshold - 1) {
            d3.selectAll(".curtain")
                .style("display", "none")

            d3.select("#practiceend")
                .style("display", "block")

            d3.select("#continuity")
                .style("display", "none")

            d3.select("#subtitle-in-header")
                .text("")

            meter.reset()

            trialIndex++
            trialStatus = "recommendation"

        } else if (trialIndex >= currSequence.length - 1) {

            // reset the meter
            meter.reset()

            data["timestamps"][sessionName]["finishPart" + subSessionIndex + "Time"] = new Date().getTime()

            d3.selectAll(".curtain")
                .style("display", "none")

            d3.select("#interlude")
                .style("display", "block")

            d3.select("#continuity")
                .style("display", "none")

            d3.select("#session-in-header")
                .text((() => { return "Classifier " + (subSessionIndex + 2) }))

            d3.select("#subtitle-in-header")
                .text("")

            d3.select("#interlude-next")
                .attr("disabled", true)

            let breakTime = 60 //s
            d3.select("#timer").text("1 m 0 s")
            let inv = setInterval(() => {
                breakTime--
                d3.select("#timer").text(() => {
                    let min = Math.floor(breakTime / 60)
                    let sec = breakTime % 60
                    if (min >= 0 && sec >= 0)
                        return min + " m " + sec + " s"
                    else
                        return " 0 m 0 s"
                })
            }, 1000)

            setTimeout(() => {
                window.clearInterval(inv)
                d3.select("#interlude-next")
                    .attr("disabled", null)

            }, breakTime * 1000 + 1000)


            if (globalDebug) console.log("finish this subsession")
            // alert("finished a session")
            trialIndex = 0;
            subSessionIndex++

            currSettings = currSessions[subSessionIndex];
            currSequence = currSettings.sequence;
            currCondition = currSettings.condition;

            data["timestamps"][sessionName]["loadPart" + subSessionIndex + "Time"] = new Date().getTime()
            trialStatus = "recommendation"

            experimentr.addData(data)

        } else {
            // just the next trial
            trialIndex++
            trialStatus = "recommendation"
        }
        acctTrial++;
    }

    //----------------------------------------------------------------------
    // build the interface based on data
    //----------------------------------------------------------------------

    function buildTrial() {
        // console.log("buildTrial")
        if (trialStatus == "sessionend")
            return
        //---------------------------------------------
        // init log data
        //---------------------------------------------
        let trialLog = {}
        let trialData = currSequence[trialIndex]

        trialLog["index"] = trialIndex
        trialLog["subSession"] = subSessionIndex
        trialLog["setting"] = trialData
        trialLog["loading"] = new Date().getTime()
        trialLog["trialStatus"] = []
        trialLog["trialStatus"].push(trialStatus)

        if (!data[sessionName][subSessionIndex]) {
            data[sessionName][subSessionIndex] = []
        }

        data[sessionName][subSessionIndex].push(trialLog)

        if (globalDebug) console.log(data)
        if (globalDebug) console.log(trialData)

        //---------------------------------------------
        // clean up the interface 
        //---------------------------------------------

        d3.selectAll(".trial-step1")
            .style("display", "block")

        d3.selectAll(".trial-step2")
            .style("display", "none")

        //clean up
        d3.selectAll(".innercontainer").style("visibility", "hidden").html("")

        // build the recommendation correctness description
        d3.select("#machine-name").style("visibility", "visible").append("p")
            .html("Classifier " + (subSessionIndex + 1) + " recommends ")
            // .attr("class", "question-header")
            .style("vertical-align", "middle")
            .style("margin-top", "14pt")

        // build the recommendation correctness description
        d3.select("#machine-recommendation").style("visibility", "visible").append("p")
            .html(trialData.recommendationDescription)
            // .attr("class", "question-header")
            .style("vertical-align", "middle")
            .style("margin-top", "14pt")


        // build the recommendation correctness description
        // d3.select("#do_you_think_class").style("visibility", "visible")
        //     .text(trialData.doYouThink)
        //     .attr("class", "question-header")
        // .style("vertical-align", "middle")
        // .style("margin-top", "14pt")

        // build progress bar
        d3.select("#session_progress_text")
            .html("Classifier " + (subSessionIndex + 1) + " Progress: ")

        d3.select("#session_progress")
            .property("value", Math.round(100 * trialIndex / currSequence.length))

        // clean up instance image
        d3.select("#instance-display")
            .style("visibility", "visible")
            .append("img")
            .attr("src", trialData.instancePath).style("height", "110px")

        d3.select("#div_helpful").style("display", "none")

        if (currSettings.condition != "control") {
            d3.select("#div_helpful").style("display", "block")

            d3.select("#explanation-vis").style("visibility", "visible")
                .append("p").html(currSettings.explanationGeneral)
                .attr("class", "smaller-font")
                .style("margin", "5pt")
                .style("margin-left", "20pt")

            let img = d3.select("#explanation-vis").style("visibility", "visible")
                .append("img")
                .attr("src", trialData.stimulusPath)
                .style("margin-left", "auto")
                .style("margin-right", "auto")
                .style("display", "block")
                .attr("id", "current-img")

            var imgInstance = document.getElementById("current-img")

            imgInstance.addEventListener("load", function () {

                let w = imgInstance.naturalWidth;//d3.select("#current-img").node().naturalWidth
                let h = imgInstance.naturalHeight;//d3.select("#current-img").node().naturalHeight
                let factor = data["scaleFactor"]
                let fh = h;

                if (w > MAX_VIS_WIDTH || h > MAX_VIS_HEIGHT) {
                    if (w > MAX_VIS_WIDTH && h <= MAX_VIS_HEIGHT) {
                        img.attr("width", MAX_VIS_WIDTH)
                    } else if (h > MAX_VIS_HEIGHT && w <= MAX_VIS_WIDTH) {
                        img.attr("height", MAX_VIS_HEIGHT)
                    } else if (w > MAX_VIS_WIDTH && h > MAX_VIS_HEIGHT) {
                        if (w / h < MAX_VIS_WIDTH / MAX_VIS_HEIGHT) {
                            img.attr("height", MAX_VIS_HEIGHT)
                        } else {
                            img.attr("width", MAX_VIS_WIDTH)
                        }
                    }
                }

                // if ((w >= h) && (w > MAX_VIS_WIDTH)) {
                //     if (currCondition == "grid") {
                //         img.attr("width", MAX_VIS_WIDTH * factor)
                //         fw = MAX_VIS_WIDTH * factor
                //     } else {
                //         img.attr("width", MAX_VIS_WIDTH)
                //         fw = MAX_VIS_WIDTH
                //     }

                //     fh = h / w * fw

                //     if (globalDebug) console.log("fit w")
                // } else if ((w <= h) && (h > MAX_VIS_HEIGHT)) {
                //     if (currCondition == "grid") {
                //         img.attr("height", MAX_VIS_HEIGHT * factor)
                //         fh = MAX_VIS_HEIGHT * factor
                //     } else {
                //         img.attr("height", MAX_VIS_HEIGHT)
                //         fh = MAX_VIS_HEIGHT
                //     }
                //     fw = w / h * fh
                //     if (globalDebug) console.log("fit h")
                // }
                // console.log( d3.select("#right-meter"))
            });

        }

        // reset questions
        d3.selectAll("input[name='follow_question']").property('checked', false);
        d3.selectAll("input[name='comfort_decision']").property('checked', false);
        d3.selectAll("input[name='helpful_scale']").property('checked', false);


        d3.selectAll(".classifier-index")
            .text((subSessionIndex + 1))
    }

}