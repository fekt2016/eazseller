import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeadset } from 'react-icons/fa';
import usePageTitle from '../../shared/hooks/usePageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  PolicyContainer,
  PolicyContent,
  PolicyHeader,
  PolicyTitle,
  LastUpdated,
  IntroText,
  PolicySection,
  SectionTitle,
  SectionContent,
  BulletList,
  Paragraph,
  HelpSection,
  HelpTitle,
  HelpText,
  HelpButton,
  SectionDivider,
} from './policy.styles';

/**
 * Cookie Policy Page for Saiisai Seller
 * Explains how we use cookies and similar technologies
 */
const CookiePolicyPage = () => {
  const today = new Date();
  const effectiveDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  usePageTitle({
    title: 'Cookie Policy • Saiisai Seller',
    description: 'Learn how Saiisai Seller uses cookies and similar technologies.',
    keywords: 'cookie policy, cookies, Saiisai Seller privacy, data protection',
  });

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <PolicyContainer>
      <PolicyContent
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <PolicyHeader variants={staggerItem}>
          <PolicyTitle>Cookie Policy</PolicyTitle>
          <LastUpdated>Effective Date: {effectiveDate}</LastUpdated>
          <IntroText>
            Saiisai Seller uses cookies and similar technologies to provide, secure, and improve our seller dashboard. This Cookie Policy explains what cookies we use, why we use them, and how you can manage your preferences. By continuing to use Saiisai Seller, you consent to our use of cookies as described below.
          </IntroText>
        </PolicyHeader>

        <PolicySection variants={staggerItem}>
          <SectionTitle>1. What Are Cookies?</SectionTitle>
          <SectionContent>
            <Paragraph>
              Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you logged in, and improve your experience. We also use similar technologies such as localStorage and sessionStorage.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>2. Types of Cookies We Use</SectionTitle>
          <SectionContent>
            <Paragraph>
              We use the following categories of cookies on Saiisai Seller:
            </Paragraph>
            <BulletList>
              <li>
                <strong>Strictly Necessary:</strong> Required for the seller dashboard to function. These include authentication, security, and session management. They cannot be disabled.
              </li>
              <li>
                <strong>Functional / Preferences:</strong> Remember your settings (e.g. language, recently viewed products, dashboard layout).
              </li>
              <li>
                <strong>Analytics:</strong> Help us understand how sellers use the dashboard to improve our services.
              </li>
              <li>
                <strong>Marketing:</strong> Used for remarketing and measuring ad performance when applicable.
              </li>
              <li>
                <strong>Performance:</strong> Improve dashboard speed and user experience.
              </li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>3. How to Manage Your Preferences</SectionTitle>
          <SectionContent>
            <Paragraph>
              You can manage your cookie preferences at any time. Our cookie banner lets you Accept All, use Essential Only, or Customize your choices. You can also change your choices later via the Cookie Policy link in the footer.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>4. Updates</SectionTitle>
          <SectionContent>
            <Paragraph>
              We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated effective date.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>5. Contact Us</SectionTitle>
          <SectionContent>
            <Paragraph>
              If you have questions about our use of cookies, please contact us via the <Link to={PATHS.CONTACT}>Contact</Link> page or refer to our <Link to={PATHS.PRIVACY}>Privacy Policy</Link>.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <HelpSection variants={staggerItem}>
          <HelpTitle>
            <FaHeadset /> Need help?
          </HelpTitle>
          <HelpText>
            For questions about cookies or your privacy choices, visit our Help Center.
          </HelpText>
          <HelpButton as={Link} to={PATHS.HELP}>
            Help Center
          </HelpButton>
        </HelpSection>
      </PolicyContent>
    </PolicyContainer>
  );
};

export default CookiePolicyPage;
