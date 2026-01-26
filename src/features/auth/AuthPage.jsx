import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { PropagateLoader } from "react-spinners";
import useAuth from '../../shared/hooks/useAuth';
import { validateGhanaPhone } from '../../shared/utils/helpers';
import { PATHS } from '../../routes/routePaths';
import { ButtonSpinner } from '../../shared/components/ButtonSpinner';
import { ErrorState } from '../../shared/components/ui/LoadingComponents';
import Logo from '../../shared/components/Logo';

// Accra neighborhoods list
const ACCRA_NEIGHBORHOODS = [
  'Nima', 'Maamobi', 'Pig Farm', 'Kanda', 'Kawukudi', 'Alajo', 'Kotobabi',
  'New Town', 'Kokomlemle', 'Roman Ridge', 'Dzorwulu', 'Airport Residential',
  'Ridge', 'Asylum Down', 'Adabraka', 'Tudu', 'Osu', 'Labone', 'Cantonments',
  'Accra Central', 'Arena', 'Okaishie', 'Agbogbloshie', 'Fadama', 'Dansoman',
  'Mamprobi', 'Chorkor', 'Korle Gonno', 'Kaneshie', 'North Kaneshie',
  'Abbosey Okai', 'Odorkor', 'Laterbiokoshie', 'La', 'Labadi', 'Trade Fair',
  'Tse Addo', 'Burma Camp', 'Achimota', 'Circle', 'Taifa', 'Spintex',
  'Airport Hills', 'East Legon', 'Adjiringanor', 'Trasacco Area', 'Westlands',
  'Dome', 'Lapaz', 'Sowutuom', 'Ablekuma North', 'Abeka', 'Caprice',
  'East Legon Hills', 'Ashaley Botwe', 'Lakeside Estate', 'Haatso', 'Kwabenya',
  'Pokuase', 'Amasaman', 'Amrahia', 'Adenta', 'West Trassacco', 'Oyarifa',
  'Oyibi', 'Dodowa Road', 'Spintex East', 'Teshie-Nungua Estates', 'Kokrobite',
  'Weija', 'Kasoa', 'Kasoa Central', 'McCarthy Hill', 'Amansaman Outskirts',
  'Shai Hills', 'Dodowa Township'
].sort();

