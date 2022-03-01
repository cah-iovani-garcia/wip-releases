#!/usr/bin/env zx
let directoryoutput = await $`pwd`;
let directoryarray = directoryoutput.stdout.split("/");
if (directoryarray[directoryarray.length - 1].includes("frontend")) {
    cd("packages");
} else {
    cd("applications");
}

let repos = await $`ls -d */`;
console.log("\n\n");

let directories = repos.stdout.split("\n");
directories.pop();
console.log("Which application would you like to release?\n");

for (let i = 0; i < directories.length; i++) {
    console.log(directories[i]);
}
console.log("\n\n");

let repo;
while (!directories.includes(repo)) {
    repo = await question("Choose application: ", {
        choices: directories,
    });
    if (!directories.includes(repo))
        console.log("Please choose an existing repository.");
}

let releaseTypes = ["major", "minor", "patch"];

console.log("major");
console.log("minor");
console.log("patch");
let tagtype = await question("What type of release is this?\n", {
    choices: releaseTypes,
});

//get most recent tag/release #
let doesTagExist = await $`git tag`;
let mostRecentTag;
let newtag = repo + "v";
console.log("stdout: " + doesTagExist.stdout + ".");
if (doesTagExist.stdout != "") {
    mostRecentTag = await $`git describe`;
}
if (typeof mostRecentTag != "undefined" && mostRecentTag.stdout != "") {
    let tag = mostRecentTag.stdout.split("/v")[1];
    let tagvalues = tag.split(".");
    if (tagtype == "major") {
        newtag +=
            parseInt(tagvalues[0]) + 1 + "." + tagvalues[1] + "." + tagvalues[2];
    } else if (tagtype == "minor") {
        newtag +=
            tagvalues[0] + "." + (parseInt(tagvalues[1]) + 1) + "." + tagvalues[2];
    } else if (tagtype == "patch") {
        newtag +=
            tagvalues[0] + "." + tagvalues[1] + "." + (parseInt(tagvalues[2]) + 1);
    }
    console.log("\n\nNew Tag Name: " + newtag);
} else {
    newtag += "1.0.0";
}

await $`git checkout main`;
await $`git tag ${newtag} -a`;
await $`git push origin ${newtag}`;
await $`gh release create ${newtag}`;

//rename to pati-plat