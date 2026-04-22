import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';

/**
 * Live checklist for required fields before publish (add product flow).
 */
export default function PublishingChecklist({ step = 1 }) {
  const { watch } = useFormContext();
  const name = watch('name');
  const description = watch('description');
  const parentCategory = watch('parentCategory');
  const subCategory = watch('subCategory');
  const imageCover = watch('imageCover');
  const images = watch('images');
  const variantsRaw = watch('variants');
  const variants = useMemo(
    () => (Array.isArray(variantsRaw) ? variantsRaw : []),
    [variantsRaw],
  );

  const hasPrice = useMemo(() => {
    return variants.some((v) => parseFloat(v?.price) > 0);
  }, [variants]);

  const hasImage = useMemo(() => {
    const list = Array.isArray(images) ? images : [];
    return Boolean(imageCover) || list.length > 0;
  }, [imageCover, images]);

  const items = useMemo(
    () => [
      {
        id: 'name',
        label: 'Product name',
        done: Boolean(name && String(name).trim()),
      },
      {
        id: 'description',
        label: 'Description',
        done: Boolean(description && String(description).trim()),
      },
      {
        id: 'price',
        label: 'Variant price (> 0)',
        done: hasPrice,
      },
      {
        id: 'category',
        label: 'Category & subcategory',
        done: Boolean(parentCategory && subCategory),
      },
      {
        id: 'images',
        label: 'At least one image',
        done: step >= 2 ? hasImage : false,
      },
    ],
    [name, description, hasPrice, parentCategory, subCategory, hasImage, step]
  );

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const allDone = completed === total;

  return (
    <Card>
      <CardTitle>Publishing checklist</CardTitle>
      <ProgressTrack>
        <ProgressFill $pct={pct} />
      </ProgressTrack>
      <ProgressMeta>
        {completed} of {total} required fields complete
        {allDone ? <ReadyText>Ready to publish!</ReadyText> : null}
      </ProgressMeta>
      <List>
        {items.map((row) => (
          <Row key={row.id}>
            <RowLabel>{row.label}</RowLabel>
            <Status $ok={row.done}>{row.done ? 'Done' : 'Missing'}</Status>
          </Row>
        ))}
      </List>
      {step < 2 ? (
        <Hint>Finish step 2 to confirm images.</Hint>
      ) : null}
    </Card>
  );
}

const Card = styled.aside`
  background: #ffffff;
  border: 0.5px solid #e8e4dc;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
`;

const CardTitle = styled.h3`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
`;

const ProgressTrack = styled.div`
  height: 4px;
  border-radius: 999px;
  background: #f1efe8;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: #e8920a;
  border-radius: 999px;
  transition: width 0.25s ease;
`;

const ProgressMeta = styled.div`
  font-size: 0.6875rem;
  color: #6b7280;
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

const ReadyText = styled.span`
  color: #3b6d11;
  font-weight: 600;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Row = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
`;

const RowLabel = styled.span`
  color: #374151;
`;

const Status = styled.span`
  font-weight: 600;
  font-size: 0.6875rem;
  color: ${({ $ok }) => ($ok ? '#3b6d11' : '#a32d2d')};
`;

const Hint = styled.p`
  margin: 12px 0 0 0;
  font-size: 0.6875rem;
  color: #6b7280;
`;
