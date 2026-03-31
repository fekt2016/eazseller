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
    title: 'Shipping Information - Saiisai Seller',
    description: 'Learn about Saiisai shipping policies, delivery coverage, and seller responsibilities in Ghana',
    defaultTitle: 'Shipping Information • Saiisai Seller',
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
            <InfoTitle>Saiisai Logistics Handles All Deliveries</InfoTitle>
            <InfoText>
              Saiisai Logistics manages all deliveries nationwide in Ghana. As a seller,
              you do <strong>NOT</strong> need to configure shipping fees, zones, or delivery methods.
            </InfoText>
            <InfoText>
              Your responsibility is limited to:
            </InfoText>
            <ResponsibilityList>
              <ResponsibilityItem>Packaging items securely</ResponsibilityItem>
              <ResponsibilityItem>Handing packages to Saiisai dispatch riders</ResponsibilityItem>
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
            and courier availability. Saiisai will notify you of any significant delays.
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
                <strong>Courier Cooperation:</strong> Cooperate with Saiisai courier for scheduled pickup
              </ResponsibilityItem>
              <ResponsibilityItem>
                <strong>Accurate Information:</strong> Provide correct weight and dimensions when required for shipping calculations
              </ResponsibilityItem>
            </ResponsibilityList>
            <LegalNote>
              Failure to meet these responsibilities may result in order cancellation,
              refund processing, or account restrictions per Saiisai seller policies.
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
                    Saiisai dispatch rider will collect the package from your location
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
                  Saiisai determines shipping fees based on delivery region, package weight,
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
                  Saiisai absorbs failed delivery costs based on internal policies.
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
                The customer pays for shipping. Saiisai manages all shipping fees and logistics.
                Your seller revenue is not affected by shipping costs.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion>Can I use my own courier service?</FAQQuestion>
              <FAQAnswer>
                No. Saiisai requires all sellers to use Saiisai Logistics for consistency,
                tracking, and customer experience. Using external couriers may result in
                order cancellation or account restrictions.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion>What happens if a package is damaged during delivery?</FAQQuestion>
              <FAQAnswer>
                Saiisai investigates all damage claims. If damage is due to inadequate packaging,
                the seller may be liable. If damage occurs during transit due to courier handling,
                Saiisai handles the resolution. Always package items securely to avoid liability.
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
                Contact Saiisai support immediately. We will reschedule the pickup and ensure
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
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    color: #E8920A;
  }
`;

const SectionContent = styled.div`
  padding: 1rem;
`;

const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  
`;

const InfoText = styled.p`
  font-size: 0.9rem;
  color: #374151;
  
  line-height: 1.6;
  margin: 0;
  
  strong {
    font-weight: 700;
    color: #111827;
  }
`;

const ResponsibilityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResponsibilityItem = styled.li`
  font-size: 0.9rem;
  color: #374151;
  
  line-height: 1.6;
  padding-left: 1rem;
  position: relative;
  
  &::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #3B6D11;
    font-weight: 700;
  }
  
  strong {
    font-weight: 600;
    color: #111827;
  }
`;

const DeliveryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DeliveryRegion = styled.div`
  padding: 1rem;
  background: #F9F8F5;
  border-radius: 9px;
  border: 1px solid #F1EFE8;
`;

const RegionName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  
  margin-bottom: 1rem;
`;

const RegionTimeline = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #E8920A;
  
  margin-bottom: 1rem;
`;

const RegionDescription = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  
  margin: 0;
`;

const TimelineNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #FAEEDA;
  border: 1px solid #FDE68A;
  border-radius: 9px;
  color: #854F0B;
  font-size: 0.875rem;
  
  
  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ResponsibilityCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResponsibilityTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  
`;

const LegalNote = styled.div`
  padding: 1rem;
  background: #A32D2D;
  border: 1px solid #A32D2D;
  border-radius: 9px;
  color: #A32D2D;
  font-size: 0.875rem;
  
  margin-top: 1rem;
`;

const PickupCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PickupTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  
`;

const PickupSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PickupStep = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E8920A;
  color: #FFFFFF;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.9rem;
  
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  
  margin-bottom: 1rem;
`;

const StepDescription = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  
  line-height: 1.5;
  margin: 0;
`;

const PackagingGuidelines = styled.div`
  padding: 1rem;
  background: #185FA5;
  border: 1px solid #185FA5;
  border-radius: 9px;
  margin-top: 1rem;
`;

const GuidelinesTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  
  margin-bottom: 1rem;
`;

const GuidelinesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GuidelineItem = styled.li`
  font-size: 0.875rem;
  color: #374151;
  
  line-height: 1.5;
`;

const FeeCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FeeTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  
`;

const FeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FeeItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #F9F8F5;
  border-radius: 9px;
`;

const FeeLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FeeValue = styled.div`
  font-size: 0.9rem;
  color: #1F2937;
  
  line-height: 1.6;
  
  strong {
    font-weight: 600;
    color: #111827;
  }
`;

const SupportCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #E8920A;
  border: 1px solid #E8920A;
  border-radius: 12px;
`;

const SupportTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  
`;

const SupportText = styled.p`
  font-size: 0.9rem;
  color: #374151;
  
  margin: 0;
`;

const SupportList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SupportItem = styled.li`
  font-size: 0.875rem;
  color: #374151;
  
  padding-left: 1rem;
  position: relative;
  
  &::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #E8920A;
    font-weight: 700;
  }
`;

const SupportAction = styled.div`
  margin-top: 1rem;
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FAQItem = styled.div`
  padding: 1rem;
  background: #FFFFFF;
  border: 1px solid #F1EFE8;
  border-radius: 9px;
`;

const FAQQuestion = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  
  margin-bottom: 1rem;
`;

const FAQAnswer = styled.p`
  font-size: 0.875rem;
  color: #374151;
  
  line-height: 1.6;
  margin: 0;
`;

