import {FormEvent, useCallback, useEffect, useRef, useState} from 'react';
import {Editor, Path, Range, Text, Transforms} from 'slate';
import {ReactEditor} from 'slate-react';

import type {Options} from './types'
import {hasEditableTarget} from './utils';
import {isLineBreakMutation} from './mutation-detection-utils';
import {diffText, getInsertedText, InsertedText} from './diff-text';
import {useTrackUserInput} from './use-track-user-input';
import {useRestoreDOM} from './use-restore-dom';

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  childList: true,
  characterData: true,
  characterDataOldValue: true,
  subtree: true,
};

export function useMutationObserver(editor: ReactEditor, {readOnly}: Options) {
  const nodeRef = useRef<HTMLElement>();
  const {userInput, attributes: trackUserInputAttributes} = useTrackUserInput();
  const {restoreDOM, attributes: restoreDOMAttributes} = useRestoreDOM();
  const handleMutations = useCallback((mutations: MutationRecord[]) => {
    if (!userInput.current || mutations.length === 0) {
      return;
    }

    const {selection} = editor;
    const addedNodes: Node[] = [];
    const removedNodes: Node[] = [];
    const insertedText: InsertedText[] = [];
    let shouldRestoreDOM = true;

    mutations.forEach(mutation => {
      switch (mutation.type) {
        case 'childList': {
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach(addedNode => {
              addedNodes.push(addedNode);
            });
          }

          mutation.removedNodes.forEach(removedNode => {
            removedNodes.push(removedNode);
          });

          break;
        }
        case 'characterData': {
          // Changes to text nodes should consider the parent element
          const {parentNode} = mutation.target;

          if (!parentNode) {
            return;
          }

          const node = ReactEditor.toSlateNode(editor, parentNode) as Text;
          const prevText = node.text;
          let nextText = parentNode.textContent!;

          // textContent will pad an extra \n when the textContent ends with an \n
          if (nextText.endsWith('\n')) {
            nextText = nextText.slice(0, nextText.length - 1);
          }

          // If the text is no different, there is no diff.
          if (nextText !== prevText) {
            const textDiff = diffText(prevText, nextText);
            if (textDiff !== null) {
              const textPath = ReactEditor.findPath(editor, node);

              if (insertedText.some(({path}) => Path.equals(path, textPath))) {
                return;
              }

              insertedText.push({text: textDiff, path: textPath});
            }
          }
        }
      }
    });

    if (selection && Range.isExpanded(selection) && removedNodes.length) {
      // Delete expanded selection
      Editor.deleteFragment(editor);

      const text = getInsertedText(insertedText);
      if (text.length) {
        // Selection was replaced by text
        Editor.insertText(editor, text);
      }
    } else if (isLineBreakMutation(editor, addedNodes)) {
      // Insert line break
      Editor.insertBreak(editor);
    } else if (removedNodes.length) {
      // Delete contents backwards
      Editor.deleteBackward(editor);
    } else if (insertedText.length) {
      // Insert text
      insertedText.forEach(({text, path}) =>
        Transforms.insertText(editor, text.insertText, {
          at: {
            anchor: {path, offset: text.start},
            focus: {path, offset: text.end},
          },
        })
      );

      shouldRestoreDOM = false;
    }

    if (shouldRestoreDOM) {
      // When the Slate document gets out of sync with the DOM, we need to
      // force restore the DOM by incementing the `key` prop on the Editor
      // This approach is expensive, in the future, perhaps only certain
      // portions sof the document could be restored
      restoreDOM();
    }
  }, []);
  const [mutationObserver] = useState(
    () => new MutationObserver(handleMutations)
  );

  useEffect(() => {
    nodeRef.current = ReactEditor.toDOMNode(editor, editor);

    if (!nodeRef.current) {
      throw new Error('Editor root node is not present');
    }

    const overrideBeforeInput = (event: Event) => {
      if (event.target === nodeRef.current) {
        event.stopPropagation();
      }
    };

    // To-do: Need a better way to override Slate's handling of the DOM beforeinput event
    window.addEventListener('beforeinput', overrideBeforeInput, true);

    // Attach mutation observer to the editor's root node
    mutationObserver.observe(nodeRef.current, MUTATION_OBSERVER_CONFIG);

    return () => {
      mutationObserver.disconnect();
      window.removeEventListener('beforeinput', overrideBeforeInput);
    };
  });

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      if (!readOnly && hasEditableTarget(editor, event.target)) {
        event.preventDefault();
        ReactEditor.insertData(editor, event.clipboardData);
      }
    },
    [readOnly]
  );

  return {
    attributes: {
      ...restoreDOMAttributes,
      ...trackUserInputAttributes,
      onPaste: handlePaste,
      onBeforeInput: overrideHandler,
      onDOMBeforeInput: overrideHandler,
      onCompositionStart: overrideHandler,
      onCompositionEnd: overrideHandler,
    },
  };
}

function overrideHandler(event: FormEvent<any> | Event) {
  event.stopPropagation();
}
