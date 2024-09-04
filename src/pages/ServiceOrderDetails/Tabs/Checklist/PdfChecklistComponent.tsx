import {CheckListComponentType, CheckListComponentView} from 'models/checklist';
import {Image, Text, View, StyleSheet} from '@react-pdf/renderer';
import CheckBox from 'assets/icons/CheckBox.png';
import CheckBoxOutlineBlank from 'assets/icons/CheckBoxOutlineBlank.png';
import RadioButtonChecked from 'assets/icons/RadioButtonChecked.png';
import TextSnippet from 'assets/icons/TextSnippet.png';

interface PdfChecklistComponentProps {
  components: CheckListComponentView[];
  selectedLng?: string;
}

interface ComponentProps {
  component: CheckListComponentView;
  selectedLng?: string;
}

interface ExtendedComponentProps extends ComponentProps {
  index: number;
}

const getStyles = (boldFontStyle?: {fontFamily: string}) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    subject: {
      fontSize: 10,
      color: '#212121',
      ...boldFontStyle,
      paddingVertical: 8,
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
      paddingLeft: '5%',
      marginTop: 7,
    },
    imageContainer: {
      display: 'flex',
      flexDirection: 'row',
      marginVertical: 10,
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
      <View style={styles.imageContainer}>
        {component.additionalInfo.pictures?.map((pic, i) => (
          <Image
            key={pic.uri}
            src={pic.uri}
            style={{
              width: 140,
              height: 100,
              marginLeft: i === 0 ? 0 : 10,
              borderRadius: 5,
              objectFit: 'cover',
            }}
          />
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
    <View>
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
      <View style={styles.imageContainer}>
        {component.additionalInfo.pictures?.map((pic, i) => (
          <Image
            key={pic.uri}
            src={pic.uri}
            style={{
              width: 140,
              height: 100,
              marginLeft: i === 0 ? 0 : 10,
              borderRadius: 5,
              objectFit: 'cover',
            }}
          />
        ))}
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
            style={{
              width: 12,
              height: 12,
              paddingRight: 7,
            }}
          />
          <Text>{component.additionalInfo.note}</Text>
        </View>
      )}
      <View style={styles.imageContainer}>
        {component.additionalInfo.pictures?.map((pic, i) => (
          <Image
            key={pic.uri}
            src={pic.uri}
            style={{
              width: 140,
              height: 100,
              marginLeft: i === 0 ? 0 : 10,
              borderRadius: 5,
              objectFit: 'cover',
            }}
          />
        ))}
      </View>
    </View>
  );
};

export const PdfChecklistComponent = ({
  components,
  selectedLng,
}: PdfChecklistComponentProps) => {
  const boldFontStyle = {
    fontFamily: selectedLng === 'ka-ge' ? 'NotoSans-Bold' : 'Montserrat-Bold',
  };

  const styles = getStyles(boldFontStyle);

  let index = 1;

  const renderComponent = (component: CheckListComponentView) => {
    switch (component.type) {
      case CheckListComponentType.SINGLE_CHECK: {
        const currentIndex = index;
        index += 1;
        return (
          <MultiChoiceComponent
            component={component}
            selectedLng={selectedLng}
            index={currentIndex}
          />
        );
      }
      case CheckListComponentType.YES_NO: {
        const currentIndex = index;
        index += 1;
        return (
          <CheckboxComponent
            component={component}
            selectedLng={selectedLng}
            index={currentIndex}
          />
        );
      }
      case CheckListComponentType.HEAD: {
        return (
          <HeaderComponent component={component} selectedLng={selectedLng} />
        );
      }
      case CheckListComponentType.TEXT: {
        const currentIndex = index;
        index += 1;
        return (
          <TextComponent
            component={component}
            selectedLng={selectedLng}
            index={currentIndex}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {components?.map((component, idx) => (
        <View key={idx}>{renderComponent(component)}</View>
      ))}
    </View>
  );
};
