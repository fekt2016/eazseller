import styled from 'styled-components';
import { FaDownload } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
import { exportTransactionsToCSV } from '../../../shared/hooks/finance/useSellerTransactions';

const ExportButton = styled(Button)`
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ExportTransactionsButton = ({ transactions, filename }) => {
  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      alert('No transactions to export');
      return;
    }
    
    const exportFilename = filename || `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    exportTransactionsToCSV(transactions, exportFilename);
  };

  return (
    <ExportButton
      variant="outline"
      size="md"
      onClick={handleExport}
      disabled={!transactions || transactions.length === 0}
    >
      <FaDownload /> Export CSV
    </ExportButton>
  );
};

export default ExportTransactionsButton;

