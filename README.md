# Slate Android

This repository is a work in progress. It builds on previous approaches to bring Android support to [Slate](https://www.slatejs.org/).

## Usage

```jsx
import React, {useMemo} from 'react';
import {createEditor, Node} from 'slate';
import {Editable, Slate, withReact} from 'slate-react';
import {useAndroid} from 'slate-android';

export function Editor() {
  const [value, setValue] = useState([{children: [{text: 'Hello, world!'}]}]);
  const editor = useMemo(() => withReact(createEditor()), []);
  const {attributes} = useAndroid(editor);

  return (
    <div>
      <Slate value={value} editor={editor} onChange={setValue}>
        <Editable {...attributes} />
      </Slate>
    </div>
  );
}
```

## Commands

### Watch for changes

```bash
npm start # or yarn start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

Then run either Storybook or the example playground:

### Storybook

Run inside another terminal:

```bash
yarn storybook
```
