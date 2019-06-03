import { Interval } from "./Interval";

export class Token {

    constructor(public type: TokenType, public string: string, public interval: Interval, public parsedValue?)
    {
    }

    get index() { return this.interval.index; }
    get indexUpper() { return this.interval.indexUpper; }
}

export enum TokenType {

    // Sentence terminators

    Eof,
    FullStop,
    QuestionMark,
    ExclamationPoint,
    
    Comma,
    Semicolon,
    Colon,

    VerticalBar,

    OpeningParenthesis,
    ClosingParenthesis,
    OpeningBracket,
    ClosingBracket,
    OpeningBrace,
    ClosingBrace,

    OtherPunctuation,

    Newline,

    Identifier,

    Hexadecimal,
    Decimal,
    DecimalInteger,
    Ordinal,
    Quantity,

    Emoji,
    Uri,
    Email,
    Date,

    Parentheses
}