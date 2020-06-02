import 'vtex-tachyons/tachyons.css';

import { LoadMicroComponent } from '@vtex/micro-react/components';
import { withIntlProvider } from '@vtex/micro-react-intl/components';
import { withRouter } from '@vtex/micro-react-router/components';

import { AsyncImport } from '../components/asyncPages';
import Page from '../components/pages/home';
import messages from '../messages/en.json';

export default LoadMicroComponent(
  withIntlProvider(
    withRouter(Page, AsyncImport),
    messages,
    'en'
  )
);
