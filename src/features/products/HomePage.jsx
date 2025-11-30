// import React from "react";
// import styled from "styled-components";
// import {
//   FaStore,
//   FaChartLine,
//   FaShoppingCart,
//   FaBox,
//   FaShippingFast,
//   FaHeadset,
//   FaMobileAlt,
// } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import { PATHS } from "../../routes/routePaths";

// const SellerHomepage = () => {
//   return (
//     <PageContainer>
//       <Header>
//         <Navbar>
//           <Logo>
//             <FaStore />
//             <span>SellerHub</span>
//           </Logo>
//           <NavLinks>
//             <NavLink to="features">Features</NavLink>
//             <NavLink to="pricing">Pricing</NavLink>
//             <NavLink to="support">Support</NavLink>
//             <LoginButton to={PATHS.LOGIN}>Seller Login</LoginButton>
//           </NavLinks>
//         </Navbar>
//       </Header>

//       <HeroSection>
//         <HeroContent>
//           <HeroTitle>
//             Manage Your <Highlight>Online Business</Highlight> With Ease
//           </HeroTitle>
//           <HeroText>
//             Join thousands of sellers who use our platform to manage inventory,
//             process orders, and grow their business.
//           </HeroText>
//           <HeroButtons>
//             <PrimaryButton to={PATHS.LOGIN}>Seller Login</PrimaryButton>
//             <SecondaryButton href="#features">Learn More</SecondaryButton>
//           </HeroButtons>
//         </HeroContent>
//         <HeroImage>
//           <DashboardPreview
//             src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
//             alt="Seller Dashboard Preview"
//           />
//         </HeroImage>
//       </HeroSection>

//       <FeaturesSection id="features">
//         <SectionTitle>
//           <h2>Powerful Tools for Sellers</h2>
//           <p>Everything you need to manage your online business efficiently</p>
//         </SectionTitle>
//         <FeaturesGrid>
//           <FeatureCard>
//             <FeatureIcon $color="#4a6cf7">
//               <FaBox />
//             </FeatureIcon>
//             <h3>Inventory Management</h3>
//             <p>
//               Track and manage your inventory in real-time across multiple sales
//               channels.
//             </p>
//           </FeatureCard>
//           <FeatureCard>
//             <FeatureIcon $color="#10b981">
//               <FaShoppingCart />
//             </FeatureIcon>
//             <h3>Order Processing</h3>
//             <p>
//               Process orders quickly, print shipping labels, and track shipments
//               all in one place.
//             </p>
//           </FeatureCard>
//           <FeatureCard>
//             <FeatureIcon $color="#3b82f6">
//               <FaChartLine />
//             </FeatureIcon>
//             <h3>Sales Analytics</h3>
//             <p>
//               Get insights into your sales performance and make data-driven
//               decisions.
//             </p>
//           </FeatureCard>
//           <FeatureCard>
//             <FeatureIcon $color="#f59e0b">
//               <FaShippingFast />
//             </FeatureIcon>
//             <h3>Shipping Solutions</h3>
//             <p>Integrated shipping with major carriers at discounted rates.</p>
//           </FeatureCard>
//           <FeatureCard>
//             <FeatureIcon $color="#ef4444">
//               <FaHeadset />
//             </FeatureIcon>
//             <h3>Customer Support</h3>
//             <p>
//               Manage customer inquiries and support tickets from a unified
//               dashboard.
//             </p>
//           </FeatureCard>
//           <FeatureCard>
//             <FeatureIcon $color="#8b5cf6">
//               <FaMobileAlt />
//             </FeatureIcon>
//             <h3>Mobile App</h3>
//             <p>
//               Manage your business on the go with our powerful mobile
//               application.
//             </p>
//           </FeatureCard>
//         </FeaturesGrid>
//       </FeaturesSection>

//       <CtaSection>
//         <CtaContent>
//           <CtaTitle>Ready to Grow Your Business?</CtaTitle>
//           <CtaText>
//             Join our platform today and start managing your online store with
//             powerful tools designed for sellers.
//           </CtaText>
//           <CtaButton href="/seller/login">Get Started Now</CtaButton>
//         </CtaContent>
//       </CtaSection>

