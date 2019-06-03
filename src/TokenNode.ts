import { Token } from "./Token";


export class TokenNode {

    constructor(public value: Token, public previous?: TokenNode) {

    }

    next: TokenNode;

    get type() { return this.value.type; }
    get string() { return this.value.string; }
    get interval() { return this.value.interval; }
    get index() { return this.value.index; }
    get indexUpper() { return this.value.indexUpper; }
    get parsedValue() { return this.value.parsedValue; }

    toString() { return this.value && String(this.value); }
}