#!/usr/bin/env node

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { Parser } from '@json2csv/plainjs';
import * as fs from "fs";

const successCriteria = [];

console.log(`Retrieving WCAG 2.2 success criteria. The results will be written into a file named "wcag.csv".`);
const response = await fetch("http://www.w3.org/tr/wcag22/");
const body = await response.text();
const $ = cheerio.load(body);

// Get all the success criteria from the WCAG specification and process them.
$("section.guideline section.guideline").each((i, e) => {

    // Get the success criteria title minus the word success criteria.
    let title = $("h4", e).text();
    title = title.replace("Success Criterion", "").trim();

    // Split up the title parts.
    let titleParts = title.split(" ");
    // Get the success criteria number.
    let number = titleParts.shift();
    // Get the success criteria short label.
    let label = titleParts.join(" ");

    // Get the conformance level of the success criteria.
    let level = $(".conformance-level", e).text();
    level = level.substring(level.indexOf(" "), level.length - 1).trim();

    // Get the link to the understanding document.
    let link = $(".doclinks > a:nth-child(1)", e).attr().href;

    // Add success criteria information to the array.
    successCriteria.push({
        "criterion": number,
        "label": label,
        "level": level,
        "link": link
    });

});


const parser = new Parser();
const csv = parser.parse(successCriteria);

console.log("Writing csv file.");
fs.writeFileSync("wcag.csv", csv, { "encoding": "utf-8" });
