import styled from "styled-components";
import { devicesMax } from "../../styles/breakpoint";
import { DesktopView, MobileView, SpacingProps } from "./SpacingSystem";
import Button from "./Button";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const TableContainer = styled.div`
  ${SpacingProps}
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: var(--color-grey-50);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--color-grey-200);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--color-grey-50);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  padding: var(--spacing-md);
  text-align: ${({ align }) => align || 'left'};
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 1.2rem;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: var(--spacing-md);
  text-align: ${({ align }) => align || 'left'};
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  font-family: var(--font-body);
  vertical-align: middle;
`;

// Mobile Card Styles
const CardList = styled.div`
  display: flex;
  flex-direction: column;
  ${SpacingProps}
`;

const DataCard = styled.div`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  ${SpacingProps}
  margin-bottom: var(--spacing-sm);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: ${({ $alignItems }) => $alignItems || 'center'};
  padding: var(--spacing-sm) 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

const CardLabel = styled.span`
  font-weight: var(--font-semibold);
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const CardValue = styled.div`
  color: var(--color-grey-800);
  text-align: right;
  font-family: var(--font-body);
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--spacing-xs);
`;

const CardActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  justify-content: flex-end;
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-grey-200);
  ${SpacingProps}
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
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
                <TableHeader key={column.key} align={column.align}>
                  {column.title}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id || item._id || index}>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align}>
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
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-grey-500);
  font-family: var(--font-body);
`;

