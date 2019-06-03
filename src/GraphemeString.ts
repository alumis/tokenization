import { Interval } from "./Interval";
import { RedBlackTreeNode } from "./RedBlackTreeNode";
import { RedBlackTree } from "./RedBlackTree";
import { GraphemeSurrogate } from "./GraphemeSurrogate";
import { GraphemeCluster, Extends } from "./GraphemeCluster";

export class GraphemeString {

    constructor(public value: string) {
    }

    surrogates: RedBlackTreeNode<GraphemeSurrogate>;
    clusters: RedBlackTreeNode<GraphemeCluster>;

    toString() {
        return this.value;
    }

    charAt(index: number) {
        return this.substr(index, 1);
    }

    _length: number;

    get length() {

        if (this._length !== undefined)
            return this._length;

        this.index();

        return this._length = this.clusters === null ?
            this.value.length :
            this.clusters.rightmost.value.interval.indexUpper;
    }

    private _isNormalized: boolean;

    normalize() {

        if (this._isNormalized)
            return;

        this.value = this.value.normalize("NFD");
        this._isNormalized = true;
    }

    private _hasIndexed: boolean;

    index() {

        if (this._hasIndexed)
            return;

        this.normalize();

        let codeUnitsIndex = 0;
        let codeUnitsIndexUpper = this.value.length;

        let surrogate: RedBlackTreeNode<GraphemeSurrogate> = null;
        let graphemeCluster: RedBlackTreeNode<GraphemeCluster> = null;

        let cpIndex = 0;
        let graphemeClusterIndex = 0;

        function read() {

            let codeUnit = this.value.charCodeAt(codeUnitsIndex);

            if ((codeUnit & 0xfffffc00) === 0xd800) // U16_IS_LEAD
            {
                surrogate = new RedBlackTreeNode<GraphemeSurrogate>();
                surrogate.value = new GraphemeSurrogate();
                surrogate.value.CodePointsIndex = cpIndex++;
                surrogate.value.CodePointsIndexUpper = cpIndex;
                surrogate.value.CodeUnits = codeUnitsIndex;

                let root = { ref: this.surrogates };

                RedBlackTree.insertRight(surrogate, root);
                RedBlackTree.balance(surrogate, root);

                this.surrogates = root.ref;

                let cp = (codeUnit << 10) + this.value.charCodeAt(codeUnitsIndex + 1) - ((0xd800 << 10) + 0xdc00 - 0x10000); // U16_GET_SUPPLEMENTARY

                codeUnitsIndex += 2;

                return cp;
            }

            if (surrogate !== null)
                ++surrogate.value.CodePointsIndexUpper;

            ++cpIndex;

            return this.value.charCodeAt(codeUnitsIndex++);
        }

        function forward() {

            if ((this.value.charCodeAt(codeUnitsIndex) & 0xfffffc00) === 0xd800) // U16_IS_LEAD
            {
                surrogate = new RedBlackTreeNode<GraphemeSurrogate>();
                surrogate.value = new GraphemeSurrogate();
                surrogate.value.CodePointsIndex = cpIndex++;
                surrogate.value.CodePointsIndexUpper = cpIndex;
                surrogate.value.CodeUnits = codeUnitsIndex;

                let root = { ref: this.surrogates };

                RedBlackTree.insertRight(surrogate, root);
                RedBlackTree.balance(surrogate, root);

                this.surrogates = root.ref;

                codeUnitsIndex += 2;
            }

            if (surrogate !== null)
                ++surrogate.value.CodePointsIndexUpper;

            ++cpIndex;
            ++codeUnitsIndex;
        }

        function peek(index: number) {

            let codeUnit = this.value.charCodeAt(index);

            if ((codeUnit & 0xfffffc00) === 0xd800) // U16_IS_LEAD
                return (codeUnit << 10) + this.value.charCodeAt(index + 1) - ((0xd800 << 10) + 0xdc00 - 0x10000); // U16_GET_SUPPLEMENTARY

            return codeUnit;
        }

        function indexGraphemeCluster(codeUnitsStart: number, index: number) {

            if (codeUnitsStart - index === 2) {

                let gc = new RedBlackTreeNode<GraphemeCluster>();

                gc.value = new GraphemeCluster();
                gc.value.interval = new Interval(graphemeClusterIndex++, graphemeClusterIndex);
                gc.value.codeUnitsInterval = new Interval(index, codeUnitsStart);

                let root = { ref: this.clusters };

                RedBlackTree.insertRight(gc, root);
                RedBlackTree.balance(gc, root);

                this.clusters = root.ref;

                graphemeCluster = null;
            }

            else if (graphemeCluster === null && this.clusters !== null) {

                graphemeCluster = new RedBlackTreeNode<GraphemeCluster>();
                graphemeCluster.value = new GraphemeCluster();

                graphemeCluster.value.interval = new Interval(graphemeClusterIndex++, graphemeClusterIndex);
                graphemeCluster.value.codeUnitsInterval = new Interval(index, codeUnitsStart);

                let root = { ref: this.clusters };

                RedBlackTree.insertRight(graphemeCluster, root);
                RedBlackTree.balance(graphemeCluster, root);

                this.clusters = root.ref;
            }

            else {

                ++graphemeClusterIndex;

                if (graphemeCluster !== null) {

                    ++graphemeCluster.value.interval.indexUpper;
                    ++graphemeCluster.value.codeUnitsInterval.indexUpper;
                }
            }
        }

        while (codeUnitsIndex < codeUnitsIndexUpper) {

            let index = codeUnitsIndex, a = read();

            if (codeUnitsIndex < codeUnitsIndexUpper) {

                let b = peek(codeUnitsIndex);

                if (Extends(a, b)) {

                    let continueOuter = false;

                    for (forward(); codeUnitsIndex < codeUnitsIndexUpper;) {

                        a = peek(codeUnitsIndex);

                        if (Extends(b, a)) {

                            forward();

                            if (codeUnitsIndex < codeUnitsIndexUpper) {

                                b = peek(codeUnitsIndex);

                                if (Extends(a, b)) {

                                    forward();
                                    continue;
                                }
                            }

                            else break;
                        }

                        let gc = new RedBlackTreeNode<GraphemeCluster>();

                        gc.value = new GraphemeCluster();
                        gc.value.interval = new Interval(graphemeClusterIndex++, graphemeClusterIndex);
                        gc.value.codeUnitsInterval = new Interval(index, codeUnitsIndex);

                        let root = { ref: this.clusters };

                        RedBlackTree.insertRight(gc, root);
                        RedBlackTree.balance(gc, root);

                        this.clusters = root.ref;

                        graphemeCluster = null;

                        continueOuter = true;
                        break;
                    }

                    if (continueOuter)
                        continue;

                    graphemeCluster = new RedBlackTreeNode<GraphemeCluster>();
                    graphemeCluster.value = new GraphemeCluster();

                    graphemeCluster.value.interval = new Interval(graphemeClusterIndex, graphemeClusterIndex + 1);
                    graphemeCluster.value.codeUnitsInterval = new Interval(index, codeUnitsIndex);

                    let root = { ref: this.clusters };

                    RedBlackTree.insertRight(graphemeCluster, root);
                    RedBlackTree.balance(graphemeCluster, root);

                    this.clusters = root.ref;

                    this._hasIndexed = true;

                    return;
                }

                else indexGraphemeCluster(codeUnitsIndex, index);
            }

            else {

                indexGraphemeCluster(codeUnitsIndex, index);
                this._hasIndexed = true;
                return;
            }
        }

        this._hasIndexed = true;
    }

