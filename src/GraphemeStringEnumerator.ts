import { RedBlackTreeNode } from "./RedBlackTreeNode";
import { GraphemeCluster } from "./GraphemeCluster";
import { GraphemeString } from "./GraphemeString";

export class GraphemeStringEnumerator
{
    constructor(str: GraphemeString)
    {
        (this._string = str).index();
        this.reset();
    }

    private _string: GraphemeString;

    position: GraphemeStringEnumeratorPosition;
    current: string;
    currentUtf16Position: number;

    reset()
    {
        this.position.graphemeCluster = this._string.clusters && this._string.clusters.leftmost;
        this.position.index = 0;
    }

    moveNext()
    {
        if (this.position.graphemeCluster === null)
        {
            if (this.position.index < this._string.value.length)
            {
                this.current = this._string.value.charAt(this.currentUtf16Position = this.position.index++);
                return true;
            }

            return false;
        }

        if (this.position.index < this.position.graphemeCluster.value.interval.index)
        {
            this.current = this._string.value.charAt(this.currentUtf16Position = this.position.index++);
            return true;
        }

        if (this.position.graphemeCluster.value.interval.indexUpper <= this.position.index)
        {
            if ((this.position.graphemeCluster = this.position.graphemeCluster.next) === null)
                return false;
        }

        if (this.position.graphemeCluster.value.interval.length === 1)
        {
            this.current = this._string.value.substr(this.currentUtf16Position = this.position.graphemeCluster.value.codeUnitsInterval.index, this.position.graphemeCluster.value.codeUnitsInterval.length);
            this.position.index++;

            return true;
        }

        this.current = this._string.value.charAt(this.currentUtf16Position = this.position.graphemeCluster.value.codeUnitsInterval.index + (this.position.index++ - this.position.graphemeCluster.value.interval.index));

        return true;
    }
}

export class GraphemeStringEnumeratorPosition {
    
    graphemeCluster: RedBlackTreeNode<GraphemeCluster>;
    index: number;
}