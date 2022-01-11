
module.paths.push('/usr/local/lib/node_modules');

var fs = require('fs');
let target = process.argv[2] || "leaf";
let examples = {}

readFiles(target + "/")

function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function (filename) {

            let filenamePure = filename.substring(0, filename.length - 4)
            let names = filenamePure.split("__")
            let actualClass = names[2]
            let predictedClass = names[3]
            let path = "files/" + target + "/" + filename
            if (actualClass && predictedClass && (actualClass == predictedClass) && names[1] == "control") {
                if (!examples[actualClass])
                    examples[actualClass] = []
                
                examples[actualClass].push({"actualClass": actualClass, "predictedClass": predictedClass, "path": path })
            }
        });

        writeFile()
    });
}

function writeFile() {
    fs.writeFile(target + "-examples.json", JSON.stringify(examples), 'utf8', (err) => {
        if (err) throw err;
        console.log('examples saved');
    });
}
