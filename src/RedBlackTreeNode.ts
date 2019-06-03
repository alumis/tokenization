export class RedBlackTreeNode<TValue>
{
    value: TValue;
    parent: RedBlackTreeNode<TValue>;
    left: RedBlackTreeNode<TValue>;
    right: RedBlackTreeNode<TValue>;

    color: RedBlackTreeNodeColor;

    get leftmost() {

        for (var node: RedBlackTreeNode<TValue> = this; node.left !== null; node = node.left) ;
        return node;
    }

    get rightmost() {

        for (var node: RedBlackTreeNode<TValue> = this; node.right !== null; node = node.right) ;
        return node;
    }

    get next() {

        if (this.right !== null)
            return this.right.leftmost;

        if (this.parent === null)
            return null;

        if (this.parent.left === this)
            return this.parent;

        else {

            for (var node = this.parent; node.parent !== null && node.parent.right === node; node = node.parent) ;

            return node.parent;
        }
    }

    toString() {

        return this.value && String(this.value);
    }
}

export enum RedBlackTreeNodeColor {

    Red,
    Black
}