// Auth Form Component
const AuthPage = () => {
  const [phoneNetwork, setPhoneNetwork] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  
  // Login state
  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
  });
  const [loginStep, setLoginStep] = useState("credentials"); // 'credentials', '2fa'
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loginSessionId, setLoginSessionId] = useState(null);
  
  // Register state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    shopName: "",
    location: "Nima", // Auto-select Nima as default
    network: phoneNetwork,
    contactNumber: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const { login, verify2FALogin, register, verifyAccount, resendOtp } = useAuth();
  const { mutate: loginMutation, isPending: isLoggingIn, error: loginError } = login;
  const { mutate: verify2FALoginMutation, isPending: isVerifying2FA, error: verify2FAError } = verify2FALogin;
  const { mutateAsync: registerMutation, isPending: isRegistering, error: registerError } = register;
  
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any form submission bubbling
    
    // SECURITY: Ensure form doesn't submit normally
    if (e.defaultPrevented === false) {
      e.preventDefault();
    }

    if (loginStep === "credentials") {
      // Email+password login flow
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = loginState.email.trim().toLowerCase();
      
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        // Show error - you might want to add toast or error state
        console.error("[AuthPage] Invalid email address");
        return false; // Explicitly return false to prevent form submission
      }
      
      if (!loginState.password) {
        console.error("[AuthPage] Password is required");
        return false; // Explicitly return false to prevent form submission
      }

      // SECURITY: Ensure we're sending a proper object, not a string
      const loginData = { 
        email: trimmedEmail, 
        password: loginState.password 
      };
      
      if (import.meta.env.DEV) {
        console.log('[AuthPage] Sending login request with data:', {
          email: loginData.email,
          hasPassword: !!loginData.password,
          dataType: typeof loginData,
          isObject: typeof loginData === 'object' && !Array.isArray(loginData),
        });
      }

      loginMutation(
        loginData,
        {
          onSuccess: async (result) => {
            // Result from mutationFn is { success: true, seller: sellerData } or { requires2FA: true, ... }
            if (result?.requires2FA) {
              if (import.meta.env.DEV) {
                console.log("[AuthPage] 2FA required");
              }
              setLoginSessionId(result.loginSessionId);
              setLoginStep("2fa");
            } else if (result?.success) {
              // Login successful
              const seller = result.seller;
              
              if (!seller || (!seller.id && !seller._id)) {
                console.error("❌ [AuthPage] Login successful but no seller data received:", result);
                return;
              }
              
              if (import.meta.env.DEV) {
                console.log('👤 [AuthPage] Seller logged in:', {
                  id: seller.id || seller._id,
                  email: seller.email,
                  name: seller.name || seller.shopName,
                  role: seller.role,
                });
              }
              
              // Wait a moment for auth state to update, then navigate
              // This ensures ProtectedRoute has the seller data
              setTimeout(() => {
                navigate(PATHS.DASHBOARD);
              }, 100);
              
              // Reset form
              setLoginState({ email: "", password: "" });
            }
          },
          onError: (err) => {
            const errorMessage = err.response?.data?.message || err.message;
            const statusCode = err.response?.status;
            const isTimeout = err?.code === 'ECONNABORTED' || err?.isTimeout || err?.message?.includes('timeout');
            
            console.error("[AuthPage] Login failed:", {
              message: errorMessage,
              response: err.response?.data,
              status: statusCode,
              isTimeout,
              code: err.code,
            });
            
            // Handle timeout errors
            if (isTimeout) {
              console.error("❌ [Seller Login] Login error: ", {
                message: err.message || 'Request timed out',
                status: statusCode,
                error: err.error,
                code: err.code,
              });
              // Error will be displayed via loginError from the mutation
              return;
            }
            
            // Handle unverified account (403)
            if (statusCode === 403) {
              const messageLower = errorMessage.toLowerCase();
              if (messageLower.includes('not verified') || 
                  messageLower.includes('verify') || 
                  messageLower.includes('verification') ||
                  messageLower.includes('unverified')) {
                // Redirect to verification page with email as query parameter
                if (import.meta.env.DEV) {
                  console.log("[AuthPage] Account not verified - redirecting to verification page");
                }
                navigate(`${PATHS.VERIFY_ACCOUNT}?email=${encodeURIComponent(loginState.email)}`);
                return;
              }
            }
            
            // Error will be displayed via loginError from the mutation
          },
        }
      );
    } else if (loginStep === "2fa") {
      // Verify 2FA code
      if (!twoFactorCode || twoFactorCode.length !== 6) {
        console.error("[AuthPage] Please enter a valid 6-digit 2FA code");
        return;
      }

      if (!loginSessionId) {
        console.error("[AuthPage] Login session expired. Please login again.");
        setLoginStep("credentials");
        return;
      }

      verify2FALoginMutation(
        { loginSessionId, twoFactorCode },
        {
          onSuccess: (result) => {
            // Result from mutationFn is { success: true, seller: sellerData }
            if (result?.success) {
              const seller = result.seller;
              
              if (!seller || (!seller.id && !seller._id)) {
                console.error("❌ [AuthPage] 2FA verified but no seller data received:", result);
                return;
              }
              
              console.log('👤 [AuthPage] Seller logged in via 2FA:', {
                id: seller.id || seller._id,
                email: seller.email,
                name: seller.name || seller.shopName,
                role: seller.role,
              });
              
              navigate(PATHS.DASHBOARD);
              setLoginState({ email: "", password: "" });
              setTwoFactorCode("");
              setLoginSessionId(null);
            }
          },
          onError: (err) => {
            console.error("[AuthPage] 2FA verification failed:", {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status,
            });
          },
        }
      );
    }
  };

  const handleRegisterSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (formData.password !== formData.passwordConfirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      // Build shopLocation object - using location as town/neighborhood
      const shopLocation = {
        town: formData.location,
        city: 'Accra',
        region: 'Greater Accra',
        country: 'Ghana',
      };

      const registrationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.contactNumber,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        shopName: formData.shopName,
        shopLocation: shopLocation,
        network: phoneNetwork,
      };

      const response = await registerMutation(registrationData);
      
      // Check if email verification is required
      const apiResponse = response?.data || response;
      const requiresVerification = apiResponse?.requiresVerification || apiResponse?.data?.requiresVerification;
      
      if (requiresVerification) {
        console.log("[AuthPage] Registration successful - email verification required");
        alert('Registration successful! Please check your email for the verification code we sent to your email.');
        // Redirect seller to dedicated verification page with email pre-filled
        navigate(`${PATHS.VERIFY_ACCOUNT}?email=${encodeURIComponent(formData.email)}`);
      } else {
        console.log("[AuthPage] Registration successful - cookie set by backend");
        navigate(PATHS.DASHBOARD);
      }
    } catch (error) {
      console.error("[AuthPage] Registration error:", error);
    }
  };


  return (
    <Container>
        <AuthCard>
          <LogoContainer>
            <LogoLink to={PATHS.LANDING}>
              <Logo />
            </LogoLink>
          </LogoContainer>

          <Tabs>
            <Tab
              $active={activeTab === "login"}
              onClick={() => {
                setActiveTab("login");
                setLoginStep("credentials");
                setTwoFactorCode("");
                setLoginSessionId(null);
                setLoginState({ email: "", password: "" });
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
              ? loginStep === "2fa"
                ? "Two-Factor Authentication"
                : "Welcome Back"
              : "Create Your Seller Account"}
          </Title>

          <Subtitle>
            {activeTab === "login" && loginStep === "2fa"
              ? "Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, etc.)"
              : activeTab === "login"
              ? "Enter your email and password to access your account"
              : "Fill in your details to get started"}
          </Subtitle>

          {(loginError || verify2FAError || registerError) && (
            <ErrorBanner>
              {(() => {
                // Handle timeout errors with user-friendly message
                if (loginError?.code === 'ECONNABORTED' || loginError?.isTimeout || loginError?.message?.includes('timeout')) {
                  return 'The server is taking too long to respond. Please check your internet connection and try again.';
                }
                if (verify2FAError?.code === 'ECONNABORTED' || verify2FAError?.isTimeout) {
                  return 'Request timed out. Please try again.';
                }
                return loginError?.response?.data?.message || 
                       verify2FAError?.response?.data?.message || 
                       registerError?.response?.data?.message || 
                       loginError?.message ||
                       verify2FAError?.message ||
                       registerError?.message ||
                       "An error occurred. Please try again.";
              })()}
            </ErrorBanner>
          )}

          {/* Error Messages */}
          {(loginError || verify2FAError) && activeTab === "login" && (
            <ErrorState
              title="Authentication Failed"
              message={(() => {
                // Handle timeout errors with user-friendly message
                if (loginError?.code === 'ECONNABORTED' || loginError?.isTimeout || loginError?.message?.includes('timeout')) {
                  return 'The server is taking too long to respond. Please check your internet connection and try again.';
                }
                if (verify2FAError?.code === 'ECONNABORTED' || verify2FAError?.isTimeout) {
                  return 'Request timed out. Please try again.';
                }
                return (loginError || verify2FAError)?.response?.data?.message || 
                       (loginError || verify2FAError)?.message || 
                       "Authentication failed. Please try again.";
              })()}
            />
          )}
          {registerError && activeTab === "register" && (
            <ErrorState
              title="Registration Failed"
              message={registerError?.response?.data?.message || registerError?.message || "Registration failed. Please try again."}
            />
          )}

          {activeTab === "login" ? (
            <Form onSubmit={handleLoginSubmit} noValidate>
              {loginStep === "credentials" ? (
                <>
                  <InputGroup>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      name="email"
                      value={loginState.email}
                      onChange={(e) =>
                        setLoginState({ ...loginState, email: e.target.value })
                      }
                      placeholder="your.email@example.com"
                      required
                      autoComplete="email"
                    />
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
                      autoComplete="current-password"
                    />
                    <ForgotPasswordLink to={PATHS.FORGOT_PASSWORD}>
                      Forgot password?
                    </ForgotPasswordLink>
                  </InputGroup>
                </>
              ) : loginStep === "2fa" ? (
                <OtpContainer>
                  <OtpInputs>
                    {[...Array(6)].map((_, index) => {
                      const codeArray = twoFactorCode.split('').slice(0, 6);
                      return (
                        <OtpInput
                          key={index}
                          type="text"
                          maxLength={1}
                          value={codeArray[index] || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            if (value.length > 1) return;
                            
                            const newCodeArray = [...codeArray];
                            newCodeArray[index] = value;
                            const newCode = newCodeArray.join('');
                            setTwoFactorCode(newCode);
                            
                            if (value && index < 5) {
                              const nextInput = document.getElementById(`2fa-${index + 1}`);
                              if (nextInput) nextInput.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !codeArray[index] && index > 0) {
                              const prevInput = document.getElementById(`2fa-${index - 1}`);
                              if (prevInput) prevInput.focus();
                            }
                          }}
                          id={`2fa-${index}`}
                          autoFocus={index === 0}
                        />
                      );
                    })}
                  </OtpInputs>
                  
                  <BackButton type="button" onClick={() => {
                    setLoginStep("credentials");
                    setTwoFactorCode("");
                    setLoginSessionId(null);
                  }}>
                    ← Back to Login
                  </BackButton>
                </OtpContainer>
              ) : null}

              <SubmitButton
                type="button"
                onClick={handleLoginSubmit}
                disabled={
                  loginStep === "credentials"
                    ? isLoggingIn || !loginState.email || !loginState.password
                    : loginStep === "2fa"
                    ? isVerifying2FA || twoFactorCode.length < 6
                    : false
                }
              >
                {isLoggingIn || isVerifying2FA ? (
                  <PropagateLoader color="#ffffff" size={10} />
                ) : loginStep === "2fa" ? (
                  "Verify 2FA & Login"
                ) : (
                  "Sign In"
                )}
              </SubmitButton>
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
                <Label>
                  Location (Neighborhood) <span>*</span>
                </Label>
                <LocationSelect
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                >
                  {ACCRA_NEIGHBORHOODS.map((neighborhood) => (
                    <option key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </option>
                  ))}
                </LocationSelect>
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

              <SubmitButton type="button" onClick={handleRegisterSubmit} disabled={isRegistering}>
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
    </Container>
  );
};

export default AuthPage;

// Styled Components
const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px) scale(0.98); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  font-family: var(--font-body);
  padding: 2rem;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 196, 0, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 3rem;
  }

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    padding: 1rem 0.75rem;
    padding-top: 2rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.5rem;
    padding-top: 1.5rem;
  }
