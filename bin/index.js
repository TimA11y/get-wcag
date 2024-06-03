#!/usr/bin/env node

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { Parser } from '@json2csv/plainjs';
import * as fs from "fs";

const successCriteria = [];

console.log(`Retrieving WCAG 2.1 Level AA success criteria. The results will be written into a file named "wcag.csv".`);
const response = await fetch("http://www.w3.org/tr/wcag21/");
const body = await response.text();
const $ = cheerio.load(body);

$("section.guideline section.guideline").each((i, e) => {
    let title = $("h4", e).text();
    title = title.replace("Success Criterion", "").trim();
    let titleParts = title.split(" ");
    let number = titleParts.shift();
    let label = titleParts.join(" ");
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


const parser = new Parser();
const csv = parser.parse(successCriteria);

console.log("Writing csv file.");
fs.writeFileSync("wcag.csv", csv, { "encoding": "utf-8" });
