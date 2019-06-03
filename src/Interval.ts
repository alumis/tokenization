export class Interval {

    constructor(public index: number, public indexUpper: number) {

    }

    get length() {

        return this.indexUpper - this.index;
    }
}