`;

const AuthCard = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  padding: 3.5rem;
  width: 100%;
  max-width: 480px;
  animation: ${fadeIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    border-radius: 20px;
    max-width: 100%;
  }

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    padding: 2.5rem 1.75rem;
    border-radius: 18px;
  }

  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  animation: ${slideIn} 0.5s ease-out 0.1s both;
`;

const LogoLink = styled(Link)`
  display: inline-block;
  text-decoration: none;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Title = styled.h2`
  text-align: center;
  color: #0f172a;
  margin-bottom: 0.75rem;
  font-weight: 500;
  font-size: clamp(1.5rem, 4vw, 1.75rem);
  letter-spacing: -0.3px;
  line-height: 1.3;

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    font-size: clamp(1.4rem, 5vw, 1.75rem);
    margin-bottom: 1rem;
  }

  @media (max-width: 480px) {
    font-size: clamp(1.3rem, 6vw, 1.6rem);
    margin-bottom: 1rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: #64748b;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  margin-bottom: 2.5rem;
  line-height: 1.6;
  font-weight: 400;

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    font-size: clamp(0.95rem, 3vw, 1rem);
    margin-bottom: 2rem;
    line-height: 1.65;
  }

  @media (max-width: 480px) {
    font-size: clamp(1rem, 3.5vw, 1.05rem);
    margin-bottom: 2rem;
    line-height: 1.7;
  }
