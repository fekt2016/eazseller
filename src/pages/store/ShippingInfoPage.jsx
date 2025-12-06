import { Link } from "react-router-dom";
import styled from "styled-components";
import { FaTruck, FaMapMarkerAlt, FaBox, FaFileAlt, FaDollarSign, FaQuestionCircle, FaExclamationTriangle } from "react-icons/fa";
import {
  PageContainer,
  PageHeader,
  TitleSection,
  Section,
  SectionHeader,
} from '../../shared/components/ui/SpacingSystem';
import Button from '../../shared/components/ui/Button';
import ShippingStatusFlow from '../../components/store/shipping/ShippingStatusFlow';
import { PATHS } from '../../routes/routePaths';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';

export default function ShippingInfoPage() {
  useDynamicPageTitle({
    title: 'Shipping Information - EazSeller',
    description: 'Learn about EazShop shipping policies, delivery coverage, and seller responsibilities in Ghana',
    defaultTitle: 'Shipping Information • EazSeller',
  });

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Shipping Information</h1>
          <p>Everything you need to know about shipping and delivery</p>
        </TitleSection>
      </PageHeader>

      {/* SECTION A: Who Handles Shipping */}
      <Section $padding="lg" $marginBottom="lg">
        <SectionHeader $padding="md">
          <SectionTitle>
            <FaTruck /> Shipping Policy (Ghana)
          </SectionTitle>
        </SectionHeader>
        <SectionContent>
          <InfoCard>
            <InfoTitle>EazShop Logistics Handles All Deliveries</InfoTitle>
            <InfoText>
              EazShop Logistics manages all deliveries nationwide in Ghana. As a seller, 
              you do <strong>NOT</strong> need to configure shipping fees, zones, or delivery methods.
            </InfoText>
            <InfoText>
              Your responsibility is limited to:
            </InfoText>
            <ResponsibilityList>
              <ResponsibilityItem>Packaging items securely</ResponsibilityItem>
              <ResponsibilityItem>Handing packages to EazShop dispatch riders</ResponsibilityItem>
              <ResponsibilityItem>Ensuring products match listing descriptions</ResponsibilityItem>
            </ResponsibilityList>
          </InfoCard>
        </SectionContent>
      </Section>

      {/* SECTION B: Ghana-Specific Delivery Coverage */}
      <Section $padding="lg" $marginBottom="lg">
        <SectionHeader $padding="md">
          <SectionTitle>
            <FaMapMarkerAlt /> Delivery Coverage & Timelines
          </SectionTitle>
        </SectionHeader>
        <SectionContent>
          <DeliveryGrid>
            <DeliveryRegion>
              <RegionName>Greater Accra</RegionName>
              <RegionTimeline>1–2 days</RegionTimeline>
              <RegionDescription>
                Accra, Tema, and surrounding areas
              </RegionDescription>
            </DeliveryRegion>
            
            <DeliveryRegion>
              <RegionName>Ashanti Region</RegionName>
              <RegionTimeline>2–3 days</RegionTimeline>
              <RegionDescription>
                Kumasi and surrounding areas
              </RegionDescription>
            </DeliveryRegion>
            
            <DeliveryRegion>
              <RegionName>Central, Eastern, Western</RegionName>
              <RegionTimeline>2–4 days</RegionTimeline>
              <RegionDescription>
                Cape Coast, Koforidua, Takoradi, and surrounding areas
              </RegionDescription>
            </DeliveryRegion>
            
            <DeliveryRegion>
              <RegionName>Northern, Upper East, Upper West</RegionName>
              <RegionTimeline>3–5 days</RegionTimeline>
              <RegionDescription>
                Tamale, Bolgatanga, Wa, and surrounding areas
              </RegionDescription>
            </DeliveryRegion>
            
            <DeliveryRegion>
              <RegionName>Rural Zones</RegionName>
              <RegionTimeline>5–7 days</RegionTimeline>
              <RegionDescription>
                Remote and hard-to-reach areas
              </RegionDescription>
            </DeliveryRegion>
          </DeliveryGrid>
          
          <TimelineNote>
            <FaExclamationTriangle /> Delivery timelines may vary due to weather, traffic, 
            and courier availability. EazShop will notify you of any significant delays.
          </TimelineNote>
        </SectionContent>
      </Section>

      {/* SECTION C: Seller Responsibilities */}
      <Section $padding="lg" $marginBottom="lg">
        <SectionHeader $padding="md">
          <SectionTitle>
            <FaFileAlt /> Seller Responsibilities (Per Ghana Consumer Protection Act)
          </SectionTitle>
        </SectionHeader>
        <SectionContent>
          <ResponsibilityCard>
            <ResponsibilityTitle>Your Legal Obligations</ResponsibilityTitle>
            <ResponsibilityList>
              <ResponsibilityItem>
                <strong>Secure Packaging:</strong> Package items securely to prevent damage during transit
              </ResponsibilityItem>
              <ResponsibilityItem>
                <strong>Accurate Listings:</strong> Ship only products that match the listing description exactly
              </ResponsibilityItem>
              <ResponsibilityItem>
                <strong>Timely Preparation:</strong> Make products ready for pickup within 24 hours of order confirmation
              </ResponsibilityItem>
              <ResponsibilityItem>
                <strong>Courier Cooperation:</strong> Cooperate with EazShop courier for scheduled pickup
              </ResponsibilityItem>
              <ResponsibilityItem>
                <strong>Accurate Information:</strong> Provide correct weight and dimensions when required for shipping calculations
              </ResponsibilityItem>
            </ResponsibilityList>
            <LegalNote>
              Failure to meet these responsibilities may result in order cancellation, 
              refund processing, or account restrictions per EazShop seller policies.
            </LegalNote>
          </ResponsibilityCard>
        </SectionContent>
      </Section>

      {/* SECTION D: Pickup Instructions */}
      <Section $padding="lg" $marginBottom="lg">
        <SectionHeader $padding="md">
          <SectionTitle>
            <FaBox /> Pickup Instructions (Courier Handling)
          </SectionTitle>
        </SectionHeader>
        <SectionContent>
          <PickupCard>
            <PickupTitle>How Pickup Works</PickupTitle>
            <PickupSteps>
              <PickupStep>
                <StepNumber>1</StepNumber>
                <StepContent>
                  <StepTitle>Receive Notification</StepTitle>
                  <StepDescription>
                    You will receive a pickup notification when an order is ready for dispatch
                  </StepDescription>
                </StepContent>
              </PickupStep>
              
              <PickupStep>
                <StepNumber>2</StepNumber>
                <StepContent>
                  <StepTitle>Prepare Package</StepTitle>
                  <StepDescription>
                    Package the item securely and ensure it matches the order details
                  </StepDescription>
                </StepContent>
              </PickupStep>
              
              <PickupStep>
                <StepNumber>3</StepNumber>
                <StepContent>
                  <StepTitle>Label Package</StepTitle>
                  <StepDescription>
                    Attach a label with: Order ID, Customer Name, Customer Phone, Destination Region
                  </StepDescription>
                </StepContent>
              </PickupStep>
              
              <PickupStep>
                <StepNumber>4</StepNumber>
                <StepContent>
                  <StepTitle>Hand to Courier</StepTitle>
                  <StepDescription>
                    EazShop dispatch rider will collect the package from your location
                  </StepDescription>
                </StepContent>
              </PickupStep>
            </PickupSteps>

            <PackagingGuidelines>
              <GuidelinesTitle>Packaging Guidelines (Temu/Jumia Style)</GuidelinesTitle>
              <GuidelinesList>
                <GuidelineItem>✓ No exposed liquids — seal all liquid containers securely</GuidelineItem>
                <GuidelineItem>✓ Seal fragile items properly — use bubble wrap and padding</GuidelineItem>
                <GuidelineItem>✓ Use appropriate box size — avoid oversized packaging</GuidelineItem>
                <GuidelineItem>✓ Label clearly — ensure all labels are readable and attached securely</GuidelineItem>
                <GuidelineItem>✓ Protect electronics — use anti-static bags when necessary</GuidelineItem>
              </GuidelinesList>
            </PackagingGuidelines>
          </PickupCard>
        </SectionContent>
      </Section>

      {/* SECTION E: Shipping Status Definitions */}
      <Section $padding="lg" $marginBottom="lg">
        <ShippingStatusFlow />
      </Section>

      {/* SECTION F: Shipping Fees */}
      <Section $padding="lg" $marginBottom="lg">
        <SectionHeader $padding="md">
          <SectionTitle>
            <FaDollarSign /> Shipping Fees (Company Controlled)
          </SectionTitle>
        </SectionHeader>
        <SectionContent>
          <FeeCard>
            <FeeTitle>How Shipping Fees Work</FeeTitle>
            <FeeInfo>
              <FeeItem>
                <FeeLabel>Fee Determination:</FeeLabel>
                <FeeValue>
                  EazShop determines shipping fees based on delivery region, package weight, 
                  and shipping type (standard, same-day, or express)
                </FeeValue>
              </FeeItem>
              <FeeItem>
                <FeeLabel>Customer Payment:</FeeLabel>
                <FeeValue>
                  Shipping fees are automatically included in customer checkout and paid by the customer
                </FeeValue>
              </FeeItem>
              <FeeItem>
                <FeeLabel>Seller Revenue:</FeeLabel>
                <FeeValue>
                  Your seller revenue is <strong>NOT</strong> affected by shipping costs. 
                  You receive the full product price (minus platform fees)
                </FeeValue>
              </FeeItem>
              <FeeItem>
                <FeeLabel>Failed Deliveries:</FeeLabel>
                <FeeValue>
                  EazShop absorbs failed delivery costs based on internal policies. 
                  You are not charged for delivery attempts
                </FeeValue>
              </FeeItem>
            </FeeInfo>
          </FeeCard>
        </SectionContent>
      </Section>

      {/* SECTION G: Issues & Support */}
      <Section $padding="lg" $marginBottom="lg">
        <SectionHeader $padding="md">
          <SectionTitle>
            <FaQuestionCircle /> Issues & Support
          </SectionTitle>
        </SectionHeader>
        <SectionContent>
          <SupportCard>
            <SupportTitle>Need Help with Shipping?</SupportTitle>
            <SupportText>
              If you encounter any shipping-related issues, such as:
            </SupportText>
            <SupportList>
              <SupportItem>Delayed pickup notifications</SupportItem>
              <SupportItem>Package damage during transit</SupportItem>
              <SupportItem>Missing or incorrect delivery information</SupportItem>
              <SupportItem>Questions about shipping policies</SupportItem>
            </SupportList>
            <SupportAction>
              <Button
                as={Link}
                to={PATHS.SUPPORT}
                variant="primary"
                size="lg"
                gradient
              >
                Report Shipping Issue
              </Button>
            </SupportAction>
          </SupportCard>
        </SectionContent>
      </Section>

      {/* SECTION H: FAQ */}
      <Section $padding="lg" $marginBottom="lg">
        <SectionHeader $padding="md">
          <SectionTitle>
            <FaQuestionCircle /> Frequently Asked Questions
          </SectionTitle>
        </SectionHeader>
        <SectionContent>
          <FAQList>
            <FAQItem>
              <FAQQuestion>Who pays for shipping?</FAQQuestion>
              <FAQAnswer>
                The customer pays for shipping. EazShop manages all shipping fees and logistics. 
                Your seller revenue is not affected by shipping costs.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>Can I use my own courier service?</FAQQuestion>
              <FAQAnswer>
                No. EazShop requires all sellers to use EazShop Logistics for consistency, 
                tracking, and customer experience. Using external couriers may result in 
                order cancellation or account restrictions.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>What happens if a package is damaged during delivery?</FAQQuestion>
              <FAQAnswer>
                EazShop investigates all damage claims. If damage is due to inadequate packaging, 
                the seller may be liable. If damage occurs during transit due to courier handling, 
                EazShop handles the resolution. Always package items securely to avoid liability.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>How do I know when to prepare a package?</FAQQuestion>
              <FAQAnswer>
                You will receive a notification when an order is confirmed and ready for pickup. 
                Prepare the package within 24 hours and mark it as ready in your seller dashboard.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>What if the courier doesn't show up for pickup?</FAQQuestion>
              <FAQAnswer>
                Contact EazShop support immediately. We will reschedule the pickup and ensure 
                your order is not delayed. You can track pickup status in your orders dashboard.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>Can I track my orders after pickup?</FAQQuestion>
              <FAQAnswer>
                Yes. Once the package is picked up, you can track it through your seller dashboard 
                using the order tracking number. Customers can also track their orders.
              </FAQAnswer>
            </FAQItem>
          </FAQList>
        </SectionContent>
      </Section>
    </PageContainer>
  );
}

