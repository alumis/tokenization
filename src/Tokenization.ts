import { GraphemeString } from "./GraphemeString";
import { Grammar } from "./Grammar";
import { TokenNode } from "..";
import { Token, TokenType } from "./Token";
import { Interval } from "./Interval";
import { GraphemeStringEnumerator } from "./GraphemeStringEnumerator";
import { isNewlineGrapheme, isHexGrapheme, isDecimalGrapheme, firstCodePoint, hasBinaryPropertyXidStart, hasBinaryPropertyXidContinue, isWhitespaceGrapheme } from "./Utils";
import { TokenHeadAndTailNodes } from "./TokenHeadAndTailNodes";

let _uriRegex = /((http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?)/gi;
let _emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}/gi;
let _dayMonthYearDot = /(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})/g;
let _dayMonthDot = /(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])/g;
let _dayMonthYearSlash = /(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})/g;
let _dayMonthSlash = /(3[01]|[12][0-9]|0?[1-9])\/(1[012]|0?[1-9])/g;
let _yearDayMonthDash = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/g;
let _punctuation = /[\$\uFFE5\^\+=`~<>{}\[\]|\u3000-\u303F!-#%-\x2A,-/:;\x3F@\x5B-\x5D_\x7B}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]+/;

export function tokenize(graphemeString: GraphemeString, grammar: Grammar, maxAbbreviationLength = 4) {
    let head = new TokenNode(new Token(TokenType.Eof, null, new Interval(-1, 0)));
    let prev = head;

    let enumerator = new GraphemeStringEnumerator(graphemeString);
    let i = 0;

    function AppendToken(type: TokenType, str: string, parsedValue = null, length = 1) {
        let node = new TokenNode(new Token(type, str, new Interval(i, i += length), parsedValue)); node.previous = prev;

        prev = prev.next = node;
    }

    let regexMatches = new Map<number, { str: string; type: TokenType; }>();

    let match: RegExpExecArray;

    while (match = _emailRegex.exec(graphemeString.value))
        regexMatches[match.index] = { str: match[0], type: TokenType.Email };

    while (match = _uriRegex.exec(graphemeString.value))
        regexMatches[match.index] = { str: match[0], type: TokenType.Uri };

    while (match = _dayMonthYearDot.exec(graphemeString.value))
        regexMatches[match.index] = { str: match[0], type: TokenType.Date };

    while (match = _dayMonthDot.exec(graphemeString.value))
        regexMatches[match.index] = { str: match[0], type: TokenType.Date };

    while (match = _dayMonthYearSlash.exec(graphemeString.value))
        regexMatches[match.index] = { str: match[0], type: TokenType.Date };

    while (match = _dayMonthSlash.exec(graphemeString.value))
        regexMatches[match.index] = { str: match[0], type: TokenType.Date };

    while (match = _yearDayMonthDash.exec(graphemeString.value))
        regexMatches[match.index] = { str: match[0], type: TokenType.Date };

    while (enumerator.moveNext()) {

        if (isNewlineGrapheme(enumerator.current)) {

            AppendToken(TokenType.Newline, enumerator.current);
            continue;
        }

        let match = regexMatches.get(enumerator.currentUtf16Position);

        if (match) {

            let j = i++;

            for (let k = match.str.length - 1; 0 < k; --k) {
                enumerator.moveNext();
                ++i;
            }

            let node = new TokenNode(new Token(match.type, match.str, new Interval(j, i))); node.previous = prev;

            prev = prev.next = node;

            continue;
        }

        switch (enumerator.current) {
            
            case "0":
                {
                    let position = enumerator.position;
                    let parseString = "";

                    if (enumerator.moveNext() && (<any>enumerator).current == "x" && enumerator.moveNext() && isHexGrapheme(enumerator.current)) {
                        let j = i;

                        i += 3;

                        position = enumerator.position;

                        parseString += enumerator.current;

                        for (; enumerator.moveNext() && isHexGrapheme(enumerator.current); ++i) {
                            position = enumerator.position;
                            parseString += enumerator.current;
                        }

                        enumerator.position = position;

                        let node = new TokenNode(new Token(TokenType.Hexadecimal, graphemeString.nativeSubstr(j, i - j), new Interval(j, i), parseInt(parseString, 16))); node.previous = prev;

                        prev = prev.next = node;

                        continue;
                    }

                    enumerator.position = position;
                }

            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                {
                    let j = i++;
                    let position = enumerator.position;
                    let hasFractionalPart = false;
                    let hasExponent = false;
                    let parseString = "";

                    while (enumerator.moveNext()) {
                        if (isDecimalGrapheme(enumerator.current)) {
                            position = enumerator.position;
                            ++i;

                            parseString += enumerator.current;

                            continue;
                        }

                        else if ((<any>enumerator).current == " " || (<any>enumerator).current == "\u2009") {
                            if (enumerator.moveNext() && isDecimalGrapheme(enumerator.current)) {
                                position = enumerator.position;
                                i += 2;

                                continue;
                            }
                        }

                        else if ((<any>enumerator).current == "." || (<any>enumerator).current == ",") {
                            if (!hasFractionalPart && !hasExponent && enumerator.moveNext() && isDecimalGrapheme(enumerator.current)) {
                                position = enumerator.position;
                                i += 2;
                                hasFractionalPart = true;

                                parseString += ".";

                                continue;
                            }
                        }

                        else if (!hasExponent && ((<any>enumerator).current == "e" || (<any>enumerator).current == "E")) {
                            if (enumerator.moveNext()) {
                                if (isDecimalGrapheme(enumerator.current)) {
                                    position = enumerator.position;
                                    i += 2;
                                    hasExponent = true;

                                    parseString += "E" + enumerator.current;

                                    continue;
                                }

                                if ((<any>enumerator).current == "+" || (<any>enumerator).current == "-" || (<any>enumerator).current == "\u2212") {
                                    let plusMinus = (<any>enumerator).current == "+" ? '+' : '-';

                                    if (enumerator.moveNext() && isDecimalGrapheme(enumerator.current)) {
                                        position = enumerator.position;
                                        i += 3;
                                        hasExponent = true;

                                        parseString += "E" + plusMinus + enumerator.current;

                                        continue;
                                    }
                                }
                            }
                        }

                        break;
                    }

                    enumerator.position = position;

                    let node: TokenNode;

                    if (!hasFractionalPart && !hasExponent)
                        node = new TokenNode(new Token(TokenType.DecimalInteger, graphemeString.nativeSubstr(j, i - j), new Interval(j, i), parseInt(parseString, 10)));

                    else new TokenNode(new Token(TokenType.Decimal, graphemeString.nativeSubstr(j, i - j), new Interval(j, i), parseFloat(parseString)));

                    node.previous = prev;

                    prev = prev.next = node;

                    continue;
                }

            case "[":
                AppendToken(TokenType.OpeningBracket, "[");
                continue;
            case "]":
                AppendToken(TokenType.ClosingBracket, "]");
                continue;
            case "(":
                AppendToken(TokenType.OpeningParenthesis, "(");
                continue;
            case ")":
                AppendToken(TokenType.ClosingParenthesis, ")");
                continue;
            case "{":
                AppendToken(TokenType.OpeningBrace, "{");
                continue;
            case "}":
                AppendToken(TokenType.ClosingBrace, "}");
                continue;
            case ".":
                AppendToken(TokenType.FullStop, ".");
                continue;
            case "?":
                AppendToken(TokenType.QuestionMark, ".");
                continue;
            case "!":
                AppendToken(TokenType.ExclamationPoint, ".");
                continue;

            case ",":
                AppendToken(TokenType.Comma, ",");
                continue;

            case ":":
                AppendToken(TokenType.Colon, ":");
                continue;

            case ";":
                AppendToken(TokenType.Semicolon, ",");
                continue;

            case "|":
                AppendToken(TokenType.VerticalBar, ":");
                continue;

            default:

                if (enumerator.current.length == 1 && _punctuation.test(enumerator.current)) {
                    AppendToken(TokenType.OtherPunctuation, enumerator.current);
                    continue;
                }

                break;
        }

        if (hasBinaryPropertyXidStart(firstCodePoint(enumerator.current))) {

            let j = i++;
            let position = enumerator.position;

            for (; enumerator.moveNext() && hasBinaryPropertyXidContinue(firstCodePoint(enumerator.current)); ++i)
                position = enumerator.position;

            enumerator.position = position;

            let node = new TokenNode(new Token(TokenType.Identifier, graphemeString.nativeSubstr(j, i - j), new Interval(j, i))); node.previous = prev;

            prev = prev.next = node;

            continue;
        }

        if (isWhitespaceGrapheme(enumerator.current)) {
            ++i;
            continue;
        }

        let node = new TokenNode(new Token(TokenType.Identifier, enumerator.current, new Interval(i, ++i))); node.previous = prev;

        prev = prev.next = node;
    }

    let node = new TokenNode(new Token(TokenType.Eof, null, new Interval(i, -1))); node.previous = prev;
    let result = new TokenHeadAndTailNodes(head, prev.next = node);

    // IdentifyDashes(result);
    // IdentifyAbbreviations(result, grammar, maxAbbreviationLength);
    // IdentifyQuantities(result, longTermMemory);
    // IdentifyNorwegianOrdinalNumbers(result, grammar);
    // TokenizeParentheses(result);

    return result;
}