`;

const ErrorBanner = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  font-size: clamp(0.875rem, 2.5vw, 0.9375rem);
  margin-bottom: 1.5rem;
  animation: ${slideIn} 0.3s ease-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '⚠';
    font-size: 1.1rem;
  }

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    padding: 1rem 1.125rem;
    font-size: clamp(0.9375rem, 3vw, 1rem);
    border-radius: 14px;
  }

  @media (max-width: 480px) {
    padding: 1.125rem 1.25rem;
    font-size: clamp(1rem, 3.5vw, 1.0625rem);
    border-radius: 16px;
  }
`;

const Tabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2.5rem;
  background: #f8fafc;
  border-radius: 12px;
  padding: 0.375rem;
  gap: 0.375rem;
`;

const Tab = styled.button`
  background: ${(props) => (props.$active ? "white" : "transparent")};
  border: none;
  padding: 0.75rem 1.75rem;
  font-size: clamp(0.95rem, 2.5vw, 1rem);
  font-weight: ${(props) => (props.$active ? "500" : "400")};
  color: ${(props) => (props.$active ? "var(--color-primary-600)" : "#64748b")};
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  flex: 1;
  box-shadow: ${(props) => (props.$active ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none")};
  min-height: 44px; /* Minimum touch target */

  &:hover {
    color: ${(props) => (props.$active ? "var(--color-primary-700)" : "var(--color-primary-600)")};
  }

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    padding: 0.875rem 1.5rem;
    font-size: clamp(1rem, 3vw, 1.0625rem);
    min-height: 48px;
  }

  @media (max-width: 480px) {
    padding: 1rem 1.25rem;
    font-size: clamp(1.0625rem, 3.5vw, 1.125rem);
    min-height: 52px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  /* Mobile phone optimizations - increase spacing */
  @media (max-width: 640px) {
    gap: 1.75rem;
  }

  @media (max-width: 480px) {
    gap: 2rem;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
`;

const Label = styled.label`
  font-size: clamp(0.875rem, 2.5vw, 0.9375rem);
  font-weight: 400;
  color: #475569;
  margin-bottom: 0.25rem;
  display: block;

  span {
    color: #dc2626;
    margin-left: 2px;
  }

  /* Mobile phone optimizations - increase readability */
  @media (max-width: 640px) {
    font-size: clamp(0.9375rem, 3vw, 1rem);
    margin-bottom: 0.5rem;
  }

  @media (max-width: 480px) {
    font-size: clamp(1rem, 3.5vw, 1.0625rem);
    margin-bottom: 0.5rem;
  }
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: clamp(0.95rem, 2.5vw, 1rem);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  color: #0f172a;
  font-weight: 400;
  width: 100%;
  min-height: 44px; /* Minimum touch target size */

  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 
      0 0 0 4px rgba(255, 196, 0, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.04);
    outline: none;
    background: #ffffff;
  }

  &:hover:not(:focus) {
    border-color: #cbd5e1;
  }

  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  &:disabled {
    background: #f8fafc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Mobile phone optimizations - larger touch targets and text */
  @media (max-width: 640px) {
    padding: 1rem 1.125rem;
    font-size: clamp(1rem, 3vw, 1.0625rem);
    min-height: 48px;
    border-radius: 14px;
  }

  @media (max-width: 480px) {
    padding: 1.125rem 1.25rem;
    font-size: clamp(1.0625rem, 3.5vw, 1.125rem);
    min-height: 52px;
    border-radius: 16px;
  }
`;

const ForgotPasswordLink = styled(Link)`
  align-self: flex-end;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  font-size: clamp(0.875rem, 2.5vw, 0.9375rem);
  color: var(--color-primary-600);
  text-decoration: none;
  font-weight: 400;
  transition: all 0.2s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  display: inline-block;
  min-height: 32px; /* Minimum touch target */
  display: inline-flex;
  align-items: center;

  &:hover {
    color: var(--color-primary-700);
    background: rgba(255, 196, 0, 0.08);
  }

  &:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
    border-radius: 6px;
  }

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    font-size: clamp(0.9375rem, 3vw, 1rem);
    padding: 0.375rem 0.625rem;
    min-height: 36px;
  }

  @media (max-width: 480px) {
    font-size: clamp(1rem, 3.5vw, 1.0625rem);
    padding: 0.5rem 0.75rem;
    min-height: 40px;
  }
`;

const OtpContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const OtpInputs = styled.div`
  display: flex;
  gap: 0.875rem;
  justify-content: center;
  flex-wrap: wrap;

  /* Mobile phone optimizations - increase gap for easier tapping */
  @media (max-width: 640px) {
    gap: 1rem;
  }

  @media (max-width: 480px) {
    gap: 1.125rem;
  }
`;

const OtpInput = styled.input`
  width: 3.25rem;
  height: 3.25rem;
  text-align: center;
  font-size: clamp(1.5rem, 4vw, 1.75rem);
  font-weight: 500;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  min-height: 44px; /* Minimum touch target */

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 
      0 0 0 4px rgba(255, 196, 0, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.04);
    transform: scale(1.05);
  }

  &:hover:not(:focus) {
    border-color: #cbd5e1;
  }

  /* Mobile phone optimizations - larger OTP inputs */
  @media (max-width: 640px) {
    width: 3.75rem;
    height: 3.75rem;
    font-size: clamp(1.75rem, 5vw, 2rem);
    min-height: 48px;
    border-radius: 14px;
  }

  @media (max-width: 480px) {
    width: 4rem;
    height: 4rem;
    font-size: clamp(2rem, 6vw, 2.25rem);
    min-height: 52px;
    border-radius: 16px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary-600);
  font-size: clamp(0.875rem, 2.5vw, 0.9375rem);
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem auto 0;
  transition: all 0.2s ease;
  border-radius: 8px;
  font-weight: 400;
  min-height: 44px; /* Minimum touch target */

  &:hover {
    color: var(--color-primary-700);
    background: rgba(255, 196, 0, 0.08);
  }

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    font-size: clamp(0.9375rem, 3vw, 1rem);
    padding: 0.625rem 0.875rem;
    min-height: 48px;
  }

  @media (max-width: 480px) {
    font-size: clamp(1rem, 3.5vw, 1.0625rem);
    padding: 0.75rem 1rem;
    min-height: 52px;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  color: white;
  border: none;
  padding: 0.9375rem 1.5rem;
  border-radius: 12px;
  font-size: clamp(0.95rem, 2.5vw, 1rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 
    0 2px 8px rgba(255, 196, 0, 0.25),
    0 0 0 0 rgba(255, 196, 0, 0);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
    transform: translateY(-1px);
    box-shadow: 
      0 4px 16px rgba(255, 196, 0, 0.35),
      0 0 0 4px rgba(255, 196, 0, 0.1);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 
      0 2px 8px rgba(255, 196, 0, 0.25),
      0 0 0 2px rgba(255, 196, 0, 0.1);
  }

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.7;
  }

  &:hover:not(:disabled)::before {
    left: 100%;
  }

  /* Mobile phone optimizations - larger touch targets and text */
  @media (max-width: 640px) {
    padding: 1.125rem 1.75rem;
    font-size: clamp(1rem, 3vw, 1.0625rem);
    min-height: 52px;
    border-radius: 14px;
  }

  @media (max-width: 480px) {
    padding: 1.25rem 2rem;
    font-size: clamp(1.0625rem, 3.5vw, 1.125rem);
    min-height: 56px;
    border-radius: 16px;
    font-weight: 600;
  }
