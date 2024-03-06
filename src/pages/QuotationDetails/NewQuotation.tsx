import {useLocation} from 'react-router-dom';
import queryString from 'query-string';
import {useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {Progress} from 'components/Progress';
import DraftQuotation from './DraftQuotation';

export const NewQuotation = () => {
  const {search} = useLocation();
  const {id = ''} = queryString.parse(search);

  const {data: quotation, isLoading} =
    typeof id === 'string'
      ? useQuotationDetails(id, {
          enabled: !!id,
        })
      : {data: undefined, isLoading: false};

  if (isLoading) {
    return <Progress />;
  }

  return <DraftQuotation formType="new" quotation={quotation} />;
};

export default NewQuotation;
