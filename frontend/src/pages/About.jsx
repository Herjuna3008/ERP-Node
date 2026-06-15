import { Button, Result } from 'antd';

import useLanguage from '@/locale/useLanguage';

const About = () => {
  const translate = useLanguage();
  return (
    <Result
      status="info"
      title={'CuanFlow'}
      subTitle={translate('Do you need help on customize of this app?')}
      extra={
        <>
          <p>
            Website : <a href="https://www.CuanFlow.com">www.CuanFlow.com</a>{' '}
          </p>
          <p>
            GitHub :{' '}
            <a href="https://github.com/Herjuna3008/ERP-Node/">
              https://github.com/Herjuna3008/ERP-Node/
            </a>
          </p>
          <Button
            type="primary"
            onClick={() => {
              window.open(`https://www.CuanFlow.com/contact-us/`);
            }}
          >
            {translate('Contact us')}
          </Button>
        </>
      }
    />
  );
};

export default About;
