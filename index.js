import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import { romanjiAlphabet, getTranslationUrl } from "./utils.js"

dotenv.config();

const enToJap = async(en) => {
    const baseUrl = getTranslationUrl()
    try {
        const ip = await fetch(`https://www.proxyscan.io/api/proxy?country=us&format=txt`).then(res => res.text());
        const [host, port] = ip.split(":");
        const jap = await fetch(`https://${baseUrl}/translate`, {
                host,
                port,
                method: "POST",
                body: JSON.stringify({
                    q: en,
                    source: "en",
                    target: "ja",
                    format: "text"
                }),
                headers: { "Content-Type": "application/json" }
            }).then(res => {
                return res.json()
            })
            .then(data => {
                console.log(data);
                return data;
            })
        return jap;

    } catch (err) {
        console.log(err)
        return new Error("Error translating: ", err)
    }
}


const japToRomanji = async(jap) => {
    const kuroshiro = new Kuroshiro.default();
    await kuroshiro.init(new KuromojiAnalyzer());
    return await kuroshiro.convert(jap, { to: "romaji", mode: "spaced", romanjiSystem: "passport" });
}

const romanjiToArray = (romanji) => {
    var romanjiWithEmptyCharacters = romanji
        .replace(/-/g, "")
        .replace(/ッ/g, "-")
        .replace(/,/g, "-")
        .replace(/\s/g, "--")
        .replace(/\!/g, "--")
        .replace(/\./g, "--")
        .replace(/\?/g, "--")
        .replace(/\'/g, "")
        .replace(/ū/g, "u")
        .replace(/ō/g, "o")
        .replace(/ē/g, "e")


    var returnArr = [];
    // Loop through the whole romanji
    var k = 0;
    for (var i = 3; i > 0; i--) {
        var currSub = romanjiWithEmptyCharacters.substring(k, i + k);
        if (romanjiAlphabet.indexOf(currSub) > -1) {
            returnArr.push(currSub);
            console.log(currSub);
            k += i;
            i = 4;
        }
    }

    return returnArr
}

const translate = async(req, res) => {
    const { input } = req.body;
    if (!input) {
        return res.status(500).json({
            error: "Required field 'input' missing from request"
        });
    }
    try {
        const { translatedText: japanese } = await enToJap(input);

        if (!japanese) {
            throw new Error("Rate limit exceeded, try again in 10 seconds");
        }
        const romanji = await japToRomanji(japanese)
        console.log(romanji);
        const romanjiArray = romanjiToArray(romanji);
        if (!romanjiArray.length) {
            throw new Error("No proper translation found for" + input + ". Japanese: " + japanese + " Romanji: " + romanji);
        }
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
app.use(cors());

router.post("/translate", translate)

app.use(router);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))