import {Node} from 'slate';
import {ReactEditor} from 'slate-react';

import {DOMNode} from './types';

export function isLineBreakMutation(editor: ReactEditor, nodes: DOMNode[]) {
  const {selection} = editor;
  const parentNode = selection
    ? Node.parent(editor, selection.anchor.path)
    : null;
  const parentDOMNode = parentNode
    ? ReactEditor.toDOMNode(editor, parentNode)
    : null;

  if (!parentDOMNode) {
    return false;
  }

  return nodes.some(
    addedNode =>
      addedNode instanceof HTMLElement &&
      addedNode.tagName === parentDOMNode?.tagName
  );
}
