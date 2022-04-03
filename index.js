import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import { romanjiAlphabet } from "./utils.js"

const enToJap = async (en) =>
    await fetch("https://libretranslate.de/translate", {
        method: "POST",
        body: JSON.stringify({
            q: en,
            source: "en",
            target: "ja",
            format: "text"
        }),
        headers: { "Content-Type": "application/json" }
    }).then(res => res.json());


const japToRomanji = async (jap) => {
    const kuroshiro = new Kuroshiro.default();
    await kuroshiro.init(new KuromojiAnalyzer());
    return await kuroshiro.convert(jap, { to: "romaji", mode: "spaced" });
}

const romanjiToArray = (romanji) => {
    var romanjiWithEmptyCharacters = romanji
        .replace(/-/g, "")
        .replace(/ッ/g, "-")
        .replace(/,/g, "-")
        .replace(/\s/g, "--");

    var returnArr = [];

    // Loop through the whole romanji
    var k = 0;
    for (var i = 3; i > 0; i--) {
        var currSub = romanjiWithEmptyCharacters.substring(0, i);
        if (romanjiAlphabet.indexOf(currSub) > -1) {
            console.log("FOUND ONE");
            returnArr.push(currSub);
            romanjiWithEmptyCharacters = romanjiWithEmptyCharacters.substring(i);
            i = 4;
        }
    }

    return returnArr
}

const translate = async (req, res) => {
    const { input } = req.body;
    if (!input) {
        return res.status(500).json({
            error: "Required field 'input' missing from request"
        });
    }
    try {
        const { translatedText: japanese } = await enToJap(input);
        const romanji = await japToRomanji(japanese)
        const romanjiArray = romanjiToArray(romanji);
        return res.status(200).json({
            input: input,
            japanese,
            romanji,
            romanjiArray
        })
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}


const app = express();
const router = express.Router();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

router.get("/translate", translate)

app.use(router);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))