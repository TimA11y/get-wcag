#!/usr/bin/env node

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import * as json2csv from "json2csv";
import * as fs from "fs";

const successCriteria = [];

console.log(`Retrieving WCAG 2.1 Level AA success criteria. The results will be written into a file named "wcag.json".`);
const response = await fetch("http://www.w3.org/tr/wcag21/");
const body =  await response.text();
const $ = cheerio.load(body);

$("section.sc").each((i, e) => {
    let title = $("h4", e).text();
    title = title.replace("Success Criterion", "").trim();
    let titleParts = title.split(" ");
    let number = titleParts.shift();
    let label = titleParts.join(" ");
    label = label.substring(0, label.length - 1); // Remove the special char that seems to appear at the end of the string.
    let level = $(".conformance-level", e).text();
    level = level.substring(level.indexOf(" "), level.length - 1).trim();
    let link = $(".doclinks > a:nth-child(1)", e).attr().href;

    if (level === "A" || level === "AA") {
        successCriteria.push({
            "criterion": number,
            "label": label,
            "level": level,
            "link": link
        });
    } // end if.
});

const csv = json2csv.parse(successCriteria);
console.log("Writing JSON file.");
fs.writeFileSync("wcag.json", JSON.stringify(successCriteria), {"encoding": "utf-8"});
