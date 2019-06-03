import { RedBlackTreeNode, RedBlackTreeNodeColor } from "./RedBlackTreeNode";

export class RedBlackTree {

    static insert<TValue>(node: RedBlackTreeNode<TValue>, root: { ref: RedBlackTreeNode<TValue> }, comparefn: (a: RedBlackTreeNode<TValue>, b: RedBlackTreeNode<TValue>) => number, nil: RedBlackTreeNode<TValue> = null) {

        node.left = node.right = nil;

        let parent = root.ref;

        if (parent === null) {

            (root.ref = node).parent = null;
            return;
        }

        for (; ;) {

            let c = comparefn(parent, node);

            if (0 < c) {

                if (parent.left == nil) {

                    (parent.left = node).parent = parent;
                    return;
                }

                parent = parent.left;
            }

            else {

                if (parent.right == nil) {

                    (parent.right = node).parent = parent;
                    return;
                }

                parent = parent.right;
            }
        }
    }

    static insertLeft<TValue>(node: RedBlackTreeNode<TValue>, root: { ref: RedBlackTreeNode<TValue> }, nil: RedBlackTreeNode<TValue> = null) {

        node.left = node.right = nil;

        let parent = root.ref;

        if (parent == null) {

            (root.ref = node).parent = null;
            return;
        }

        for (; ;) {

            if (parent.left == nil) {

                (parent.left = node).parent = parent;
                return;
            }

            parent = parent.left;
        }
    }

    static insertRight<TValue>(node: RedBlackTreeNode<TValue>, root: { ref: RedBlackTreeNode<TValue> }, nil: RedBlackTreeNode<TValue> = null) {

        node.left = node.right = nil;

        let parent = root.ref;

        if (parent == null) {

            (root.ref = node).parent = null;
            return;
        }

        for (; ;) {

            if (parent.right == nil) {

                (parent.right = node).parent = parent;
                return;
            }

            parent = parent.right;
        }
    }

    static rotateLeft<TValue>(node: RedBlackTreeNode<TValue>, root: { ref: RedBlackTreeNode<TValue> }) {

        let parent = node.parent, right = node.right;

        if (parent != null) {

            if (node == parent.left)
                parent.left = right;

            else parent.right = right;

            right.parent = parent;
        }

        else {

            root.ref = right;
            right.parent = null;
        }

        node.parent = right;
        parent = right.left;
        right.left = node;
        node.right = parent;

        if (parent != null)
            parent.parent = node;
    }

    static rotateRight<TValue>(node: RedBlackTreeNode<TValue>, root: { ref: RedBlackTreeNode<TValue> }) {

        let parent = node.parent, left = node.left;

        if (parent != null) {
            
            if (node == parent.right)
                parent.right = left;

            else parent.left = left;

            left.parent = parent;
        }

        else {

            root.ref = left;
            left.parent = null;
        }

        node.parent = left;
        parent = left.right;
        left.right = node;
        node.left = parent;

        if (parent != null)
            parent.parent = node;
    }

    static balance<TValue>(node: RedBlackTreeNode<TValue>, root: { ref: RedBlackTreeNode<TValue> }, nil: RedBlackTreeNode<TValue> = null) {

        let parent = node.parent;

        if (parent == null) {

            node.color = RedBlackTreeNodeColor.Black;
            return;
        }

        node.color = RedBlackTreeNodeColor.Red;

        // Case 2

        if (parent.color == RedBlackTreeNodeColor.Black)
            return;

        for (let c = 3; ;) {

            switch (c) {

                case 3:

                    let grandparent = parent.parent;

                    grandparent = ((parent == grandparent.left) ? grandparent.right : grandparent.left);

                    if (grandparent != null && grandparent.color == RedBlackTreeNodeColor.Red) {

                        parent.color = grandparent.color = RedBlackTreeNodeColor.Black;
                        node = grandparent.parent;
                        node.color = RedBlackTreeNodeColor.Red;
                        parent = node.parent;

                        // Case 1

                        if (parent == null) {

                            node.color = RedBlackTreeNodeColor.Black;
                            return;
                        }

                        // Case 2

                        if (parent.color == RedBlackTreeNodeColor.Black)
                            return;

                        c = 3;
                        continue;
                    }

                    else grandparent = parent.parent;

                    // Case 4

                    if (node == parent.right) {

                        if (parent == grandparent.left) {

                            this.rotateLeft(parent, root);

                            parent = node;
                            grandparent = parent.parent;
                            node = node.left;

                        }
                    }

                    else if (parent == grandparent.right) {

                        this.rotateRight(parent, root);

                        parent = node;
                        grandparent = parent.parent;
                        node = node.right;
                    }

                    // Case 5

                    parent.color = RedBlackTreeNodeColor.Black;
                    grandparent.color = RedBlackTreeNodeColor.Red;

                    if (node == parent.left)
                        this.rotateRight(grandparent, root);

                    else this.rotateLeft(grandparent, root);
            }

            break;
        }
    }
}