//       <Footer>
//         <FooterContent>
//           <FooterColumn>
//             <FooterTitle>SellerHub</FooterTitle>
//             <FooterText>
//               Empowering sellers with powerful tools to grow their online
//               business.
//             </FooterText>
//             <SocialLinks>
//               <SocialLink href="#">
//                 <FaStore />
//               </SocialLink>
//               <SocialLink href="#">
//                 <FaChartLine />
//               </SocialLink>
//               <SocialLink href="#">
//                 <FaShoppingCart />
//               </SocialLink>
//               <SocialLink href="#">
//                 <FaBox />
//               </SocialLink>
//             </SocialLinks>
//           </FooterColumn>
//           <FooterColumn>
//             <FooterTitle>Resources</FooterTitle>
//             <FooterLink href="#">Help Center</FooterLink>
//             <FooterLink href="#">Seller Community</FooterLink>
//             <FooterLink href="#">API Documentation</FooterLink>
//             <FooterLink href="#">Tutorials</FooterLink>
//           </FooterColumn>
//           <FooterColumn>
//             <FooterTitle>Company</FooterTitle>
//             <FooterLink href="#">About Us</FooterLink>
//             <FooterLink href="#">Careers</FooterLink>
//             <FooterLink href="#">Contact Us</FooterLink>
//             <FooterLink href="#">Blog</FooterLink>
//           </FooterColumn>
//           <FooterColumn>
//             <FooterTitle>Legal</FooterTitle>
//             <FooterLink href="#">Privacy Policy</FooterLink>
//             <FooterLink href="#">Terms of Service</FooterLink>
//             <FooterLink href="#">Cookie Policy</FooterLink>
//             <FooterLink href="#">Security</FooterLink>
//           </FooterColumn>
//         </FooterContent>
//         <Copyright>&copy; 2023 SellerHub. All rights reserved.</Copyright>
//       </Footer>
//     </PageContainer>
//   );
// };

// // Styled Components
// const PageContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   min-height: 100vh;
//   background: linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%);
//   color: #212529;
//   line-height: 1.6;
//   font-family: var(--font-body);
// `;

// const Header = styled.header`
//   background: white;
//   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//   position: sticky;
//   top: 0;
//   z-index: 100;
// `;

// const Navbar = styled.nav`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 20px 40px;
//   max-width: 1200px;
//   margin: 0 auto;

//   @media (max-width: 768px) {
//     padding: 15px 20px;
//     flex-direction: column;
//     gap: 15px;
//   }
// `;

// const Logo = styled.div`
//   display: flex;
//   align-items: center;
//   font-size: 1.8rem;
//   font-weight: 700;
//   color: #4a6cf7;
//   text-decoration: none;

//   svg {
//     margin-right: 10px;
//   }
// `;

// const NavLinks = styled.div`
//   display: flex;
//   list-style: none;
//   align-items: center;
//   gap: 30px;

//   @media (max-width: 768px) {
//     width: 100%;
//     justify-content: center;
//     flex-wrap: wrap;
//     gap: 15px;
//   }
// `;

// const NavLink = styled(Link)`
//   text-decoration: none;
//   color: #6c757d;
//   font-weight: 500;
//   transition: color 0.3s;

//   &:hover {
//     color: #4a6cf7;
//   }
// `;

// const LoginButton = styled(Link)`
//   background: #4a6cf7;
//   color: white;
//   padding: 10px 20px;
//   border-radius: 50px;
//   text-decoration: none;
//   font-weight: 500;
//   transition: background 0.3s;

//   &:hover {
//     background: #3a5bd9;
//   }
// `;

// const HeroSection = styled.section`
//   display: flex;
//   align-items: center;
//   padding: 80px 40px;
//   min-height: 80vh;
//   max-width: 1200px;
//   margin: 0 auto;
//   gap: 40px;

//   @media (max-width: 992px) {
//     flex-direction: column;
//     text-align: center;
//   }

//   @media (max-width: 768px) {
//     padding: 60px 20px;
//   }
// `;

// const HeroContent = styled.div`
//   flex: 1;
//   padding-right: 40px;

//   @media (max-width: 992px) {
//     padding-right: 0;
//     margin-bottom: 40px;
//   }
// `;

// const HeroTitle = styled.h1`
//   font-size: 3.5rem;
//   margin-bottom: 20px;
//   color: #212529;
//   line-height: 1.2;

//   @media (max-width: 768px) {
//     font-size: 2.5rem;
//   }
// `;

// const Highlight = styled.span`
//   color: #4a6cf7;
// `;

// const HeroText = styled.p`
//   font-size: 1.2rem;
//   color: #6c757d;
//   margin-bottom: 30px;
//   max-width: 600px;

//   @media (max-width: 992px) {
//     margin: 0 auto 30px;
//   }
// `;

// const HeroButtons = styled.div`
//   display: flex;
//   gap: 15px;

//   @media (max-width: 768px) {
//     flex-direction: column;
//     align-items: center;
//   }
// `;

// const PrimaryButton = styled(Link)`
//   display: inline-block;
//   background: #4a6cf7;
//   color: white;
//   padding: 15px 30px;
//   border-radius: 50px;
//   text-decoration: none;
//   font-weight: 600;
//   font-size: 1.1rem;
//   transition: all 0.3s;
//   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

//   &:hover {
//     transform: translateY(-3px);
//     box-shadow: 0 10px 20px rgba(74, 108, 247, 0.3);
//     background: #3a5bd9;
//   }
// `;

