// import { useState } from "react";

// import { PropagateLoader } from "react-spinners";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { PropagateLoader } from "react-spinners";

import { validateGhanaPhone } from "../utils/helpers";
import { useEffect } from "react";

// Auth Form Component
const AuthPage = () => {
  const [phoneNetwork, setPhoneNetwork] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "fekt20@gmail.com",
    password: "12345678",
    passwordConfirm: "12345678",
    shopName: "",
    network: phoneNetwork,
    contactNumber: "",
  });

  const [passwordError, setPasswordError] = useState("");
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Validate phone number in real-time
  useEffect(() => {
    if (formData.contactNumber) {
      const validation = validateGhanaPhone(formData.contactNumber);
      if (validation.valid) {
        setPhoneNetwork(validation.network.toLowerCase());
      } else {
        setPhoneNetwork("");
      }
    }
  }, [formData.contactNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear password error when typing
    if (name === "passwordConfirm" && passwordError) {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === "login") {
      await login.mutateAsync(formData);
      // localStorage.setItem("seller_token", response.data.token);
      console.log("Login successful");
      navigate("/dashboard");
    }

    if (activeTab === "register") {
      formData.network = phoneNetwork;

      const response = await register.mutateAsync(formData);
      localStorage.setItem("seller_token", response?.data.token);

      navigate("/dashboard");
    }
  };

  return (
    <Container>
      <LeftPanel>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          Seller Portal
        </h2>
        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "2rem",
            maxWidth: "500px",
          }}
        >
          Manage your products, track orders, and grow your business with our
          powerful seller tools.
        </p>

        <FeatureList>
          <li>Track orders and manage inventory in real-time</li>
          <li>Gain insights with detailed sales analytics</li>
          <li>Reach more customers with our marketplace</li>
          <li>Get paid quickly with secure payment processing</li>
        </FeatureList>
      </LeftPanel>

      <RightPanel>
        <AuthCard>
          <Logo>
            <h1>
              Seller<span>Portal</span>
            </h1>
          </Logo>

          <Tabs>
            <Tab
              active={activeTab === "login"}
              onClick={() => setActiveTab("login")}
            >
              Login
            </Tab>
            <Tab
              active={activeTab === "register"}
              onClick={() => setActiveTab("register")}
            >
              Register
            </Tab>
          </Tabs>

          <Title>
            {activeTab === "login"
              ? "Welcome Back"
              : "Create Your Seller Account"}
          </Title>

          {login.error && <ErrorMessage>{login.error}</ErrorMessage>}

          <Form onSubmit={handleSubmit}>
            {activeTab === "register" && (
              <>
                <InputGroup>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <Label>
                    Contact Number <span>*</span>
                  </Label>
                  <PhoneInputContainer>
                    <PhonePrefix>+233</PhonePrefix>
                    <PhoneInput
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />

                    {phoneNetwork && (
                      <NetworkIndicator className={phoneNetwork}>
                        <NetworkIcon>
                          {phoneNetwork === "mtn"
                            ? "📶"
                            : phoneNetwork === "telecel"
                            ? "📱"
                            : "📞"}
                        </NetworkIcon>
                        {phoneNetwork === "mtn"
                          ? "MTN"
                          : phoneNetwork === "telecel"
                          ? "Telecel"
                          : "AirtelTigo"}
                      </NetworkIndicator>
                    )}
                  </PhoneInputContainer>
                  {/* {errors.contactNumber && (
                    <ErrorText>{errors.contactNumber}</ErrorText>
                  )} */}
                  <HelpText>
                    Enter Ghanaian number (MTN, Telecel, or AirtelTigo)
                  </HelpText>
                </InputGroup>

                <InputGroup>
                  <Label>
                    Business/Shop Name <span>*</span>
                  </Label>
                  <Input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    placeholder="Enter your shop name"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                  {/* {errors.shopName && <ErrorText>{errors.shopName}</ErrorText>} */}
                </InputGroup>
              </>
            )}

            <InputGroup>
              <Label>Email Address</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </InputGroup>

            {activeTab === "register" && (
              <InputGroup>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  name="passwordConfirm"
                  placeholder="Confirm your password"
                  required
                />
              </InputGroup>
            )}

            <SubmitButton type="submit" disabled={login.isLoading}>
              {login.isLoading ? (
                <PropagateLoader color="#ffffff" size={10} />
              ) : activeTab === "login" ? (
                "Sign In to Your Account"
              ) : (
                "Create Account"
              )}
            </SubmitButton>
          </Form>

          {activeTab === "login" && (
            <FooterText>
              <a href="#forgot">Forgot your password?</a>
            </FooterText>
          )}

          <Divider>or</Divider>

          <FooterText>
            {activeTab === "login" ? (
              <>
                Dont have an account?{" "}
                <a href="#" onClick={() => setActiveTab("register")}>
                  Sign up now
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a href="#" onClick={() => setActiveTab("login")}>
                  Sign in
                </a>
              </>
            )}
          </FooterText>
        </AuthCard>
      </RightPanel>
    </Container>
  );
};

