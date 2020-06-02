import 'vtex-tachyons/tachyons.css';

import { LoadMicroComponent } from '@vtex/micro-react/components';
import { withRouter } from '@vtex/micro-react-router/components';

import { AsyncImport } from '../components/asyncPages';
import Page from '../components/pages/500';

export default LoadMicroComponent(withRouter(Page, AsyncImport));
