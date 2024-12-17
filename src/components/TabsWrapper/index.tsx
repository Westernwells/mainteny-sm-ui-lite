import {PropsWithChildren} from 'react';
import {Props as OldTabsProps, Tabs as OldTabs} from '../Tab';

interface TabWrapperProps extends OldTabsProps {
  shouldWrap?: boolean;
}

const TabsWrapper = ({
  shouldWrap = false,
  children,
  onChange,
  ...tabsProps
}: PropsWithChildren<TabWrapperProps>) => {
  if (!shouldWrap) return children;
  return (
    <OldTabs onChange={onChange} {...tabsProps}>
      {children}
    </OldTabs>
  );
};

export default TabsWrapper;