// Styled Components
const SectionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  svg {
    color: var(--color-primary-500);
  }
`;

const SectionContent = styled.div`
  padding: var(--spacing-lg);
`;

const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const InfoTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
`;

const InfoText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  font-family: var(--font-body);
  line-height: 1.6;
  margin: 0;
  
  strong {
    font-weight: var(--font-bold);
    color: var(--color-grey-900);
  }
`;

const ResponsibilityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: var(--spacing-md) 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const ResponsibilityItem = styled.li`
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  font-family: var(--font-body);
  line-height: 1.6;
  padding-left: var(--spacing-lg);
  position: relative;
  
  &::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--color-green-600);
    font-weight: var(--font-bold);
  }
  
  strong {
    font-weight: var(--font-semibold);
    color: var(--color-grey-900);
  }
`;

const DeliveryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

const DeliveryRegion = styled.div`
  padding: var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
`;

const RegionName = styled.h4`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  margin-bottom: var(--spacing-xs);
`;

const RegionTimeline = styled.div`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
  font-family: var(--font-heading);
  margin-bottom: var(--spacing-xs);
`;

const RegionDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-family: var(--font-body);
  margin: 0;
`;

const TimelineNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-yellow-50);
  border: 1px solid var(--color-yellow-200);
  border-radius: var(--border-radius-md);
  color: var(--color-yellow-800);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  
  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ResponsibilityCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const ResponsibilityTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