    substr(startIndex: number, length: number) {
        let codeUnits = this.getSubstringCodeUnits(startIndex, length);
        let str = new GraphemeString(this.value.substr(codeUnits.index, codeUnits.length));

        return str;
    }

    nativeSubstr(startIndex: number, length: number) {
        let codeUnits = this.getSubstringCodeUnits(startIndex, length);
        let size = codeUnits.length;

        return this.value.substr(codeUnits.index, size);
    }

    getSubstringCodeUnits(startIndex: number, length: number) {
        this.index();

        let indexUpper = startIndex + length;
        let graphemeClusters = this.clusters;

        if (graphemeClusters == null)
            return new Interval(startIndex, indexUpper);

        let codeUnitsIndex = 0, codeUnitsIndexUpper: number;

        for (; ;) {
            if (startIndex < graphemeClusters.value.interval.index) {
                if (graphemeClusters.left != null)
                    graphemeClusters = graphemeClusters.left;

                else {
                    codeUnitsIndex = startIndex;

                    if (indexUpper <= graphemeClusters.value.interval.index)
                        return new Interval(codeUnitsIndex, indexUpper);

                    break;
                }
            }
            else if (graphemeClusters.value.interval.indexUpper <= startIndex)
                graphemeClusters = graphemeClusters.right;

            else {

                codeUnitsIndex = graphemeClusters.value.codeUnitsInterval.index + (startIndex - graphemeClusters.value.interval.index);

                if (indexUpper <= graphemeClusters.value.interval.indexUpper) {
                    if (length == 0)
                        return new Interval(codeUnitsIndex, codeUnitsIndex);

                    else if (graphemeClusters.value.interval.length == 1)
                        codeUnitsIndexUpper = graphemeClusters.value.codeUnitsInterval.indexUpper;

                    else codeUnitsIndexUpper = graphemeClusters.value.codeUnitsInterval.index + (indexUpper - graphemeClusters.value.interval.index);

                    return new Interval(codeUnitsIndex, codeUnitsIndexUpper);
                }

                break;
            }
        }

        for (graphemeClusters = this.clusters; ;) {
            if (indexUpper < graphemeClusters.value.interval.index)
                graphemeClusters = graphemeClusters.left;

            else if (graphemeClusters.value.interval.indexUpper < indexUpper)
                graphemeClusters = graphemeClusters.right;

            else {
                if (length == 0)
                    return new Interval(codeUnitsIndex, codeUnitsIndex);

                else if (graphemeClusters.value.interval.length == 1)
                    codeUnitsIndexUpper = graphemeClusters.value.codeUnitsInterval.indexUpper;

                else codeUnitsIndexUpper = graphemeClusters.value.codeUnitsInterval.index + (indexUpper - graphemeClusters.value.interval.index);

                return new Interval(codeUnitsIndex, codeUnitsIndexUpper);
            }
        }
    }
}