// const SecondaryButton = styled(PrimaryButton)`
//   background: transparent;
//   border: 2px solid #4a6cf7;
//   color: #4a6cf7;

//   &:hover {
//     background: #4a6cf7;
//     color: white;
//   }
// `;

// const HeroImage = styled.div`
//   flex: 1;
//   display: flex;
//   justify-content: center;
// `;

// const DashboardPreview = styled.img`
//   max-width: 100%;
//   border-radius: 10px;
//   box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
// `;

// const FeaturesSection = styled.section`
//   padding: 100px 40px;
//   background: white;
//   max-width: 1200px;
//   margin: 0 auto;

//   @media (max-width: 768px) {
//     padding: 60px 20px;
//   }
// `;

// const SectionTitle = styled.div`
//   text-align: center;
//   margin-bottom: 60px;

//   h2 {
//     font-size: 2.5rem;
//     color: #212529;
//     margin-bottom: 15px;
//   }

//   p {
//     color: #6c757d;
//     max-width: 700px;
//     margin: 0 auto;
//   }
// `;

// const FeaturesGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//   gap: 40px;

//   @media (max-width: 768px) {
//     gap: 20px;
//   }
// `;

// const FeatureCard = styled.div`
//   background: #f8f9fa;
//   border-radius: 15px;
//   padding: 40px 30px;
//   text-align: center;
//   transition: transform 0.3s;
//   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

//   &:hover {
//     transform: translateY(-10px);
//   }

//   h3 {
//     font-size: 1.5rem;
//     margin: 20px 0 15px;
//     color: #212529;
//   }

//   p {
//     color: #6c757d;
//   }
// `;

// const FeatureIcon = styled.div`
//   width: 80px;
//   height: 80px;
//   background: ${(props) => `${props.$color}20`};
//   border-radius: 50%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   margin: 0 auto;
//   color: ${(props) => props.$color};
//   font-size: 2rem;
// `;

// const CtaSection = styled.section`
//   padding: 100px 40px;
//   background: linear-gradient(135deg, #4a6cf7 0%, #3a5bd9 100%);
//   color: white;
//   text-align: center;

//   @media (max-width: 768px) {
//     padding: 60px 20px;
//   }
// `;

// const CtaContent = styled.div`
//   max-width: 800px;
//   margin: 0 auto;
// `;

// const CtaTitle = styled.h2`
//   font-size: 2.5rem;
//   margin-bottom: 20px;
// `;

// const CtaText = styled.p`
//   max-width: 700px;
//   margin: 0 auto 40px;
//   font-size: 1.2rem;
//   opacity: 0.9;
// `;

// const CtaButton = styled(PrimaryButton)`
//   background: white;
//   color: #4a6cf7;

//   &:hover {
//     background: #f8f9fa;
//   }
// `;

// const Footer = styled.footer`
//   background: #212529;
//   color: white;
//   padding: 60px 40px 30px;

//   @media (max-width: 768px) {
//     padding: 40px 20px 20px;
//   }
// `;

// const FooterContent = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//   gap: 40px;
//   margin-bottom: 40px;
//   max-width: 1200px;
//   margin: 0 auto 40px;

//   @media (max-width: 768px) {
//     gap: 30px;
//   }
// `;

// const FooterColumn = styled.div`
//   h3 {
//     font-size: 1.3rem;
//     margin-bottom: 20px;
//     position: relative;

//     &::after {
//       content: "";
//       position: absolute;
//       bottom: -10px;
//       left: 0;
//       width: 50px;
//       height: 3px;
//       background: #4a6cf7;
//     }
//   }
// `;

// const FooterTitle = styled.h3`
//   font-size: 1.3rem;
//   margin-bottom: 20px;
// `;

// const FooterText = styled.p`
//   color: #adb5bd;
//   margin-bottom: 20px;
// `;

// const FooterLink = styled.a`
//   display: block;
//   color: #adb5bd;
//   text-decoration: none;
//   margin-bottom: 10px;
//   transition: color 0.3s;

//   &:hover {
//     color: white;
//   }
// `;

// const SocialLinks = styled.div`
//   display: flex;
//   gap: 15px;
//   margin-top: 20px;
// `;

// const SocialLink = styled.a`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   width: 40px;
//   height: 40px;
//   background: rgba(255, 255, 255, 0.1);
//   border-radius: 50%;
//   color: white;
//   transition: background 0.3s;

//   &:hover {
//     background: #4a6cf7;
//   }
// `;

// const Copyright = styled.div`
//   text-align: center;
//   padding-top: 30px;
//   border-top: 1px solid rgba(255, 255, 255, 0.1);
//   color: #adb5bd;
//   max-width: 1200px;
//   margin: 0 auto;
// `;

// export default SellerHomepage;
