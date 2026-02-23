import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FaCheck, FaEye, FaEyeSlash, FaFacebook } from "react-icons/fa";
import { PropagateLoader } from "react-spinners";
import useAuth from '../../shared/hooks/useAuth';
import { validateGhanaPhone, sanitizeName } from '../../shared/utils/helpers';
import { PATHS } from '../../routes/routePaths';
import { ButtonSpinner } from '../../shared/components/ButtonSpinner';
import { ErrorState } from '../../shared/components/ui/LoadingComponents';
import Logo from '../../shared/components/Logo';
import { getFacebookOAuthConfig } from '../../shared/config/oauthConfig';
import GoogleLoginButton from "./GoogleLoginButton";

// Auth Form Component
const AuthPage = () => {
  const [phoneNetwork, setPhoneNetwork] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [loginClientError, setLoginClientError] = useState("");
  
  // Login state
  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
  });
  const [loginStep, setLoginStep] = useState("credentials"); // 'credentials', '2fa'
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterPasswordConfirm, setShowRegisterPasswordConfirm] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loginSessionId, setLoginSessionId] = useState(null);
  
  // Register state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    shopName: "",
    location: "",
    network: phoneNetwork,
    contactNumber: "",
    agreeToTerms: false,
  });
  // Field-level validation errors: { [fieldName]: errorMessage }
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, verify2FALogin, register, verifyAccount, resendOtp } = useAuth();
  const { mutate: loginMutation, isPending: isLoggingIn, error: loginError } = login;
  const { mutate: verify2FALoginMutation, isPending: isVerifying2FA, error: verify2FAError } = verify2FALogin;
  const { mutateAsync: registerMutation, isPending: isRegistering, error: registerError } = register;
  
  const navigate = useNavigate();

  const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";
  const { enabled: isFacebookEnabled, url: facebookAuthUrl } = getFacebookOAuthConfig(origin);

  const handleFacebookAuth = () => {
    if (!isFacebookEnabled || !facebookAuthUrl) {
      setLoginClientError("Facebook sign-in is not configured for this app.");
      return;
    }
    window.location.href = facebookAuthUrl;
  };

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

  // Normalize backend validation errors to field-level errors
  const normalizeFieldErrors = (error) => {
    const errors = {};
    
    if (!error) return errors;
    
    // Check for fieldErrors in response (from AppError.fieldErrors)
    const responseData = error?.response?.data || error?.data || {};
    const fieldErrorsFromResponse = responseData.details || responseData.fieldErrors || responseData.errors;
    
    if (fieldErrorsFromResponse && typeof fieldErrorsFromResponse === 'object') {
      // Direct field errors object: { name: "Name is required", email: "Invalid email" }
      Object.keys(fieldErrorsFromResponse).forEach((field) => {
        const errorMsg = fieldErrorsFromResponse[field];
        if (typeof errorMsg === 'string') {
          errors[field] = errorMsg;
        } else if (errorMsg?.message) {
          errors[field] = errorMsg.message;
        }
      });
    }
    
    // Check error message for field-specific patterns
    const errorMessage = responseData.message || error.message || '';
    if (errorMessage && !Object.keys(errors).length) {
      // Infer field from error message patterns
      const messageLower = errorMessage.toLowerCase();
      
      // Email errors
      if (messageLower.includes('email') && (messageLower.includes('invalid') || messageLower.includes('valid'))) {
        errors.email = 'Please enter a valid email address';
      } else if (messageLower.includes('email') && messageLower.includes('required')) {
        errors.email = 'Email address is required';
      } else if (messageLower.includes('email') && (messageLower.includes('exists') || messageLower.includes('taken') || messageLower.includes('duplicate'))) {
        errors.email = 'This email address is already registered';
      }
      
      // Password errors
      if (messageLower.includes('password') && messageLower.includes('required')) {
        errors.password = 'Password is required';
      } else if (messageLower.includes('password') && (messageLower.includes('short') || messageLower.includes('8'))) {
        errors.password = 'Password must be at least 8 characters';
      }
      
      // Name errors
      if (messageLower.includes('name') && messageLower.includes('required')) {
        errors.name = 'Name is required';
      }
      
      // Shop name errors
      if ((messageLower.includes('shop') || messageLower.includes('store')) && messageLower.includes('required')) {
        errors.shopName = 'Shop name is required';
      }
      
      // Phone errors
      if ((messageLower.includes('phone') || messageLower.includes('contact')) && messageLower.includes('required')) {
        errors.contactNumber = 'Phone number is required';
      } else if ((messageLower.includes('phone') || messageLower.includes('contact')) && (messageLower.includes('invalid') || messageLower.includes('valid'))) {
        errors.contactNumber = 'Please enter a valid phone number';
      }
    }
    
    return errors;
  };

  const getSimpleAuthErrorMessage = (err, stage) => {
    if (!err) return "";

    const status = err?.response?.status;
    const code = err?.code;
    const apiMessage = err?.response?.data?.message;
    const rawMessage = err?.message;

    const isTimeout =
      code === "ECONNABORTED" ||
      err?.isTimeout ||
      (typeof rawMessage === "string" && rawMessage.toLowerCase().includes("timeout"));
    const isNetworkError = code === "ERR_NETWORK" || (!err?.response && !!rawMessage);

    if (isTimeout) return "Request timed out. Please try again.";
    if (isNetworkError) return "Network error. Check your internet and try again.";

    // Keep seller-auth messages simple and consistent
    if (status === 401) return "Invalid email or password.";
    if (status === 403) {
      const msg = String(apiMessage || rawMessage || "").toLowerCase();
      if (msg.includes("not verified") || msg.includes("verify") || msg.includes("unverified")) {
        return "Your account is not verified. Please verify your email and try again.";
      }
      return "Access denied. Please contact support if this continues.";
    }
    if (status === 429) return "Too many attempts. Please wait a moment and try again.";
    if (status >= 500) return "Server error. Please try again later.";

    // Fallback: use backend message if it’s short and user-facing
    if (typeof apiMessage === "string" && apiMessage.trim() && apiMessage.trim().length <= 120) {
      return apiMessage.trim();
    }

    // Stage-specific fallback
    if (stage === "2fa") return "Invalid 2FA code. Please try again.";
    if (stage === "login") return "Login failed. Please try again.";
    return "Something went wrong. Please try again.";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const valueToSet = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: valueToSet }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
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
      setLoginClientError("");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = loginState.email.trim().toLowerCase();
      
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        setLoginClientError("Please enter a valid email address.");
        return false; // Explicitly return false to prevent form submission
      }
      
      if (!loginState.password) {
        setLoginClientError("Please enter your password.");
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
      setLoginClientError("");
      if (!twoFactorCode || twoFactorCode.length !== 6) {
        setLoginClientError("Please enter the 6-digit 2FA code.");
        return;
      }

      if (!loginSessionId) {
        setLoginClientError("Login session expired. Please login again.");
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

    // Clear previous field errors
    setFieldErrors({});

    // Client-side validation before API call
    const clientErrors = {};
    
    if (!formData.name.trim()) {
      clientErrors.name = 'Name is required';
    } else {
      const sanitized = sanitizeName(formData.name);
      if (sanitized !== formData.name.trim()) {
        clientErrors.name = 'Invalid characters in name. Use letters, spaces, hyphens, and apostrophes only.';
      }
    }
    
    if (!formData.email.trim()) {
      clientErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        clientErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (!formData.contactNumber.trim()) {
      clientErrors.contactNumber = 'Phone number is required';
    } else {
      const phoneValidation = validateGhanaPhone(formData.contactNumber);
      if (!phoneValidation.valid) {
        clientErrors.contactNumber = 'Please enter a valid Ghanaian phone number';
      }
    }
    
    if (!formData.shopName.trim()) {
      clientErrors.shopName = 'Shop name is required';
    } else if (formData.shopName.trim().length < 3) {
      clientErrors.shopName = 'Shop name must be at least 3 characters';
    }

    if (!formData.location.trim()) {
      clientErrors.location = 'Location is required';
    }

    if (!formData.password) {
      clientErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      clientErrors.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(formData.password)) {
      clientErrors.password = 'Almost there! Add at least one number (e.g. 1, 2, 3) to make your password stronger.';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(formData.password)) {
      clientErrors.password = 'Almost there! Add a special character (e.g. ! @ # $ %) to make your password more secure.';
    }
    
    if (!formData.passwordConfirm) {
      clientErrors.passwordConfirm = 'Please confirm your password';
    } else if (formData.password !== formData.passwordConfirm) {
      clientErrors.passwordConfirm = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      clientErrors.agreeToTerms = 'You must agree to the privacy policy & terms';
    }
    
    // If client-side validation fails, show errors and stop
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    try {
      // Build shopLocation object - using location as town/neighborhood
      const shopLocation = {
        town: formData.location.trim(),
        city: formData.location.trim(),
        region: '',
        country: 'Ghana',
      };

      const registrationData = {
        name: sanitizeName(formData.name),
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
      
      // Extract field-level errors from backend response
      const backendFieldErrors = normalizeFieldErrors(error);
      
      if (Object.keys(backendFieldErrors).length > 0) {
        // Show field-level errors
        setFieldErrors(backendFieldErrors);
      } else {
        // Only show global error if no field errors (network, server down, etc.)
        // The ErrorBanner will handle this via registerError
      }
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
                setLoginClientError("");
              }}
            >
              Login
            </Tab>
            <Tab
              $active={activeTab === "register"}
              onClick={() => {
                setActiveTab("register");
                setFieldErrors({}); // Clear field errors when switching to register tab
                setLoginClientError("");
              }}
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

          {/* Simple, user-friendly auth error message */}
          {(loginClientError || loginError || verify2FAError || (registerError && Object.keys(fieldErrors).length === 0)) && (
            <ErrorBanner>
              {(() => {
                if (loginClientError) return loginClientError;
                if (loginStep === "2fa") {
                  return getSimpleAuthErrorMessage(verify2FAError || loginError, "2fa");
                }
                // For register, keep existing behavior (out of scope for “seller login”)
                if (registerError && Object.keys(fieldErrors).length === 0) {
                  return registerError?.response?.data?.message || registerError?.message || "Registration failed. Please try again.";
                }
                return getSimpleAuthErrorMessage(loginError || verify2FAError, "login");
              })()}
            </ErrorBanner>
          )}

          {/* Login errors are shown via the simple ErrorBanner above */}
          {/* Only show ErrorState for non-field errors (when no fieldErrors exist) */}
          {registerError && activeTab === "register" && Object.keys(fieldErrors).length === 0 && (
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
                      onChange={(e) => {
                        setLoginClientError("");
                        setLoginState({ ...loginState, email: e.target.value });
                      }}
                      placeholder="your.email@example.com"
                      required
                      autoComplete="email"
                    />
                  </InputGroup>

                  <InputGroup>
                    <Label>Password</Label>
                    <PasswordInputWrapper>
                      <Input
                        type={showLoginPassword ? "text" : "password"}
                        name="password"
                        value={loginState.password}
                        onChange={(e) => {
                          setLoginClientError("");
                          setLoginState({ ...loginState, password: e.target.value });
                        }}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                        $hasToggle
                      />
                      <PasswordToggleBtn
                        type="button"
                        onClick={() => setShowLoginPassword((p) => !p)}
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </PasswordToggleBtn>
                    </PasswordInputWrapper>
                    <ForgotPasswordLink to={PATHS.FORGOT_PASSWORD}>
                      Forgot password?
                    </ForgotPasswordLink>
                  </InputGroup>

                  <SocialDivider>
                    <SocialDividerLine />
                    <SocialDividerText>or continue with</SocialDividerText>
                    <SocialDividerLine />
                  </SocialDivider>
                  <SocialButtons>
                    <SocialButton
                      type="button"
                      $bg="#1877f2"
                      $hover="#166fe5"
                      onClick={handleFacebookAuth}
                      aria-label="Continue with Facebook"
                    >
                      <FaFacebook color="white" size={18} />
                      <span>Facebook</span>
                    </SocialButton>
                    <GoogleLoginButton appType="seller" />
                  </SocialButtons>
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
                            setLoginClientError("");
                            
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
                type="submit"
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
                  style={fieldErrors.name ? { borderColor: '#dc2626' } : {}}
                />
                {fieldErrors.name && <ErrorText>{fieldErrors.name}</ErrorText>}
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
                    style={fieldErrors.contactNumber ? { borderColor: '#dc2626' } : {}}
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
                {fieldErrors.contactNumber ? (
                  <ErrorText>{fieldErrors.contactNumber}</ErrorText>
                ) : (
                  <HelpText>
                    Enter Ghanaian number (MTN, Telecel, or AirtelTigo)
                  </HelpText>
                )}
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
                  style={fieldErrors.shopName ? { borderColor: '#dc2626' } : {}}
                />
                {fieldErrors.shopName && <ErrorText>{fieldErrors.shopName}</ErrorText>}
              </InputGroup>

              <InputGroup>
                <Label>
                  Location <span>*</span>
                </Label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Accra, Kumasi, Lagos, or your city/area"
                  required
                  minLength={2}
                  maxLength={120}
                  style={fieldErrors.location ? { borderColor: '#dc2626' } : {}}
                />
                {fieldErrors.location ? (
                  <ErrorText>{fieldErrors.location}</ErrorText>
                ) : (
                  <HelpText>
                    Enter your business location (city, region, or area). Anyone can register from any location.
                  </HelpText>
                )}
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
                  style={fieldErrors.email ? { borderColor: '#dc2626' } : {}}
                />
                {fieldErrors.email && <ErrorText>{fieldErrors.email}</ErrorText>}
              </InputGroup>

              <InputGroup>
                <Label>Password</Label>
                <PasswordInputWrapper>
                  <Input
                    type={showRegisterPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    style={fieldErrors.password ? { borderColor: '#dc2626' } : {}}
                    $hasToggle
                  />
                  <PasswordToggleBtn
                    type="button"
                    onClick={() => setShowRegisterPassword((p) => !p)}
                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                  >
                    {showRegisterPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </PasswordToggleBtn>
                </PasswordInputWrapper>
                {fieldErrors.password && <ErrorText>{fieldErrors.password}</ErrorText>}
              </InputGroup>

              <InputGroup>
                <Label>Confirm Password</Label>
                <PasswordInputWrapper>
                  <Input
                    type={showRegisterPasswordConfirm ? "text" : "password"}
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    style={fieldErrors.passwordConfirm ? { borderColor: '#dc2626' } : {}}
                    $hasToggle
                  />
                  <PasswordToggleBtn
                    type="button"
                    onClick={() => setShowRegisterPasswordConfirm((p) => !p)}
                    aria-label={showRegisterPasswordConfirm ? "Hide password" : "Show password"}
                  >
                    {showRegisterPasswordConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </PasswordToggleBtn>
                </PasswordInputWrapper>
                {fieldErrors.passwordConfirm && <ErrorText>{fieldErrors.passwordConfirm}</ErrorText>}
              </InputGroup>

              <TermsCheckboxGroup>
                <TermsCheckboxLabel htmlFor="agreeToTerms">
                  <TermsCheckboxContainer>
                    <TermsCheckbox
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                    />
                    <TermsCheckboxBox $checked={formData.agreeToTerms}>
                      {formData.agreeToTerms && <FaCheck size={10} color="#667eea" />}
                    </TermsCheckboxBox>
                  </TermsCheckboxContainer>
                  <TermsLabelText>
                    I agree with the{" "}
                    <Link
                      to={PATHS.TERMS}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      privacy policy & terms
                    </Link>
                  </TermsLabelText>
                </TermsCheckboxLabel>
              </TermsCheckboxGroup>
              {fieldErrors.agreeToTerms && <ErrorText>{fieldErrors.agreeToTerms}</ErrorText>}

              <SocialDivider>
                <SocialDividerLine />
                <SocialDividerText>or sign up with</SocialDividerText>
                <SocialDividerLine />
              </SocialDivider>
              <SocialButtons>
                <SocialButton
                  type="button"
                  $bg="#1877f2"
                  $hover="#166fe5"
                  onClick={handleFacebookAuth}
                  aria-label="Sign up with Facebook"
                >
                  <FaFacebook color="white" size={18} />
                  <span>Facebook</span>
                </SocialButton>
                <GoogleLoginButton appType="seller" />
              </SocialButtons>

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

const PasswordInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordToggleBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  svg {
    display: block;
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: var(--color-primary-600, #667eea);
  }

  &:focus {
    outline: 2px solid var(--color-primary-500, #667eea);
    outline-offset: 2px;
    border-radius: 4px;
  }
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
  padding: 0.875rem ${(props) => (props.$hasToggle ? "2.75rem" : "1rem")} 0.875rem 1rem;
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

const TermsCheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 0.75rem;
`;

const TermsCheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
`;

const TermsCheckboxContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const TermsCheckbox = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
  z-index: 2;
`;

const TermsCheckboxBox = styled.div`
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid ${(props) => (props.$checked ? "#667eea" : "#ddd")};
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
  position: relative;
  z-index: 1;

  ${TermsCheckboxLabel}:hover > div > & {
    border-color: #667eea;
  }
`;

const TermsLabelText = styled.span`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;

  a {
    color: var(--color-primary-600);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
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

const SocialDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 24px 0 16px;
`;

const SocialDividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: #e2e8f0;
`;

const SocialDividerText = styled.span`
  padding: 0 16px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

const SocialButton = styled.button`
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: ${(props) => (props.$border ? `1px solid ${props.$border}` : "none")};
  background: ${(props) => props.$bg || "#fff"};
  color: ${(props) => (props.$bg === "#1877f2" ? "white" : "#333")};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: ${(props) => props.$hover || "#f5f5f5"};
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }

  &:focus {
    outline: 2px solid var(--color-primary-500, #667eea);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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
