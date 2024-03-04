import React from 'react';
import {Location, NavigateFunction} from 'react-router-dom';
import {Helmet} from 'react-helmet';
import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {ReactComponent as UnexpectedErrorIllustration} from 'assets/illustrations/UnexpectedError.svg';
import {Button} from 'components/Button';
import {PageLayout} from './PageLayout';

interface Props {
  navigate: NavigateFunction;
  location: Location;
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return {hasError: true};
  }

  componentDidUpdate(prevProps: Props) {
    const {location} = this.props;
    const {hasError} = this.state;
    if (hasError && prevProps.location.pathname !== location.pathname) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({hasError: false});
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const {hasError} = this.state;
    const {navigate, children} = this.props;
    const titleTail = 'Service Manager Portal';
    if (hasError) {
      return (
        <>
          <Helmet>
            <title>{`Uncaught error! - ${titleTail}`}</title>
          </Helmet>
          <PageLayout pageTitle="Sorry!">
            <Box
              height="80vh"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              px="10%">
              <UnexpectedErrorIllustration />
              <Typography variant="h4" textAlign="center" mt={6}>
                Uh-oh! This must be an error from our side 🙃
                <br />
                We will fix this shortly 🙏🏻
              </Typography>
              <Box mt={6}>
                <Button
                  label="Home"
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

export default ErrorBoundary;
