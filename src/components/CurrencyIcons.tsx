import {SVGProps} from 'react';
import {ReactComponent as USDollar} from '../assets/icons/USDollar.svg';
import {ReactComponent as Euro} from '../assets/icons/Euro.svg';
import {ReactComponent as GBP} from '../assets/icons/GBP.svg';
import {ReactComponent as ChinaYuan} from '../assets/icons/ChinaYuan.svg';
import {ReactComponent as JPYen} from '../assets/icons/JPYen.svg';
import {ReactComponent as BAM} from '../assets/icons/BAM.svg';
import {ReactComponent as CHF} from '../assets/icons/CHF.svg';
import {ReactComponent as RUB} from '../assets/icons/RUB.svg';
import {ReactComponent as DKK} from '../assets/icons/DKK.svg';
import {ReactComponent as NGN} from '../assets/icons/NGN.svg';
import {ReactComponent as GEL} from '../assets/icons/GEL.svg';
import {ReactComponent as MXN} from '../assets/icons/MXN.svg';

export const getCurrencyData: {
  [key: string]: {
    symbol: string;
    FlagComponent: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  };
} = {
  USD: {symbol: '$', FlagComponent: (props) => <USDollar {...props} />},
  EUR: {symbol: '€', FlagComponent: (props) => <Euro {...props} />},
  GBP: {symbol: '£', FlagComponent: (props) => <GBP {...props} />},
  CNY: {symbol: '¥', FlagComponent: (props) => <ChinaYuan {...props} />},
  JPY: {symbol: '¥', FlagComponent: (props) => <JPYen {...props} />},
  BAM: {symbol: 'KM', FlagComponent: (props) => <BAM {...props} />},
  CHF: {symbol: 'CHF', FlagComponent: (props) => <CHF {...props} />},
  RUB: {symbol: '₽', FlagComponent: (props) => <RUB {...props} />},
  DKK: {symbol: 'kr', FlagComponent: (props) => <DKK {...props} />},
  NGN: {symbol: '₦', FlagComponent: (props) => <NGN {...props} />},
  GEL: {symbol: '₾', FlagComponent: (props) => <GEL {...props} />},
  MXN: {symbol: '$', FlagComponent: (props) => <MXN {...props} />},
};
