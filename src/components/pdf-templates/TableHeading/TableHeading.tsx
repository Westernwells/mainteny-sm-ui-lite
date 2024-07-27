import {Text} from '@react-pdf/renderer';

type Props = {
  text: string;
  width: string;
  textAlign: 'left' | 'right' | 'center' | 'justify' | undefined;
  marginLeft?: number;
};

const TableHeading = ({text, width, textAlign, marginLeft}: Props) => (
  <Text
    style={{
      width,
      textAlign,
      marginLeft,
      fontSize: 6,
      textTransform: 'uppercase',
    }}>
    {text}
  </Text>
);

export default TableHeading;
