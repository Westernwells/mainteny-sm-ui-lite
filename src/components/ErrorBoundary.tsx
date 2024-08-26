import React from 'react';
import {Location, NavigateFunction} from 'react-router-dom';
import {Helmet} from 'react-helmet';
import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {ReactComponent as UnexpectedErrorIllustration} from 'assets/illustrations/UnexpectedError.svg';
import {Button} from 'components/Button';
import {withSnackbar, WithSnackbarProps} from 'notistack';
import {withTranslation, WithTranslation} from 'react-i18next';
import {PageLayout} from './PageLayout';

interface Props extends WithSnackbarProps, WithTranslation {
  navigate: NavigateFunction;
  location: Location;
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  renderCount: number; // Use a regular instance property instead of a ref

  constructor(props: Props) {
    super(props);
    this.state = {hasError: false};
    this.renderCount = 0; // Initialize the count
  }

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidUpdate(prevProps: Props) {
    const {location} = this.props;
    const {hasError} = this.state;

    if (hasError && prevProps.location.pathname !== location.pathname) {
      this.setState({hasError: false});
      this.renderCount = 0; // Reset the count directly
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    this.renderCount += 1;

    const {hasError} = this.state;
    const {navigate, children, location, t, enqueueSnackbar} = this.props;

    const titleTail = 'Service Manager Portal';

    if (
      hasError &&
      this.renderCount >= 3 &&
      location.pathname.includes('/articles/details')
    ) {
      location.state = {error: 'error'};
      navigate(-1);
      this.renderCount = 0;

      enqueueSnackbar(t('Article is not in the inventory'), {variant: 'error'});
    }

    if (hasError) {
      return (
        <>
          <Helmet>
            <title>{t('Uncaught error! - {{titleTail}}', {titleTail})}</title>
          </Helmet>
          <PageLayout pageTitle={t('Sorry!')}>
            <Box
              height="80vh"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              px="10%">
              <UnexpectedErrorIllustration />
              <Typography variant="h4" textAlign="center" mt={6}>
                {t('Uh-oh! This must be an error from our side 🙃')}
                <br />
                {t('We will fix this shortly 🙏🏻')}
              </Typography>
              <Box mt={6}>
                <Button
                  label={t('Home')}
                  buttonProps={{
                    variant: 'contained',
                    size: 'large',
                    onClick: () => navigate('/', {replace: true}),
                  }}
                  style={{width: '150px', height: '50px'}}
                />
              </Box>
            </Box>
          </PageLayout>
        </>
      );
    }

    return children;
  }
}

export default withTranslation()(withSnackbar(ErrorBoundary));