`;

const ErrorText = styled.span`
  color: #dc2626;
  font-size: clamp(0.8125rem, 2.5vw, 0.875rem);
  margin-top: 0.375rem;
  display: block;
  font-weight: 400;

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    font-size: clamp(0.875rem, 3vw, 0.9375rem);
    margin-top: 0.5rem;
  }

  @media (max-width: 480px) {
    font-size: clamp(0.9375rem, 3.5vw, 1rem);
    margin-top: 0.5rem;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  color: #94a3b8;
  margin: 2rem 0;
  font-size: clamp(0.875rem, 2.5vw, 0.9375rem);
  font-weight: 400;

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

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    margin: 2.5rem 0;
    font-size: clamp(0.9375rem, 3vw, 1rem);
  }

  @media (max-width: 480px) {
    margin: 2.5rem 0;
    font-size: clamp(1rem, 3.5vw, 1.0625rem);
  }
`;

const FooterText = styled.p`
  text-align: center;
  color: #64748b;
  font-size: clamp(0.875rem, 2.5vw, 0.9375rem);
  margin-top: 1.5rem;
  font-weight: 400;

  a {
    color: var(--color-primary-600);
    text-decoration: none;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: inline-block;
    min-height: 32px;
    display: inline-flex;
    align-items: center;

    &:hover {
      color: var(--color-primary-700);
      background: rgba(255, 196, 0, 0.08);
    }
  }

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    font-size: clamp(0.9375rem, 3vw, 1rem);
    margin-top: 2rem;

    a {
      padding: 0.375rem 0.625rem;
      min-height: 36px;
    }
  }

  @media (max-width: 480px) {
    font-size: clamp(1rem, 3.5vw, 1.0625rem);
    margin-top: 2rem;
    line-height: 1.6;

    a {
      padding: 0.5rem 0.75rem;
      min-height: 40px;
      font-size: clamp(1rem, 3.5vw, 1.0625rem);
    }
  }
