import { TokenNode } from "./TokenNode";

export class TokenHeadAndTailNodes {

    constructor(public head: TokenNode, public tail: TokenNode) {

    }

    toString() {

        let sb: string[] = [];

        for (let head = this.head, node = head.next, tail = this.tail; node != tail; node = node.next) {
            
            if (node.previous !== head && node.previous.value.interval.indexUpper < node.value.interval.index)
                sb.push(" ");

            sb.push(String(node));
        }

        return sb.join("");
    }
}