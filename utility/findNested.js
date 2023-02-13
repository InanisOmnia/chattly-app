const fs = require("fs");
const path = require("path")

const find_nested = (dir, pattern, depth) => {
    let results = [];
    if (dir === undefined && pattern === undefined) {
        return results;
    }
    if(typeof depth !== "undefined") {
        if(!depth) {return results}
    }
    fs.readdirSync(dir).forEach(inner_dir => {
        inner_dir = path.resolve(dir, inner_dir);
        const stat = fs.statSync(inner_dir);
        if (stat.isDirectory()) {
            results = results.concat(find_nested(inner_dir, pattern, depth-1));
        }
        if (stat.isFile() && inner_dir.endsWith(pattern)) {
            results.push(inner_dir);
        }
    });

    return results;
}
module.exports = find_nested;