`;

const HelpText = styled.span`
  color: #64748b;
  font-size: clamp(0.8125rem, 2.5vw, 0.875rem);
  margin-top: 0.375rem;
  display: block;
  font-weight: 400;
  line-height: 1.5;

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    font-size: clamp(0.875rem, 3vw, 0.9375rem);
    margin-top: 0.5rem;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    font-size: clamp(0.9375rem, 3.5vw, 1rem);
    margin-top: 0.5rem;
    line-height: 1.65;
  }
`;

const PhoneInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.375rem;
  flex-wrap: wrap;
`;

const NetworkIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f8fafc;
  color: #475569;
  border-radius: 8px;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: 0.5rem;
  border: 1px solid #e2e8f0;

  &.mtn {
    background: #fffbe6;
    color: #ffbe00;
    border-color: #ffeb99;
  }
  &.telecel {
    background: #ffe6f0;
    color: #e6007a;
    border-color: #ffb3d1;
  }
  &.airteltigo {
    background: #e6f0ff;
    color: #0057b8;
    border-color: #b3d9ff;
  }
`;

const NetworkIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 0.3rem;
`;

const PhonePrefix = styled.span`
  background: #f8fafc;
  color: var(--color-primary-600);
  border-radius: 10px;
  padding: 0.875rem 1rem;
  font-size: clamp(0.95rem, 2.5vw, 1rem);
  font-weight: 500;
  margin-right: 0.5rem;
  border: 1.5px solid #e2e8f0;
  white-space: nowrap;
  min-height: 44px;
  display: inline-flex;
  align-items: center;

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    padding: 1rem 1.125rem;
    font-size: clamp(1rem, 3vw, 1.0625rem);
    min-height: 48px;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    padding: 1.125rem 1.25rem;
    font-size: clamp(1.0625rem, 3.5vw, 1.125rem);
    min-height: 52px;
    border-radius: 14px;
  }
`;

