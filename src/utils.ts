import {FormEvent} from 'react';
import {ReactEditor} from 'slate-react';

import {DOMNode} from './types';

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

/**
 * Override Slate's default handlers for a given event
 */

export function overrideHandler(event: FormEvent<any> | Event) {
  event.stopPropagation();
}

/**
 * Temporary fix for Android not allowing setting 'application/x-slate-fragment' on the clipboardData data transfer
 * Returns a new DataTransfer instance containing the 'application/x-slate-fragment' fragment if present
 */
export function extractSlateFragment(clipboardData: DataTransfer) {
  const element = document.createElement('div');
  element.innerHTML = clipboardData.getData('text/html');

  const fragment = element
    .querySelector('[data-slate-fragment]')
    ?.getAttribute('data-slate-fragment');

  if (!fragment) {
    // ReactEditor.insertData will use 'text/plain' if no fragment is found
    return clipboardData;
  }

  const data = new DataTransfer();
  data.setData('application/x-slate-fragment', fragment);

  return data;
}