export default AuthPage;

// Styled Components
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
`;

const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: white;
  text-align: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const AuthCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }

  span {
    color: #4b6cb7;
  }
`;

const Title = styled.h2`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-weight: 600;
  font-size: 1.8rem;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f0f4f8;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) => (props.active ? "#4b6cb7" : "#a0aec0")};
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;

  &:after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${(props) => (props.active ? "#4b6cb7" : "transparent")};
    transition: background 0.3s ease;
  }

  &:hover {
    color: #4b6cb7;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: #4b6cb7;
    box-shadow: 0 0 0 3px rgba(75, 108, 183, 0.2);
    outline: none;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(to right, #4b6cb7, #3a56a2);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background: linear-gradient(to right, #3a56a2, #2c3e70);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(75, 108, 183, 0.3);
  }

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fff5f5;
  color: #e53e3e;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border-left: 4px solid #e53e3e;
  animation: ${fadeIn} 0.3s ease;
`;

// const ErrorText = styled.span`
//   color: #e53e3e;
//   font-size: 0.85rem;
//   margin-top: 0.25rem;
//   display: block;
// `;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  color: #a0aec0;
  margin: 1.5rem 0;

  &:before,
  &:after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #e2e8f0;
  }

  &:before {
    margin-right: 1rem;
  }

  &:after {
    margin-left: 1rem;
  }
`;

const FooterText = styled.p`
  text-align: center;
  color: #718096;
  font-size: 0.9rem;

  a {
    color: #4b6cb7;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  max-width: 400px;

  li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1.5rem;

    &:before {
      content: "✓";
      color: #48bb78;
      font-weight: bold;
      margin-right: 0.8rem;
      font-size: 1.2rem;
    }
  }
`;

const HelpText = styled.span`
  color: #718096;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
`;

const PhoneInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const NetworkIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f0f4f8;
  color: #2c3e50;
  border-radius: 6px;
  padding: 0.2rem 0.7rem;
  font-size: 0.95rem;
  font-weight: 600;
  margin-left: 0.5rem;

  &.mtn {
    background: #fffbe6;
    color: #ffbe00;
  }
  &.telecel {
    background: #ffe6f0;
    color: #e6007a;
  }
  &.airteltigo {
    background: #e6f0ff;
    color: #0057b8;
  }
`;

const NetworkIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 0.3rem;
`;

const PhonePrefix = styled.span`
  background: #f0f4f8;
  color: #4b6cb7;
  border-radius: 6px;
  padding: 0.5rem 0.9rem;
  font-size: 1rem;
  font-weight: 600;
  margin-right: 0.5rem;
`;

const PhoneInput = styled.input`
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: #4b6cb7;
    box-shadow: 0 0 0 3px rgba(75, 108, 183, 0.2);
    outline: none;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;
