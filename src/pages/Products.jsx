import { Link } from "react-router-dom";
import styled from "styled-components";
import useAuth from "../hooks/useAuth";
import { useMemo, useState } from "react";
import useProduct from "../hooks/useProduct";
import { FaEdit, FaTrash, FaPlus, FaBoxOpen } from "react-icons/fa";
import { QueryClient } from "@tanstack/react-query";

export default function Products() {
  const [deletingId, setDeletingId] = useState(null);
  const { seller, isLoading: authLoading } = useAuth();
  const sellerId = seller?._id;
  const queryClient = new QueryClient();

  const { useGetAllProductBySeller, deleteProduct } = useProduct();
  const { data } = useGetAllProductBySeller(sellerId);

  const products = useMemo(() => {
    return data?.data.data || [];
  }, [data]);
  console.log("products", products);

  const handleDelete = async (id) => {
    const stringId = id.toString();
    setDeletingId(stringId);
    try {
      await deleteProduct.mutate(stringId, {
        onSuccess: () => {
          queryClient.invalidateQueries("products");
        },
      });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return <LoadingContainer>Loading products...</LoadingContainer>;
  }

  if (products.length <= 0) {
    return (
      <EmptyState>
        <FaBoxOpen size={48} />
        <h2>No Products Found</h2>
        <p>You havent added any products yet</p>
        <Link to="/seller/dashboard/add-product">
          <AddProductButton>
            <FaPlus /> Add Your First Product
          </AddProductButton>
        </Link>
      </EmptyState>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Your Products</Title>
        <Link to="/seller/dashboard/add-product">
          <AddProductButton>
            <FaPlus /> Add Product
          </AddProductButton>
        </Link>
      </Header>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Product</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader align="right">Price</TableHeader>
              <TableHeader align="center">Stock</TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              return (
                <TableRow key={product._id}>
                  <ProductCell>
                    <ProductImage src={product.imageCover} alt={product.name} />
                    <ProductName>{product.name}</ProductName>
                  </ProductCell>
                  <TableCell>
                    <ProductDescription>
                      {product.description.slice(0, 100)}...
                    </ProductDescription>
                  </TableCell>
                  <TableCell align="right">
                    <Price>Gh₵{product.defaultPrice.toFixed(2)}</Price>
                  </TableCell>
                  <TableCell align="center">
                    <StockIndicator stock={product.totalStock}>
                      {product.totalStock}
                      {product.totalStock === 0 ? "Out of Stock" : ""}
                    </StockIndicator>
                  </TableCell>
                  <TableCell align="center">
                    <ActionButtons>
                      <EditButton to={`edit/${product._id}`}>
                        <FaEdit />
                      </EditButton>
                      <DeleteButton
                        disabled={deletingId === product._id.toString()}
                        onClick={() => handleDelete(product._id)}
                      >
                        {deletingId === product._id.toString() ? (
                          <Spinner />
                        ) : (
                          <FaTrash />
                        )}
                      </DeleteButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #2d3748;
  margin: 0;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f8fafc;
  border-bottom: 2px solid #edf2f7;
`;

const TableHeader = styled.th`
  padding: 1rem 1.5rem;
  text-align: ${(props) => props.align || "left"};
  color: #4a5568;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
`;

const TableBody = styled.tbody`
  tr:not(:last-child) {
    border-bottom: 1px solid #edf2f7;
  }
`;

const TableRow = styled.tr`
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 1.25rem 1.5rem;
  text-align: ${(props) => props.align || "left"};
  vertical-align: middle;
`;

const ProductCell = styled(TableCell)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #edf2f7;
`;

const ProductName = styled.div`
  font-weight: 500;
  color: #2d3748;
  max-width: 200px;
`;

const ProductDescription = styled.p`
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
  max-width: 400px;
`;

const Price = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

const StockIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.85rem;
  background: ${(props) =>
    props.stock > 20 ? "#f0fdf4" : props.stock > 0 ? "#fffbeb" : "#fef2f2"};
  color: ${(props) =>
    props.stock > 20 ? "#16a34a" : props.stock > 0 ? "#ca8a04" : "#dc2626"};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

const EditButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #edf2f7;
  color: #2d3748;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    transform: translateY(-2px);
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${(props) => (props.disabled ? "#cbd5e0" : "#fff5f5")};
  color: ${(props) => (props.disabled ? "#a0aec0" : "#e53e3e")};
  border: none;
  transition: all 0.2s;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover:not(:disabled) {
    background: #fed7d7;
    transform: translateY(-2px);
  }
`;

const AddProductButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2b6cb0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.2rem;
  color: #4a5568;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  max-width: 600px;
  margin: 0 auto;

  svg {
    color: #cbd5e0;
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  p {
    color: #718096;
    margin-bottom: 1.5rem;
  }
`;

const Spinner = styled.div`
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-left-color: currentColor;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
