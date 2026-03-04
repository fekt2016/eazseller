/**
 * Pill-shaped network badge for Ghana phone input (MTN, Telecel, AT, Unknown).
 * Shows checkmark when number is valid, "?" when unknown prefix.
 */
const NetworkBadge = ({ network }) => {
  if (!network) return null;
  return (
    <span
      style={{
        backgroundColor: network.bgColor,
        color: network.textColor,
        border: `1px solid ${network.color}`,
        borderRadius: '999px',
        padding: '2px 10px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {network.displayName}
      {network.isValid && <span style={{ color: 'green' }}>✓</span>}
      {!network.isValid && <span>?</span>}
    </span>
  );
};

export default NetworkBadge;
