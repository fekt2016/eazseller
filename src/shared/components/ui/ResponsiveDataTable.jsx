import styled from "styled-components";
import { DesktopView, MobileView, SpacingProps } from "./SpacingSystem";
import Button from "./Button";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const TableContainer = styled.div`
  ${SpacingProps}
  background: #FFFFFF;
  border-radius: ;
  border: 1px solid #F1EFE8;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: #F9F8F5;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #F1EFE8;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #F9F8F5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: ${({ $align }) => $align || 'left'};
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 1.2rem;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: 1rem;
  text-align: ${({ $align }) => $align || 'left'};
  font-size: 0.9rem;
  color: #374151;
  
  vertical-align: middle;
`;

// Mobile Card Styles
const CardList = styled.div`
  display: flex;
  flex-direction: column;
  ${SpacingProps}
`;

const DataCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #F1EFE8;
  border-radius: ;
  ${SpacingProps}
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: ${({ $alignItems }) => $alignItems || 'center'};
  padding: 1rem 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #F9F8F5;
  }
`;

const CardLabel = styled.span`
  font-weight: 600;
  color: #6B7280;
  font-size: 0.875rem;
  
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const CardValue = styled.div`
  color: #1F2937;
  text-align: right;
  
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #F1EFE8;
  ${SpacingProps}
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

/**
 * ResponsiveDataTable Component
 * 
 * Displays data as a table on desktop and cards on mobile
 * 
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column configuration array
 * @param {string} $padding - Spacing prop for padding
 * @param {string} $marginBottom - Spacing prop for margin bottom
 * @param {boolean} showActions - Whether to show action buttons on mobile cards
 */
export default function ResponsiveDataTable({ 
  data = [], 
  columns = [],
  $padding = 'md',
  $marginBottom,
  showActions = true,
  ...props 
}) {
  if (!data || data.length === 0) {
    return (
      <TableContainer $padding={$padding} $marginBottom={$marginBottom} {...props}>
        <EmptyState>
          <p>No data available</p>
        </EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableContainer $padding={$padding} $marginBottom={$marginBottom} {...props}>
      {/* Desktop Table View */}
      <DesktopView>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableHeader key={column.key} $align={column.align}>
                  {column.title}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id || item._id || index}>
                {columns.map((column) => (
                  <TableCell key={column.key} $align={column.align}>
                    {column.render 
                      ? column.render(item, index) 
                      : item[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DesktopView>

      {/* Mobile Card View */}
      <MobileView>
        <CardList $gap="sm">
          {data.map((item, index) => (
            <DataCard key={item.id || item._id || index} $padding="md">
              <CardContent>
                {columns.map((column) => {
                  const value = column.render 
                    ? column.render(item, index) 
                    : item[column.key];
                  
                  // Skip rendering if column has hideOnMobile flag
                  if (column.hideOnMobile) return null;
                  
                  // Skip actions column in mobile view - it's rendered separately in CardActions
                  if (column.key === 'actions' && showActions) return null;
                  
                  return (
                    <CardRow key={column.key} $alignItems={column.align === 'center' ? 'center' : 'flex-start'}>
                      <CardLabel>{column.title}</CardLabel>
                      <CardValue>{value}</CardValue>
                    </CardRow>
                  );
                })}
              </CardContent>
              {showActions && (
                <CardActions $padding="sm">
                  {columns.find(col => col.key === 'actions')?.render?.(item, index) || (
                    <ActionGroup>
                      <Button variant="ghost" size="sm" iconOnly>
                        <FaEye />
                      </Button>
                      <Button variant="ghost" size="sm" iconOnly>
                        <FaEdit />
                      </Button>
                    </ActionGroup>
                  )}
                </CardActions>
              )}
            </DataCard>
          ))}
        </CardList>
      </MobileView>
    </TableContainer>
  );
}

const EmptyState = styled.div`
  padding: 1rem;
  text-align: center;
  color: #9CA3AF;
  
`;

