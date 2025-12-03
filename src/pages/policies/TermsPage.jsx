import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeadset } from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
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
  WarningBox,
  HelpSection,
  HelpTitle,
  HelpText,
  HelpButton,
  SectionDivider,
} from './policy.styles';

/**
 * Terms and Conditions Page (Seller App)
 * Professional legal policy page styled for sellers
 */
const TermsPage = () => {
  // Get today's date for "Last Updated"
  const today = new Date();
  const lastUpdatedDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // SEO
  useDynamicPageTitle({
    title: 'Terms & Service • EazSeller',
    description: 'Review the terms and conditions for selling on EazShop. Understand your rights and responsibilities as a seller.',
    keywords: 'seller terms, conditions, terms of service, EazSeller terms, seller agreement, service agreement',
    defaultTitle: 'Terms & Service • EazSeller',
    defaultDescription: 'Review the terms and conditions for selling on EazShop.',
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
          <PolicyTitle>Terms & Service</PolicyTitle>
          <LastUpdated>Last Updated: {lastUpdatedDate}</LastUpdated>
          <IntroText>
            Please read these Terms and Conditions carefully before using EazSeller. By accessing or using our seller platform, you agree to be bound by these terms. If you do not agree with any part of these terms, you may not access the service.
          </IntroText>
        </PolicyHeader>

        {/* Section 1: Acceptance of Terms */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>1. Acceptance of Terms</SectionTitle>
          <SectionContent>
            <Paragraph>
              By registering as a seller on EazShop and accessing the EazSeller platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </Paragraph>
            <Paragraph>
              These Terms apply to all sellers, vendors, and others who access or use the EazSeller Service.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 2: Seller Account Requirements */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>2. Seller Account Requirements</SectionTitle>
          <SectionContent>
            <Paragraph>
              To become a seller on EazShop, you must:
            </Paragraph>
            <BulletList>
              <li>Provide accurate, complete, and current information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Be at least 18 years of age or have legal capacity to enter into contracts</li>
              <li>Have the legal right to sell the products you list</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Maintain the security of your account credentials</li>
            </BulletList>
            <Paragraph>
              You are responsible for all activities that occur under your seller account.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 3: Product Listings */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>3. Product Listings</SectionTitle>
          <SectionContent>
            <Paragraph>
              <strong>Product Information:</strong> You are responsible for providing accurate, complete, and truthful information about your products, including descriptions, images, prices, and availability.
            </Paragraph>
            <Paragraph>
              <strong>Prohibited Products:</strong> You may not list products that are:
            </Paragraph>
            <BulletList>
              <li>Illegal, counterfeit, or stolen</li>
              <li>Hazardous, dangerous, or restricted</li>
              <li>Infringing on intellectual property rights</li>
              <li>Misleading, deceptive, or fraudulent</li>
              <li>Prohibited by local or international law</li>
            </BulletList>
            <Paragraph>
              <strong>Product Images:</strong> All product images must be accurate representations of the actual product. Stock photos or misleading images are prohibited.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 4: Pricing and Fees */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>4. Pricing and Fees</SectionTitle>
          <SectionContent>
            <LetteredList>
              <li>
                <Paragraph>
                  <strong>Product Pricing</strong>
                </Paragraph>
                <Paragraph>
                  You set the prices for your products. Prices must include all applicable taxes. You may not charge buyers additional fees beyond the listed price.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Platform Fees</strong>
                </Paragraph>
                <Paragraph>
                  EazShop charges a commission fee on each sale. The fee structure is outlined in your seller agreement. Fees are deducted from your payout.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Payment Processing</strong>
                </Paragraph>
                <Paragraph>
                  Payment processing fees may apply. These fees are separate from platform commission and are disclosed in your seller dashboard.
                </Paragraph>
              </li>
            </LetteredList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 5: Order Fulfillment */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>5. Order Fulfillment</SectionTitle>
          <SectionContent>
            <Paragraph>
              <strong>Order Processing:</strong> You must process and ship orders within the timeframe specified in your seller settings or as agreed with the buyer.
            </Paragraph>
            <Paragraph>
              <strong>Shipping:</strong> You are responsible for:
            </Paragraph>
            <BulletList>
              <li>Accurate shipping costs and delivery times</li>
              <li>Proper packaging to prevent damage during transit</li>
              <li>Providing valid tracking information</li>
              <li>Ensuring products match the order details</li>
            </BulletList>
            <Paragraph>
              <strong>Order Cancellations:</strong> You may cancel orders only under specific circumstances (e.g., out of stock, buyer request). Excessive cancellations may result in account restrictions.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 6: Returns and Refunds */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>6. Returns and Refunds</SectionTitle>
          <SectionContent>
            <Paragraph>
              You must comply with EazShop's Return & Refund Policy. Buyers may return products that are:
            </Paragraph>
            <BulletList>
              <li>Defective or damaged</li>
              <li>Not as described</li>
              <li>Wrong items received</li>
            </BulletList>
            <Paragraph>
              You are responsible for processing refunds according to the policy. Refunds will be deducted from your seller balance or future payouts.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 7: Payouts */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>7. Payouts</SectionTitle>
          <SectionContent>
            <Paragraph>
              <strong>Payout Schedule:</strong> Payouts are processed according to the schedule outlined in your seller dashboard. Processing times may vary based on your payment method.
            </Paragraph>
            <Paragraph>
              <strong>Withholding:</strong> We may withhold payouts if:
            </Paragraph>
            <BulletList>
              <li>There are pending disputes or returns</li>
              <li>Your account is under review</li>
              <li>You have violated our policies</li>
              <li>Required for legal or regulatory compliance</li>
            </BulletList>
            <Paragraph>
              <strong>Tax Obligations:</strong> You are responsible for reporting and paying all applicable taxes on your earnings from EazShop.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 8: Prohibited Conduct */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>8. Prohibited Conduct</SectionTitle>
          <SectionContent>
            <Paragraph>
              You may not:
            </Paragraph>
            <BulletList>
              <li>Manipulate search results or rankings</li>
              <li>Engage in fraudulent transactions or chargebacks</li>
              <li>Contact buyers outside of the EazShop platform for transactions</li>
              <li>Circumvent platform fees or payment processing</li>
              <li>Use multiple accounts to avoid restrictions</li>
              <li>Post false reviews or ratings</li>
              <li>Violate intellectual property rights</li>
              <li>Engage in price fixing or anti-competitive behavior</li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 9: Intellectual Property */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>9. Intellectual Property</SectionTitle>
          <SectionContent>
            <Paragraph>
              You retain ownership of your product listings, images, and content. By listing products on EazShop, you grant us a license to use, display, and distribute your content for the purpose of operating the platform.
            </Paragraph>
            <Paragraph>
              You may not use EazShop's trademarks, logos, or branding without our prior written consent.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 10: Account Termination */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>10. Account Termination</SectionTitle>
          <SectionContent>
            <Paragraph>
              We may suspend or terminate your seller account at any time, with or without notice, for violations of these Terms, fraudulent activity, or any other reason we deem necessary.
            </Paragraph>
            <Paragraph>
              Upon termination:
            </Paragraph>
            <BulletList>
              <li>Your listings will be removed</li>
              <li>Pending orders must be fulfilled or cancelled according to policy</li>
              <li>Outstanding payouts will be processed according to our policies</li>
              <li>You may not create a new account without our permission</li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 11: Limitation of Liability */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>11. Limitation of Liability</SectionTitle>
          <SectionContent>
            <Paragraph>
              EazShop provides a platform for sellers to connect with buyers. We are not responsible for:
            </Paragraph>
            <BulletList>
              <li>The quality, safety, or legality of products sold</li>
              <li>Disputes between buyers and sellers</li>
              <li>Shipping delays or damages</li>
              <li>Payment processing issues beyond our control</li>
            </BulletList>
            <ImportantNotice>
              <Paragraph>
                <strong>Important:</strong> You are solely responsible for your products, listings, and transactions. EazShop acts as an intermediary platform only.
              </Paragraph>
            </ImportantNotice>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 12: Changes to Terms */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>12. Changes to Terms</SectionTitle>
          <SectionContent>
            <Paragraph>
              We reserve the right to modify these Terms at any time. Material changes will be communicated to you via email or through your seller dashboard at least 30 days in advance.
            </Paragraph>
            <Paragraph>
              Continued use of the EazSeller platform after changes become effective constitutes acceptance of the revised terms.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 13: Contact Information */}
        <HelpSection variants={staggerItem}>
          <HelpTitle>13. Contact Information</HelpTitle>
          <HelpText>
            If you have any questions about these Terms & Service, please contact our Seller Support team.
          </HelpText>
          <HelpButton
            as={Link}
            to={PATHS.SUPPORT}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaHeadset />
            Contact Seller Support
          </HelpButton>
        </HelpSection>
      </PolicyContent>
    </PolicyContainer>
  );
};

export default TermsPage;

