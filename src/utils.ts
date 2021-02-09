import {ReactEditor} from 'slate-react';

export type DOMNode = Node;

/**
 * Check if a value is a DOM node.
 */

export const isDOMNode = (value: any): value is DOMNode => {
  return value instanceof Node;
};

/**
 * Check if the target is editable and in the editor.
 */

export function hasEditableTarget(
  editor: ReactEditor,
  target: EventTarget | null
): target is DOMNode {
  return (
    isDOMNode(target) &&
    ReactEditor.hasDOMNode(editor, target, {editable: true})
  );
}
