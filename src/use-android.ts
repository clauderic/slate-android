import {ReactEditor} from 'slate-react';

import {Options} from './types';
import {useMutationObserver} from './use-mutation-observer';

const defaultOptions: Options = {
  readOnly: false,
};

export function useAndroid(
  editor: ReactEditor,
  options: Options = defaultOptions
) {
  return useMutationObserver(editor, options);
}
