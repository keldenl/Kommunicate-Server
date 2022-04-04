import dotenv from "dotenv";
dotenv.config();

const originalAlphabet = ["-", "--", "a", "i", "u", "e", "o", "ka", "ga", "ki", "kya", "kyu", "kyo", "gi", "gya", "gyu", "gyo", "ku", "gu", "ke", "ge", "ko", "go", "sa", "za", "si", "sha", "shu", "sho", "ji", "ja", "ju", "jo", "su", "zu", "se", "ze", "so", "zo", "ta", "da", "ti", "cha", "chu", "cho", "di", "dya", "dyu", "dyo", "tsu", "du", "te", "de", "to", "do", "na", "ni", "nya", "nyu", "nyo", "nu", "ne", "no", "ha", "ba", "pa", "hi", "hya", "hyu", "hyo", "bi", "bya", "byu", "byo", "pi", "pya", "pyu", "pyo", "hu", "fa", "fi", "fe", "fo", "fya", "fyu", "fyo", "bu", "pu", "he", "be", "pe", "ho", "bo", "po", "ma", "mi", "mya", "myu", "myo", "mu", "me", "mo", "ya", "yu", "yo", "ra", "ri", "rya", "ryu", "ryo", "ru", "re", "ro", "wa", "wi", "we", "wo", "n"]
const adjustmentNewTranslator = [
    'shi',
    'chi',
    'tte',
    'fu',
]
export const romanjiAlphabet = [...originalAlphabet, ...adjustmentNewTranslator]

const translationUrls = process.env.TRANSLATION_SOURCES.split(',');

export const getTranslationUrl = () => {
    const rand = Math.floor(Math.random() * translationUrls.length);
    return translationUrls[rand];
}