`;

const LegalNote = styled.div`
  padding: var(--spacing-md);
  background: var(--color-red-50);
  border: 1px solid var(--color-red-200);
  border-radius: var(--border-radius-md);
  color: var(--color-red-800);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  margin-top: var(--spacing-md);
`;

const PickupCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const PickupTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
`;

const PickupSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const PickupStep = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border-radius: var(--border-radius-cir);
  font-weight: var(--font-bold);
  font-size: var(--font-size-md);
  font-family: var(--font-heading);
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  margin-bottom: var(--spacing-xs);
`;

const StepDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-family: var(--font-body);
  line-height: 1.5;
  margin: 0;
`;

const PackagingGuidelines = styled.div`
  padding: var(--spacing-md);
  background: var(--color-blue-50);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-md);
`;

const GuidelinesTitle = styled.h4`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  margin-bottom: var(--spacing-sm);
`;

const GuidelinesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const GuidelineItem = styled.li`
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  font-family: var(--font-body);
  line-height: 1.5;
`;

const FeeCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FeeTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
`;

const FeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FeeItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
`;

const FeeLabel = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FeeValue = styled.div`
  font-size: var(--font-size-md);
  color: var(--color-grey-800);
  font-family: var(--font-body);
  line-height: 1.6;
  
  strong {
    font-weight: var(--font-semibold);
    color: var(--color-grey-900);
  }
`;

const SupportCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--border-radius-lg);
`;

const SupportTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
`;

const SupportText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  font-family: var(--font-body);
  margin: 0;
`;

const SupportList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const SupportItem = styled.li`
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  font-family: var(--font-body);
  padding-left: var(--spacing-lg);
  position: relative;
  
  &::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--color-primary-500);
    font-weight: var(--font-bold);
  }
`;

const SupportAction = styled.div`
  margin-top: var(--spacing-sm);
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const FAQItem = styled.div`
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
`;

const FAQQuestion = styled.h4`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  margin-bottom: var(--spacing-sm);
`;

const FAQAnswer = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  font-family: var(--font-body);
  line-height: 1.6;
  margin: 0;
`;

