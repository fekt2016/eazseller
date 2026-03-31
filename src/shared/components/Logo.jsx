import styled from "styled-components";
import { Link } from "react-router-dom";

const SIZES = {
  compact: "32px",
  icon:    "40px",
  default: "44px",
};

const Logo = ({
  variant = "default",
  to = null,
  className = "",
  ...props
}) => {
  const size = SIZES[variant] || SIZES.default;

  const img = (
    <LogoImg
      src="/newSaiisaiLogo.png"
      alt="Saiisai"
      $size={size}
      className={className}
      {...props}
    />
  );

  if (to) {
    return <LogoLink to={to}>{img}</LogoLink>;
  }

  return img;
};

const LogoImg = styled.img`
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  object-fit: contain;
  border-radius: ${({ $size }) => $size === "32px" ? "8px" : "10px"};
  display: block;
  flex-shrink: 0;
`;

const LogoLink = styled(Link)`
  text-decoration: none;
  display: inline-flex;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
`;

export default Logo;