const PhoneInput = styled.input`
  padding: 0.875rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: clamp(0.95rem, 2.5vw, 1rem);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
  background: #ffffff;
  color: #0f172a;
  font-weight: 400;
  min-height: 44px; /* Minimum touch target */

  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 
      0 0 0 4px rgba(255, 196, 0, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.04);
    outline: none;
  }

  &:hover:not(:focus) {
    border-color: #cbd5e1;
  }

  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    padding: 1rem 1.125rem;
    font-size: clamp(1rem, 3vw, 1.0625rem);
    min-height: 48px;
    border-radius: 14px;
  }

  @media (max-width: 480px) {
    padding: 1.125rem 1.25rem;
    font-size: clamp(1.0625rem, 3.5vw, 1.125rem);
    min-height: 52px;
    border-radius: 16px;
  }
`;

const LocationSelect = styled.select`
  padding: 0.875rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: clamp(0.95rem, 2.5vw, 1rem);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: white;
  color: #0f172a;
  cursor: pointer;
  font-weight: 400;
  width: 100%;
  min-height: 44px; /* Minimum touch target */

  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 
      0 0 0 4px rgba(255, 196, 0, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.04);
    outline: none;
  }

  &:hover:not(:focus) {
    border-color: #cbd5e1;
  }

  option {
    padding: 0.5rem;
    font-size: 1rem; /* Prevent zoom on iOS */
  }

  /* Mobile phone optimizations */
  @media (max-width: 640px) {
    padding: 1rem 1.125rem;
    font-size: clamp(1rem, 3vw, 1.0625rem);
    min-height: 48px;
    border-radius: 14px;
  }

  @media (max-width: 480px) {
    padding: 1.125rem 1.25rem;
    font-size: clamp(1.0625rem, 3.5vw, 1.125rem);
    min-height: 52px;
    border-radius: 16px;
  }
`;
