(function () {

    d3.selectAll(".pid-eid").text(data["participantID"] + " " + "E" + (data["experimentIndex"] + 1))

    if (data['experimentIndex'] == 1) {
        // the second experiment
        experimentr.next()
    }

    data["timestamps"]["demographics"] = {}
    data["timestamps"]["demographics"]["loading"] = new Date().getTime();

    data["demographics"] = {} // hold data

    //----------------------------------------------------------------------
    // check if a given field is filled and store that in the data we collected
    // return true if this is UNfinished
    // not used I think....
    //----------------------------------------------------------------------
    function checkAndStoreField(f, part) {
        let flag = false // assume this part doesn't have any unfinished questions
        let str = '[name="' + f + '"]'
        let s = d3.select(str)
        // console.log(s)
        let n = s.node()
        // console.log(n.type)
        if (n && (n.type === "text" || n.type === "textarea")) {
            let ans = d3.select(str).node().value
            if (ans == "") {
                flag = flag || true
                if (globalDebug) console.log(f + " is not finished yet-1")
            }
            data["demographics"][part][f] = ans
        } else if (n && n.type === "radio") {
            let cn = d3.select(str + ":checked").node()
            if (cn) data["demographics"][part][f] = cn.value
            else {
                flag = flag || true
                if (globalDebug) console.log(f + " is not finished yet-3")
            }
        } else {
            flag = true
            if (globalDebug) console.log(f + " is not finished yet-4")
        }
        return flag
    }

    //----------------------------------------------------------------------
    // when init, hide all the questions
    //----------------------------------------------------------------------
    d3.selectAll(".ques_part")
        .style("display", "none");

    //----------------------------------------------------------------------
    // when init, hide all the warning messages
    //----------------------------------------------------------------------
    d3.selectAll(".warning")
        .style("visibility", "hidden");

    //----------------------------------------------------------------------
    // decide when to show the auto system trusts questions
    //----------------------------------------------------------------------
    // hide the auto system trusts questions
    //----------------------------------------------------------------------
    d3.select("#ds_survey_system")
        .style("display", "none")

    // when answer yes, show the auto system questions
    d3.selectAll('input[name="ds_auto_system_experience"]')
        .on("change", function () {
            let answer = d3.select(this).property("value") // get the answer being selected

            if (!data["timestamps"]["demographics"]["auto_systems"])
                data["timestamps"]["demographics"]["auto_systems"] = []
            // if the answer is yes, show the auto trust questions
            if (answer == "auto_yes")
                d3.select("#ds_survey_system").style("display", "block")
            else
                d3.select("#ds_survey_system").transition().style("display", "none")

            // log all data!
            data["timestamps"]["demographics"]["auto_systems"].push({ "timestamp": new Date().getTime(), "value": answer })
        })


    //----------------------------------------------------------------------
    // novice: same, copy and paste: hide the auto system trusts questions
    //----------------------------------------------------------------------
    d3.select("#nov_survey_system")
        .style("display", "none")

    // when answer yes, show the auto system questions
    d3.selectAll('input[name="nov_auto_system_experience"]')
        .on("change", function () {
            let answer = d3.select(this).property("value") // get the answer being selected

            if (!data["timestamps"]["demographics"]["auto_systems"])
                data["timestamps"]["demographics"]["auto_systems"] = []

            // if the answer is yes, show the auto trust questions
            if (answer == "auto_yes")
                d3.select("#nov_survey_system").style("display", "block")
            else
                d3.select("#nov_survey_system").transition().style("display", "none")

            // log all data!
            data["timestamps"]["demographics"]["auto_systems"].push({ "timestamp": new Date().getTime(), "value": answer })
        })
    // end of defining when to show auto system trusts sub questions

    //----------------------------------------------------------------------
    // when init, hide the next button
    // we don't need it in this section
    //----------------------------------------------------------------------
    experimentr.hideNext()

    //----------------------------------------------------------------------
    // define actions of buttons
    //----------------------------------------------------------------------
    // define the actions after selecting yes or no for data science expert question
    //----------------------------------------------------------------------
    d3.selectAll(".expert_button")
        .on('click', function (d) {
            // assign group id
            data.usergroup = d3.select(this).node().value

            // hide the question 0
            d3.select("#ques_0")
                .style("display", "none");

            // If yes, please answer the questions in Part A followed by Part C
            if (data.usergroup === "group_data_science") {
                // release the first set of questions
                d3.select("#ques_part_a")
                    .style("display", "block");
            }

            // Otherwise please answer the questions in Part B, followed by Part C.
            if (data.usergroup === "group_staff") {
                // release the first set of questions
                d3.select("#ques_part_b")
                    .style("display", "block");
            }

            data["timestamps"]["expert_button"] = new Date().getTime();
        })
    // end of assigning the first questionnaire


    //----------------------------------------------------------------------
    // define the button at the end of part A 
    //----------------------------------------------------------------------
    d3.select("#button-parta")
        .on("click", function () {

            // record data here
            data["timestamps"]["demographics"]["button-parta"] = new Date().getTime();
            data["demographics"]["parta"] = {}

            let fields1 = ["ds_current_domain", "ds_working_years", "ds_data_analyst",
                "ds_dataset_size", "ds_dimensionality", "ds_familiar_ml",
                "ds_analysis_systems", "ds_auto_system_experience",
                "ds_interested_anto_analysis", "ds_understand_system_important"
            ]

            let fields2 = ["ds_auto_system_names", "ds_auto_system_pick",
                "ds_trust_auto_analysis", "ds_understand_auto"]

            let flag = false; // whether they have unfinished questiosn, assume they don't

            // check the must fill fields
            fields1.forEach(d => {
                flag = checkAndStoreField(d, "parta") || flag
            })


            // check the optional fields (only if they have experiences with automation system)
            if (data["demographics"]["parta"]["ds_auto_system_experience"] == "auto_yes")
                fields2.forEach(d => {
                    flag = checkAndStoreField(d, "parta") || flag
                })

            // if they have unfinished questions
            if (flag && !globalDebug) {
                d3.select("#warning-msg").style("visibility", "visible")//.style("display", "inline")
                // the warning message will disappear after 3 secs
                setTimeout(function () {
                    d3.select("#warning-msg").style("visibility", "hidden")
                }, data['settings']['warningTime'])
                data["timestamps"]["demographics"]["unfinished-buttona"] = new Date().getTime();
            } else { // otherwise, they can proceed
                // hide the current (first) part, release the second part (part c)
                d3.select("#ques_part_a").style("display", "none")
                d3.select("#ques_part_b").style("display", "none")
                d3.select("#ques_part_c").style("display", "block")
                data["timestamps"]["demographics"]["proceed-buttona"] = new Date().getTime();

                document.body.scrollTop = 0; // For Safari
                document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

                experimentr.addData(data) // save at the same time
            }
        })


    //----------------------------------------------------------------------
    // define the button at the end of part B
    //----------------------------------------------------------------------
    d3.select("#button-partb")
        .on("click", function () {
            // record data
            data["timestamps"]["demographics"]["button-partb"] = new Date().getTime(); // when click this button
            data["demographics"]["partb"] = {}

            let fields1 = ["nov_work_description", "nov_auto_system_experience",
                "nov_interested_anto_analysis", "nov_understand_system_important"
            ]

            let fields2 = ["nov_auto_system_names",
                "nov_auto_system_pick", "nov_trust_auto", "nov_understand_auto"
            ]

            let flag = false; // whether they have unfinished questiosn, assume they don't

            // check the must fill fields
            fields1.forEach(f => {
                flag = checkAndStoreField(f, "partb") || flag
            })

            // check the optional fields (only if they have experiences with automation system)
            if (data["demographics"]["partb"]["nov_auto_system_experience"] == "auto_yes")
                fields2.forEach(f => {
                    flag = checkAndStoreField(f, "partb") || flag
                })

            // if they have unfinished questions
            if (flag && !globalDebug) {
                d3.select("#warning-msg").style("visibility", "visible")
                // the warning message will disappear after 3 secs
                setTimeout(function () {
                    d3.select("#warning-msg").style("visibility", "hidden")
                }, data['settings']['warningTime'])
                data["timestamps"]["demographics"]["unfinished-buttonb"] = new Date().getTime();
            } else {
                // hide the current (first) part, release the second part (part c)
                d3.select("#ques_part_a").style("display", "none")
                d3.select("#ques_part_b").style("display", "none")
                d3.select("#ques_part_c").style("display", "block")
                // d3.select("#ques_part_d").style("display", "none")
                data["timestamps"]["demographics"]["proceed-buttonb"] = new Date().getTime(); // when click this button

                document.body.scrollTop = 0; // For Safari
                document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
            }
        })


    //----------------------------------------------------------------------
    // define the button at the end of part C
    //----------------------------------------------------------------------
    d3.select("#button-partc")
        .on("click", function () {
            data["timestamps"]["demographics"]["button-partc"] = new Date().getTime();
            data["demographics"]["partc"] = {}

            let fields = [
                "prop_trust_no_reason",
                "prop_distrust_auto",
                "prop_rely_assist",
                "prop_tend_high",
                "prop_trust_job",
                "prop_trust_know"]

            let flag = false; // whether they have unfinished questiosn, assume they don't

            // check the must fill fields
            fields.forEach(f => {
                flag = checkAndStoreField(f, "partc") || flag
            })

            // if they have unfinished questions
            if (flag && !globalDebug) {
                d3.select("#warning-msg").style("visibility", "visible")

                // the warning message will disappear after 3 secs
                setTimeout(function () {
                    d3.select("#warning-msg").style("visibility", "hidden")
                }, data['settings']['warningTime'])

                data["timestamps"]["demographics"]["unfinished-buttonc"] = new Date().getTime();
            } else {
                // hide the current (first) part, release the second part (part c)
                d3.select("#ques_part_a").style("display", "none")
                d3.select("#ques_part_b").style("display", "none")
                d3.select("#ques_part_c").style("display", "none")
                // d3.select("#ques_part_d").style("display", "block")
                data["timestamps"]["demographics"]["proceed-buttonc"] = new Date().getTime(); // when click this button

                document.body.scrollTop = 0; // For Safari
                document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

                data["timestamps"]["demographics"]["finishing"] = new Date().getTime();

                // save data 
                experimentr.addData(data);

                // proceed to next session
                experimentr.next()
            }
        })
}());