import React, {useState} from 'react';
import {createEditor, Editor, Node, Element} from 'slate';
import {
  Slate,
  Editable,
  withReact,
  RenderLeafProps,
  RenderElementProps,
  useFocused,
  useSelected,
} from 'slate-react';

import {useAndroid} from '../src';

export interface Props {
  value?: Node[];
}

export function RichTextEditor({value: initialValue}: Props) {
  const [editor] = useState(() => withReact(withToken(createEditor())));
  const {attributes} = useAndroid(editor);
  const [value, setValue] = useState<Node[]>(initialValue);

  return (
    <>
      <Slate editor={editor} value={value} onChange={setValue}>
        <Editable
          {...attributes}
          renderLeaf={renderLeaf}
          renderElement={renderElement}
        />
      </Slate>
      <pre>{JSON.stringify(value, undefined, 2)}</pre>
    </>
  );
}

function withToken(editor: Editor) {
  const {isInline, isVoid} = editor;

  editor.isInline = element => {
    return element.type === 'token' ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === 'token' ? true : isVoid(element);
  };

  return editor;
}

interface TokenElement extends Element {
  value: string;
}

interface TokenElementProps extends RenderElementProps {
  element: TokenElement;
}

function Token({attributes, element, children}: TokenElementProps) {
  const selected = useSelected();
  const focused = useFocused();

  return (
    <code
      {...attributes}
      style={{
        background: '#EEE',
        border: '1px solid',
        borderColor: selected && focused ? 'blue' : '#DDD',
      }}
    >
      <span contentEditable={false} style={{userSelect: 'none'}}>
        {element.value}
      </span>
      {children}
    </code>
  );
}

function isToken(props: RenderElementProps): props is TokenElementProps {
  return props.element.type === 'token';
}

function renderLeaf({attributes, children, leaf}: RenderLeafProps) {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
}

function renderElement(props: RenderElementProps) {
  const {attributes, children} = props;

  if (isToken(props)) {
    return <Token {...props} />;
  }

  return <p {...attributes}>{children}</p>;
}
