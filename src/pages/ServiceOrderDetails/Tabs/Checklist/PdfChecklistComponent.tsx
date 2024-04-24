import {CheckListComponentType, CheckListComponentView} from 'models/checklist';
import {Image, Text, View, StyleSheet} from '@react-pdf/renderer';
import CheckBox from 'assets/icons/CheckBox.png';
import CheckBoxOutlineBlank from 'assets/icons/CheckBoxOutlineBlank.png';
import RadioButtonChecked from 'assets/icons/RadioButtonChecked.png';
import TextSnippet from 'assets/icons/TextSnippet.png';

interface ComponentProps {
  component: CheckListComponentView;
  selectedLng?: string;
}

interface ExtendedComponentProps extends ComponentProps {
  index?: number;
}

const getStyles = (boldFontStyle?: {fontFamily: string}) =>
  StyleSheet.create({
    subject: {
      fontSize: 10,
      color: '#212121',
      ...boldFontStyle,
      paddingVertical: 8,
      borderTop: '1px solid rgb(143, 155, 179)',
      borderBottom: '1px solid rgb(143, 155, 179)',
      width: '100%',
      paddingLeft: '5%',
    },
    checkboxContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 5,
    },
    checkboxIndex: {
      flex: '0 0 5%',
    },
    checkboxContent: {
      flex: '0 0 95%',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
    },
    checkboxText: {
      paddingLeft: 5,
      color: '#212121',
    },
    multiChoiceContainer: {
      borderBottom: '1px solid rgb(143, 155, 179)',
      paddingVertical: 5,
    },
    multiChoiceHeader: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 3,
    },
    multiChoiceIndex: {
      flex: '0 0 5%',
    },
    multiChoiceHeaderContent: {
      flex: '0 0 95%',
      fontSize: 9,
      color: '#212121',
      ...boldFontStyle,
    },
    multiChoiceContent: {
      paddingLeft: '5%',
    },
    multiChoiceTextContent: {
      color: '#212121',
      paddingLeft: 5,
    },
    textContent: {
      paddingLeft: '5%',
      fontSize: 9,
      color: '#212121',
      ...boldFontStyle,
      marginTop: 4,
    },
    textNoteContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingLeft: '5%',
    },
  });

export const MultiChoiceComponent = ({
  component,
  selectedLng,
  index,
}: ExtendedComponentProps) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);

  return (
    <View style={styles.multiChoiceContainer}>
      <View style={styles.multiChoiceHeader}>
        <Text style={styles.multiChoiceIndex}>{index}</Text>
        <Text style={styles.multiChoiceHeaderContent}>{component.subject}</Text>
      </View>

      <View style={styles.multiChoiceContent}>
        {component.additionalInfo.options.map((option, optionIndex) => (
          <View
            key={optionIndex}
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              paddingTop: 2,
            }}>
            {component.additionalInfo?.answer?.[0] === String(optionIndex) && (
              <Image src={RadioButtonChecked} style={{width: 12, height: 12}} />
            )}
            {component.additionalInfo?.answer?.[0] === String(optionIndex) && (
              <Text style={styles.multiChoiceTextContent}>{option.text}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export const CheckboxComponent = ({
  component,
  selectedLng,
  index,
}: ExtendedComponentProps) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);

  return (
    <View style={styles.checkboxContainer}>
      <View style={styles.checkboxIndex}>
        <Text>{index}</Text>
      </View>
      <View style={styles.checkboxContent}>
        {component.additionalInfo?.answer?.[0] === 'y' ? (
          <Image src={CheckBox} style={{width: 12, height: 12}} />
        ) : (
          <Image src={CheckBoxOutlineBlank} style={{width: 12, height: 12}} />
        )}
        <Text style={styles.checkboxText}>{component.subject}</Text>
      </View>
    </View>
  );
};

export const HeaderComponent = ({component, selectedLng}: ComponentProps) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);

  return <Text style={styles.subject}>{component.subject}</Text>;
};

export const TextComponent = ({
  component,
  selectedLng,
  index,
}: ExtendedComponentProps) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);

  return (
    <View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 8,
        }}>
        <Text style={{flex: '0 0 5%'}}>{index}</Text>
        <Text style={{flex: '0 0 95%', ...boldFontStyle}}>
          {component.subject}
        </Text>
      </View>

      {component.additionalInfo.note && (
        <View style={styles.textNoteContainer}>
          <Image
            src={TextSnippet}
            style={{width: 12, height: 12, flex: '0 0 3%'}}
          />
          <Text style={{flex: '0 0 97%'}}>{component.additionalInfo.note}</Text>
        </View>
      )}
    </View>
  );
};

export const PdfChecklistComponent = ({
  component,
  selectedLng,
  index,
}: ExtendedComponentProps) =>
  component.type === CheckListComponentType.SINGLE_CHECK ? (
    <MultiChoiceComponent
      component={component}
      selectedLng={selectedLng}
      index={index}
    />
  ) : component.type === CheckListComponentType.YES_NO ? (
    <CheckboxComponent
      component={component}
      selectedLng={selectedLng}
      index={index}
    />
  ) : component.type === CheckListComponentType.HEAD ? (
    <HeaderComponent component={component} selectedLng={selectedLng} />
  ) : component.type === CheckListComponentType.TEXT ? (
    <TextComponent
      component={component}
      selectedLng={selectedLng}
      index={index}
    />
  ) : null;
