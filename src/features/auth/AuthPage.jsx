import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { PropagateLoader } from "react-spinners";
import useAuth from '../../shared/hooks/useAuth';
import { validateGhanaPhone } from '../../shared/utils/helpers';
import { PATHS } from '../../routes/routePaths';
import { ButtonSpinner } from '../../shared/components/ButtonSpinner';
import { ErrorState } from '../../shared/components/ui/LoadingComponents';

// Auth Form Component
const AuthPage = () => {
  const [phoneNetwork, setPhoneNetwork] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  
  // Login state
  const [loginState, setLoginState] = useState({
    loginId: "",
    password: "",
  });
  const [loginMethod, setLoginMethod] = useState("email");
  const [loginStep, setLoginStep] = useState("credentials");
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  
  // Register state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    shopName: "",
    network: phoneNetwork,
    contactNumber: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const { sendOtp, verifyOtp, register } = useAuth();
  const { mutate: sendOtpMutation, isPending: isSendingOtp, error: sendOtpError } = sendOtp;
  const { mutate: verifyOtpMutation, isPending: isVerifyingOtp, error: verifyOtpError } = verifyOtp;
  const { mutate: registerMutation, isPending: isRegistering, error: registerError } = register;
  
  const navigate = useNavigate();

  // OTP countdown timer
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (loginStep === "credentials") {
      sendOtpMutation(loginState.loginId, {
        onSuccess: () => {
          setLoginStep("otp");
          setOtpCountdown(120); // 2 minutes countdown
        },
        onError: (err) => {
          console.error("[AuthPage] OTP send failed:", err.message);
        },
      });
    } else {
      verifyOtpMutation(
        {
          loginId: loginState.loginId,
          otp,
          password: loginState.password,
          redirectTo: PATHS.DASHBOARD,
        },
        {
          onSuccess: (data) => {
            console.log("[AuthPage] OTP verified successfully");
            console.log("[AuthPage] Cookie set by backend - authentication successful");
            
            // Navigate to dashboard
            const finalRedirect = data?.redirectTo || PATHS.DASHBOARD;
            navigate(finalRedirect);
            
            // Reset form
            setLoginState({ loginId: "", password: "" });
            setOtp("");
            setLoginStep("credentials");
          },
          onError: (err) => {
            console.error("[AuthPage] OTP verification failed:", err.message);
          },
        }
      );
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      formData.network = phoneNetwork;
      await registerMutation(formData);
      console.log("[AuthPage] Registration successful - cookie set by backend");
      navigate(PATHS.DASHBOARD);
    } catch (error) {
      console.error("[AuthPage] Registration error:", error);
    }
  };

  const handleResendOtp = () => {
    sendOtpMutation(loginState.loginId, {
      onSuccess: () => {
        setOtpCountdown(120);
      },
      onError: (err) => {
        console.error("[AuthPage] Resend OTP failed:", err.message);
      },
    });
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === "email" ? "phone" : "email");
    setLoginState({ ...loginState, loginId: "" });
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
              $active={activeTab === "login"}
              onClick={() => {
                setActiveTab("login");
                setLoginStep("credentials");
                setOtp("");
              }}
            >
              Login
            </Tab>
            <Tab
              $active={activeTab === "register"}
              onClick={() => setActiveTab("register")}
            >
              Register
            </Tab>
          </Tabs>

          <Title>
            {activeTab === "login"
              ? loginStep === "otp"
                ? "Verify Identity"
                : "Welcome Back"
              : "Create Your Seller Account"}
          </Title>

          <Subtitle>
            {activeTab === "login" && loginStep === "otp"
              ? `Enter verification code sent to your ${loginMethod}`
              : activeTab === "login"
              ? "Enter your credentials to access your account"
              : "Fill in your details to get started"}
          </Subtitle>

          {/* Error Messages */}
          {(sendOtpError || verifyOtpError) && activeTab === "login" && (
            <ErrorState
              title="Authentication Failed"
              message={(sendOtpError || verifyOtpError)?.response?.data?.message || (sendOtpError || verifyOtpError)?.message || "Authentication failed. Please try again."}
            />
          )}
          {registerError && activeTab === "register" && (
            <ErrorState
              title="Registration Failed"
              message={registerError?.response?.data?.message || registerError?.message || "Registration failed. Please try again."}
            />
          )}

          {activeTab === "login" ? (
            <Form onSubmit={handleLoginSubmit}>
              {loginStep === "credentials" ? (
                <>
                  <InputGroup>
                    <Label>
                      {loginMethod === "email" ? "Email Address" : "Phone Number"}
                    </Label>
                    <Input
                      type={loginMethod === "email" ? "email" : "tel"}
                      name="loginId"
                      value={loginState.loginId}
                      onChange={(e) =>
                        setLoginState({ ...loginState, loginId: e.target.value })
                      }
                      placeholder={
                        loginMethod === "email"
                          ? "your.email@example.com"
                          : "+233XXXXXXXXX"
                      }
                      required
                    />
                    <MethodToggle type="button" onClick={toggleLoginMethod}>
                      Use {loginMethod === "email" ? "phone number" : "email"} instead
                    </MethodToggle>
                  </InputGroup>

                  <InputGroup>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      name="password"
                      value={loginState.password}
                      onChange={(e) =>
                        setLoginState({ ...loginState, password: e.target.value })
                      }
                      placeholder="Enter your password"
                      required
                    />
                  </InputGroup>
                </>
              ) : (
                <OtpContainer>
                  <OtpInputs>
                    {[...Array(6)].map((_, index) => (
                      <OtpInput
                        key={index}
                        type="text"
                        maxLength={1}
                        value={otp[index] || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          const newOtp = otp.split("");
                          newOtp[index] = value;
                          setOtp(newOtp.join(""));

                          // Auto-focus next input
                          if (value && index < 5) {
                            const nextInput = document.getElementById(`otp-${index + 1}`);
                            if (nextInput) nextInput.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[index] && index > 0) {
                            const prevInput = document.getElementById(`otp-${index - 1}`);
                            if (prevInput) prevInput.focus();
                          }
                        }}
                        id={`otp-${index}`}
                      />
                    ))}
                  </OtpInputs>

                  <ResendContainer>
                    {otpCountdown > 0 ? (
                      <ResendText>
                        Resend code in {Math.floor(otpCountdown / 60)}:
                        {(otpCountdown % 60).toString().padStart(2, "0")}
                      </ResendText>
                    ) : (
                      <ResendButton
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSendingOtp}
                      >
                        {isSendingOtp ? <ButtonSpinner size="14px" /> : "Resend Code"}
                      </ResendButton>
                    )}
                  </ResendContainer>
                </OtpContainer>
              )}

              <SubmitButton
                type="submit"
                disabled={
                  loginStep === "credentials"
                    ? isSendingOtp || !loginState.loginId || !loginState.password
                    : isVerifyingOtp || otp.length < 6
                }
              >
                {isSendingOtp || isVerifyingOtp ? (
                  <PropagateLoader color="#ffffff" size={10} />
                ) : loginStep === "otp" ? (
                  "Verify"
                ) : (
                  "Send OTP"
                )}
              </SubmitButton>

              {loginStep === "otp" && (
                <BackButton type="button" onClick={() => {
                  setLoginStep("credentials");
                  setOtp("");
                }}>
                  ← Change Credentials
                </BackButton>
              )}
            </Form>
          ) : (
            <Form onSubmit={handleRegisterSubmit}>
              <InputGroup>
                <Label>
                  Full Name <span>*</span>
                </Label>
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
              </InputGroup>

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

              <InputGroup>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
                {passwordError && <ErrorText>{passwordError}</ErrorText>}
              </InputGroup>

              <SubmitButton type="submit" disabled={isRegistering}>
                {isRegistering ? (
                  <PropagateLoader color="#ffffff" size={10} />
                ) : (
                  "Create Account"
                )}
              </SubmitButton>
            </Form>
          )}

          <Divider>or</Divider>

          <FooterText>
            {activeTab === "login" ? (
              <>
                Don't have an account?{" "}
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("register");
                }}>
                  Sign up now
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("login");
                  setLoginStep("credentials");
                }}>
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
  font-family: var(--font-body);
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
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 1.8rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 2rem;
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
  color: ${(props) => (props.$active ? "#4b6cb7" : "#a0aec0")};
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
    background: ${(props) => (props.$active ? "#4b6cb7" : "transparent")};
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
  position: relative;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;

  span {
    color: #e53e3e;
  }
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

const MethodToggle = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  background: none;
  border: none;
  color: #4b6cb7;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 5px;
  text-decoration: underline;
  transition: color 0.2s;

  &:hover {
    color: #2e59d9;
  }
`;

const OtpContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const OtpInputs = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
`;

const OtpInput = styled.input`
  width: 3.5rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #4b6cb7;
    box-shadow: 0 0 0 3px rgba(75, 108, 183, 0.2);
  }
`;

const ResendContainer = styled.div`
  margin-top: 0.5rem;
  text-align: center;
`;

const ResendText = styled.span`
  font-size: 0.875rem;
  color: #718096;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #4b6cb7;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  transition: color 0.2s;

  &:hover:not(:disabled) {
    color: #2e59d9;
  }

  &:disabled {
    color: #a0aec0;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #4b6cb7;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem auto 0;
  transition: color 0.2s;

  &:hover {
    color: #2e59d9;
    text-decoration: underline;
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

  &:hover:not(:disabled) {
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

const ErrorText = styled.span`
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
`;

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
  flex: 1;

  &:focus {
    border-color: #4b6cb7;
    box-shadow: 0 0 0 3px rgba(75, 108, 183, 0.2);
    outline: none;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;
