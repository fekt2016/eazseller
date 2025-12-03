import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  NumberedList,
  LetteredList,
  BulletList,
  Paragraph,
  ImportantNotice,
  HelpSection,
  HelpTitle,
  HelpText,
  HelpButton,
  SectionDivider,
} from './policy.styles';

/**
 * Seller Privacy Policy Page for EazSeller
 * Comprehensive privacy policy explaining how we collect, use, and protect seller information
 */
const SellerPrivacyPolicyPage = () => {
  // Get today's date for "Effective Date"
  const today = new Date();
  const effectiveDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // SEO
  usePageTitle({
    title: 'Seller Privacy Policy • EazSeller',
    description: 'Learn how EazSeller collects, uses and protects seller and store information.',
    keywords: 'seller privacy policy, data protection, EazSeller privacy, seller data, store information',
  });

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
        {/* Header */}
        <PolicyHeader variants={staggerItem}>
          <PolicyTitle>Seller Privacy Policy</PolicyTitle>
          <LastUpdated>Effective Date: {effectiveDate}</LastUpdated>
          <IntroText>
            At EazSeller, operated by EazWorld, we are committed to protecting the privacy and security of seller information. This Seller Privacy Policy explains how we collect, use, share, and safeguard information related to your seller account, store, products, and business operations on the EazShop marketplace. By using the EazSeller portal, you agree to the practices described in this policy.
          </IntroText>
        </PolicyHeader>

        {/* Section 1: Introduction */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>1. Introduction</SectionTitle>
          <SectionContent>
            <Paragraph>
              EazSeller is the seller dashboard and portal for the EazShop marketplace, operated by EazWorld. This Privacy Policy applies to all information collected through the EazSeller platform, including our seller dashboard, mobile applications, seller support services, and any other seller-related services that link to this policy.
            </Paragraph>
            <Paragraph>
              This policy is specifically designed for sellers using our platform. It explains how we handle seller account information, store data, product listings, financial information, and other business-related data. If you are a buyer using EazShop, please refer to the buyer Privacy Policy.
            </Paragraph>
            <Paragraph>
              We understand the importance of protecting your business information and are dedicated to maintaining the confidentiality and security of your seller data. Please read this policy carefully to understand our practices.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 2: What Seller Information We Collect */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>2. What Seller Information We Collect</SectionTitle>
          <SectionContent>
            <Paragraph>
              We collect various types of information to enable you to sell on EazShop, process orders, manage payouts, provide seller support, and ensure compliance with our platform policies. The information we collect includes:
            </Paragraph>

            <SectionTitle style={{ fontSize: 'var(--font-size-xl)', marginTop: 'var(--spacing-xl)' }}>
              2.1 Seller Account and Identity Verification Information
            </SectionTitle>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Account Registration:</strong> When you create a seller account, we collect your name, email address, phone number, password, business name, and any other information required for account setup.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Identity Verification:</strong> To comply with Know Your Customer (KYC) and Anti-Money Laundering (AML) requirements, we may collect government-issued identification documents, proof of address, business registration certificates, tax identification numbers, and other verification documents.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Business Information:</strong> We collect information about your business, including legal business name, business type, registration number, business address, and any licenses or permits required for your products or services.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Contact Information:</strong> We collect contact details for your business, including primary contact person, email addresses, phone numbers, and mailing addresses for business correspondence and support.
                </Paragraph>
              </li>
            </BulletList>

            <SectionTitle style={{ fontSize: 'var(--font-size-xl)', marginTop: 'var(--spacing-xl)' }}>
              2.2 Store Profile and Product Data
            </SectionTitle>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Store Profile:</strong> We collect information about your store, including store name, description, logo, banner images, store policies, shipping information, return policies, and any other content you provide to customize your storefront.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Product Listings:</strong> We collect all information related to your product listings, including product names, descriptions, images, videos, prices, inventory levels, categories, attributes, specifications, and any other product-related data you provide.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Product Performance Data:</strong> We automatically collect data about how your products perform on the platform, including views, clicks, conversion rates, sales data, customer reviews, ratings, and search rankings.
                </Paragraph>
              </li>
            </BulletList>

            <SectionTitle style={{ fontSize: 'var(--font-size-xl)', marginTop: 'var(--spacing-xl)' }}>
              2.3 Financial and Payment Information
            </SectionTitle>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Bank Account Information:</strong> To process payouts, we collect your bank account details, including account holder name, account number, bank name, branch information, and routing numbers. This information is encrypted and stored securely.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Payment Method Information:</strong> We collect information about your preferred payment methods for receiving payouts, including mobile money accounts, payment processor accounts, and other financial service provider details.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Transaction and Earnings Data:</strong> We collect detailed information about your sales, earnings, fees, commissions, refunds, chargebacks, and all financial transactions related to your seller account.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Tax Information:</strong> We may collect tax identification numbers, tax certificates, and other tax-related information required for compliance with tax laws and regulations in your jurisdiction.
                </Paragraph>
              </li>
            </BulletList>

            <SectionTitle style={{ fontSize: 'var(--font-size-xl)', marginTop: 'var(--spacing-xl)' }}>
              2.4 Support, Disputes, and Appeals
            </SectionTitle>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Support Communications:</strong> When you contact seller support, we collect your messages, inquiries, support tickets, attachments, and any other information you provide. We may also record phone calls for quality assurance and training purposes.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Dispute and Appeal Information:</strong> We collect information related to disputes with buyers, order issues, refund requests, account suspensions, policy violations, appeals, and any other matters requiring resolution.
                </Paragraph>
              </li>
            </BulletList>

            <SectionTitle style={{ fontSize: 'var(--font-size-xl)', marginTop: 'var(--spacing-xl)' }}>
              2.5 Automatic Collection and Logs
            </SectionTitle>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Device and Usage Information:</strong> We automatically collect information about the devices you use to access EazSeller, including device type, operating system, browser information, IP address, and usage patterns such as pages visited, features used, and time spent on the platform.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Activity Logs:</strong> We maintain logs of your activities on the platform, including login times, actions taken, changes made to listings, order processing activities, and other platform interactions for security, compliance, and support purposes.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Location Information:</strong> We may collect approximate location information based on your IP address or device settings to provide location-based services, comply with regional regulations, and prevent fraud.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar technologies to collect information about your use of the EazSeller platform. This helps us remember your preferences, analyze platform usage, and improve our services.
                </Paragraph>
              </li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 3: How and Why We Use Seller Information */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>3. How and Why We Use Seller Information</SectionTitle>
          <SectionContent>
            <Paragraph>
              We use the information we collect from sellers for various purposes essential to operating the marketplace and providing seller services:
            </Paragraph>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Account Creation and Management:</strong> We use your information to create and maintain your seller account, authenticate your identity, manage your profile, and provide you with access to seller tools and services.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Identity Verification and KYC/AML Compliance:</strong> We use your identification and business documents to verify your identity, perform Know Your Customer (KYC) checks, comply with Anti-Money Laundering (AML) regulations, and ensure that only legitimate businesses can sell on our platform.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Order Processing and Fulfillment:</strong> We use your information to process orders placed by buyers, facilitate communication between you and buyers, manage order status, handle shipping arrangements, and coordinate delivery.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Payment and Payout Processing:</strong> We use your financial information to calculate earnings, process payouts, handle refunds and chargebacks, manage payment disputes, and ensure accurate financial reporting for your business.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Seller Support and Training:</strong> We use your information to provide customer support, respond to your inquiries, offer seller training and educational resources, and help you optimize your store and product listings.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Platform Rules and Policy Enforcement:</strong> We use your information to monitor compliance with our Terms of Service, Seller Policies, and platform rules. This includes detecting policy violations, preventing fraud, addressing disputes, and taking appropriate enforcement actions when necessary.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Service Improvement and Analytics:</strong> We analyze seller data, product performance, and platform usage to improve our seller tools, develop new features, optimize the marketplace, and provide you with insights and recommendations to grow your business.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Communication:</strong> We use your contact information to send you important account notifications, order updates, payment confirmations, policy changes, platform announcements, and marketing communications (if you have opted in).
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Legal Compliance:</strong> We use your information to comply with applicable laws, regulations, and legal processes, respond to government requests, fulfill tax reporting obligations, and cooperate with law enforcement when required.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Security and Fraud Prevention:</strong> We use your information to detect, prevent, and investigate fraudulent activities, unauthorized access, security threats, and other illegal activities that could harm you, buyers, or our platform.
                </Paragraph>
              </li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 4: How and Why We Share Seller Information */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>4. How and Why We Share Seller Information</SectionTitle>
          <SectionContent>
            <Paragraph>
              We do not sell your personal information. We share seller information only in the circumstances described below and always in accordance with this Privacy Policy:
            </Paragraph>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>EazWorld Affiliates:</strong> We may share your information with other EazWorld entities and affiliates to provide integrated services, process orders, manage payouts, provide support, and operate our business. These affiliates are bound by the same privacy standards.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Service Providers:</strong> We share information with trusted third-party service providers who perform services on our behalf, including hosting, data storage, IT support, customer service, analytics, payment processing, logistics, and marketing. These providers are contractually obligated to protect your information.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Payment Processors and Financial Institutions:</strong> We share financial information with payment processors, banks, and financial institutions to process payouts, handle transactions, prevent fraud, and comply with financial regulations.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Logistics and Shipping Partners:</strong> We share order and shipping information with logistics partners to facilitate delivery, track shipments, and handle returns. This includes buyer contact information and shipping addresses necessary for order fulfillment.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Buyers:</strong> When buyers purchase your products, they see limited information about your store, including your store name, store description, product information, ratings, reviews, and shipping policies. Buyers never see your personal contact information, financial details, or other sensitive business data.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Professional Advisors and Authorities:</strong> We may share information with legal advisors, auditors, consultants, and government authorities when necessary for legal compliance, fraud prevention, law enforcement, tax reporting, or to protect our rights and the safety of our users.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Business Transfers:</strong> In the event of a merger, acquisition, reorganization, sale of assets, or bankruptcy, your information may be transferred to the acquiring entity or successor. We will notify you of any such transfer and any changes to this Privacy Policy.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Third Parties You Authorize:</strong> We share information with third parties when you explicitly authorize us to do so, such as when you connect third-party tools, integrate external services, or participate in partner programs.
                </Paragraph>
              </li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 5: Seller Rights and Choices */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>5. Seller Rights and Choices</SectionTitle>
          <SectionContent>
            <Paragraph>
              As a seller, you have several rights and choices regarding your information:
            </Paragraph>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Access and Edit Business Profile:</strong> You can access and update your seller profile, store information, business details, and account settings through your EazSeller dashboard. You can also update product listings, pricing, inventory, and other store-related information at any time.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Financial Information Management:</strong> You can update your bank account information, payment methods, and payout preferences through your seller dashboard. Changes to financial information may require verification for security purposes.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Marketing Preferences:</strong> You can opt out of marketing communications at any time by adjusting your notification preferences in your account settings or by contacting seller support. Note that we may still send you important transactional and account-related messages.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Data Access Requests:</strong> You can request access to the personal information we hold about you by contacting seller support. We will provide you with a copy of your data in a structured, commonly used format.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Account Closure:</strong> You can request to close your seller account at any time by contacting seller support. However, we may retain certain information for legal, accounting, tax, fraud prevention, or dispute resolution purposes, as required by law or our legitimate business interests.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Cookie Settings:</strong> You can manage cookies and similar technologies through your browser settings. However, disabling certain cookies may affect the functionality of the EazSeller platform.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Required Information:</strong> Some information is required to operate as a seller on EazShop, such as business registration, identity verification, and payment information. If you choose not to provide required information, you may not be able to use certain seller features or receive payouts.
                </Paragraph>
              </li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 6: Data Security and Retention for Sellers */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>6. Data Security and Retention for Sellers</SectionTitle>
          <SectionContent>
            <Paragraph>
              We implement comprehensive security measures to protect your seller information from unauthorized access, disclosure, alteration, and destruction. These measures include:
            </Paragraph>
            <BulletList>
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Secure payment processing through PCI-DSS compliant payment partners</li>
              <li>Multi-factor authentication for seller accounts</li>
              <li>Regular security assessments and vulnerability testing</li>
              <li>Access controls and role-based permissions</li>
              <li>Employee training on data protection and privacy</li>
              <li>Incident response procedures and monitoring</li>
            </BulletList>
            <Paragraph>
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You should also take steps to protect your seller account, such as using a strong password, enabling two-factor authentication, and not sharing your login credentials.
            </Paragraph>
            <Paragraph>
              <strong>Data Retention:</strong> We retain your seller information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Our retention periods are based on:
            </Paragraph>
            <BulletList>
              <li>The nature of the information and the purpose for which it was collected</li>
              <li>Legal and regulatory requirements (e.g., tax and accounting laws may require us to retain financial records for several years)</li>
              <li>The need to resolve disputes, enforce agreements, and prevent fraud</li>
              <li>Your account status and business relationship with us</li>
            </BulletList>
            <Paragraph>
              When information is no longer needed, we securely delete or anonymize it. Some information may be retained in backup systems for a limited period before permanent deletion. Even after account closure, we may retain certain information as required by law or for legitimate business purposes.
            </Paragraph>
            <Paragraph>
              Your information may be stored and processed in cloud infrastructure and may be transferred to or accessed from countries other than your country of residence. We ensure that appropriate legal safeguards are in place to protect your information.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 7: International Transfers */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>7. International Transfers</SectionTitle>
          <SectionContent>
            <Paragraph>
              EazWorld operates globally, and your seller information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your jurisdiction.
            </Paragraph>
            <Paragraph>
              When we transfer your information internationally, we take steps to ensure that appropriate safeguards are in place to protect your data. These safeguards may include standard contractual clauses, certification schemes, adequacy decisions, and other legal mechanisms designed to ensure adequate protection of your information.
            </Paragraph>
            <Paragraph>
              By using EazSeller, you consent to the transfer of your information to countries outside your country of residence, including countries that may not have the same level of data protection as your home country. We will continue to protect your information in accordance with this Privacy Policy regardless of where it is processed.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 8: Changes to this Seller Privacy Policy */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>8. Changes to this Seller Privacy Policy</SectionTitle>
          <SectionContent>
            <Paragraph>
              We may update this Seller Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other reasons. When we make changes, we will update the "Effective Date" at the top of this policy.
            </Paragraph>
            <Paragraph>
              For material changes that significantly affect your rights or how we use your information, we will provide additional notice through:
            </Paragraph>
            <BulletList>
              <li>Email notifications to your registered seller email address</li>
              <li>Prominent notices on the EazSeller dashboard</li>
              <li>Other methods as required by applicable law</li>
            </BulletList>
            <Paragraph>
              We encourage you to review this Seller Privacy Policy periodically to stay informed about how we protect your information. Your continued use of EazSeller after changes become effective constitutes your acceptance of the updated Privacy Policy.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 9: Contact Us */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>9. Contact Us</SectionTitle>
          <SectionContent>
            <Paragraph>
              If you have questions, concerns, or requests regarding this Seller Privacy Policy or our data practices, please contact us:
            </Paragraph>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Email:</strong> privacy@eazworld.com or seller-privacy@eazworld.com
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Postal Address:</strong><br />
                  EazWorld Data Protection Officer<br />
                  [Address to be updated]<br />
                  Ghana
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Seller Support:</strong> You can also reach out through our <Link to={PATHS.SUPPORT} style={{ color: 'var(--color-primary-500)', textDecoration: 'underline' }}>Seller Support Center</Link> for general inquiries.
                </Paragraph>
              </li>
            </BulletList>
            <Paragraph>
              We will respond to your inquiries and requests in a timely manner and in accordance with applicable data protection laws.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        {/* Help Section */}
        <HelpSection variants={staggerItem}>
          <HelpTitle>Need More Help?</HelpTitle>
          <HelpText>
            If you have questions about your privacy or data protection as a seller, our support team is here to assist you.
          </HelpText>
          <HelpButton
            as={Link}
            to={PATHS.SUPPORT}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHeadset />
            Contact Seller Support
          </HelpButton>
        </HelpSection>
      </PolicyContent>
    </PolicyContainer>
  );
};

export default SellerPrivacyPolicyPage;

