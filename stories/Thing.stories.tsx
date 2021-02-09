import React from 'react';
import {Meta, Story} from '@storybook/react';

import {RichTextEditor, Props} from './Example';

const meta: Meta = {
  title: 'RichTextEditor',
  component: RichTextEditor,
  argTypes: {
    value: {
      control: {
        type: 'text',
      },
      defaultValue: [
        {
          type: 'paragraph',
          children: [
            {text: 'This is editable '},
            {text: 'rich', bold: true},
            {text: ' text!'},
            {text: 'and', italic: true},
            {text: ' here is a token '},
            {
              type: 'token',
              value: 'Product name',
              children: [
                {
                  text: '',
                },
              ],
            },
            {text: '!'},
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text:
                "Since it's rich text, you can do things like turn a selection of text ",
            },
            {text: 'bold', bold: true},
            {
              text:
                ', or add a semantically rendered block quote in the middle of the page, like this:',
            },
          ],
        },
      ],
    },
  },
  parameters: {
    controls: {expanded: true},
  },
};

export default meta;

const Template: Story<Props> = args => <RichTextEditor {...args} />;

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
