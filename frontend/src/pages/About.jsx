import { Button, Result } from 'antd';

import useLanguage from '@/locale/useLanguage';

const About = () => {
  const translate = useLanguage();
  return (
    <Result
      status="info"
      title={'SuperSayur ERP & CRM'}
      subTitle={translate('Do you need help on maintain this app?')}
      extra={
        <>
          <p>
            Website : <a href="https://github.com/Herjuna3008">Contact Us Now!</a>{' '}
          </p>
          <p>
            GitHub :{' '}
            <a href="https://github.com/Herjuna3008">
              https://github.com/Herjuna3008
            </a>
          </p>
          <Button
            type="primary"
            onClick={() => {
              window.open(`https://github.com/Herjuna3008`);
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
