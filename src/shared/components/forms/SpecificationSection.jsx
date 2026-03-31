import { useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { FaPlus, FaTrash } from 'react-icons/fa';

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export default function SpecificationSection() {
  const { control, register, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications.material',
  });

  const tags = watch('tags') || [];
  const metaTitle = watch('metaTitle') || '';
  const metaDescription = watch('metaDescription') || '';
  const [tagInput, setTagInput] = useState('');

  const normalizedTags = useMemo(
    () => (Array.isArray(tags) ? tags.filter(Boolean) : []),
    [tags]
  );

  const addTag = (raw) => {
    const tag = String(raw || '').trim().replace(/^,+|,+$/g, '');
    if (!tag) return;
    const lower = tag.toLowerCase();
    if (normalizedTags.some((t) => String(t).toLowerCase() === lower)) return;
    if (normalizedTags.length >= 10) return;
    setValue('tags', [...normalizedTags, tag], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeTag = (idx) => {
    const next = [...normalizedTags];
    next.splice(idx, 1);
    setValue('tags', next, { shouldDirty: true, shouldValidate: true });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    }
  };

  const handleTagBlur = () => {
    if (!tagInput.trim()) return;
    addTag(tagInput);
    setTagInput('');
  };

  return (
    <Wrap>
      <TopRow>
        <SectionTitle>Specifications</SectionTitle>
        <Badge>All optional</Badge>
      </TopRow>

      <Block>
        <BlockTitle>Materials</BlockTitle>
        {fields.map((field, index) => {
          const hex = watch(`specifications.material.${index}.hexCode`) || '';
          const swatch = HEX_RE.test(hex) ? hex : '#F1EFE8';
          return (
            <MaterialRow key={field.id}>
              <Input
                type="text"
                placeholder="e.g., Cotton, Polyester"
                {...register(`specifications.material.${index}.value`)}
              />
              <HexInput
                type="text"
                placeholder="#FFFFFF"
                {...register(`specifications.material.${index}.hexCode`)}
              />
              <Swatch style={{ backgroundColor: swatch }} aria-label="Material color preview" />
              <IconBtn
                type="button"
                aria-label="Remove material"
                onClick={() => remove(index)}
              >
                <FaTrash size={12} />
              </IconBtn>
            </MaterialRow>
          );
        })}

        <DashedAdd
          type="button"
          onClick={() => append({ value: '', hexCode: '#FFFFFF' })}
        >
          <FaPlus size={12} /> Add material
        </DashedAdd>
      </Block>

      <Block>
        <BlockTitle>Shipping dimensions</BlockTitle>
        <Row2>
          <WeightWrap>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.5"
              {...register('specifications.weight.value')}
            />
            <UnitSelect {...register('specifications.weight.unit')}>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="lb">lb</option>
              <option value="oz">oz</option>
            </UnitSelect>
          </WeightWrap>

          <DimGrid>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="L"
              {...register('specifications.dimensions.length')}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="W"
              {...register('specifications.dimensions.width')}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="H"
              {...register('specifications.dimensions.height')}
            />
            <UnitSelect {...register('specifications.dimensions.unit')}>
              <option value="cm">cm</option>
              <option value="in">in</option>
            </UnitSelect>
          </DimGrid>
        </Row2>
        <Helper>Length × Width × Height</Helper>
      </Block>

      <Block>
        <TopRow>
          <BlockTitle>Search tags</BlockTitle>
          <Badge>Optional</Badge>
        </TopRow>
        <TagBox>
          {normalizedTags.map((tag, idx) => (
            <TagChip key={`${tag}-${idx}`}>
              <span>{tag}</span>
              <TagRemove type="button" onClick={() => removeTag(idx)} aria-label={`Remove ${tag}`}>
                ×
              </TagRemove>
            </TagChip>
          ))}
          <TagInput
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleTagBlur}
            placeholder={normalizedTags.length >= 10 ? 'Max 10 tags' : 'Type and press Enter'}
            disabled={normalizedTags.length >= 10}
          />
        </TagBox>
        <Helper>Tags help buyers find your product in search.</Helper>
      </Block>

      <Block>
        <TopRow>
          <BlockTitle>SEO</BlockTitle>
          <Badge>Optional</Badge>
        </TopRow>
        <Input
          type="text"
          placeholder="Leave blank to use product name"
          maxLength={60}
          {...register('metaTitle')}
        />
        <Counter>{metaTitle.length}/60</Counter>

        <TextArea
          placeholder="Leave blank to use product description"
          maxLength={160}
          rows={3}
          {...register('metaDescription')}
        />
        <Counter>{metaDescription.length}/160</Counter>
      </Block>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: grid;
  gap: 14px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
`;

const Badge = styled.span`
  font-size: 0.6875rem;
  color: #64748b;
  background: #f8fafc;
  border: 0.5px solid #e2e8f0;
  border-radius: 999px;
  padding: 2px 8px;
`;

const Block = styled.section`
  border: 0.5px solid #ece7df;
  border-radius: 10px;
  padding: 12px;
  background: #ffffff;
  display: grid;
  gap: 10px;
`;

const BlockTitle = styled.h5`
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
`;

const MaterialRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 110px 24px 32px;
  gap: 8px;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #e8920a;
    box-shadow: 0 0 0 2px rgba(232, 146, 10, 0.12);
  }
`;

const HexInput = styled(Input)`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
`;

const TextArea = styled.textarea`
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  font-size: 0.875rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #e8920a;
    box-shadow: 0 0 0 2px rgba(232, 146, 10, 0.12);
  }
`;

const Swatch = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
`;

const IconBtn = styled.button`
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: #fcebeb;
  color: #a32d2d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const DashedAdd = styled.button`
  width: 100%;
  height: 36px;
  border: 1px dashed #e8920a;
  border-radius: 8px;
  background: #ffffff;
  color: #e8920a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const WeightWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 80px;
  gap: 8px;
`;

const UnitSelect = styled.select`
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 8px;
  font-size: 0.8125rem;
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: #e8920a;
    box-shadow: 0 0 0 2px rgba(232, 146, 10, 0.12);
  }
`;

const DimGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) 70px;
  gap: 8px;
`;

const Helper = styled.p`
  margin: 0;
  font-size: 0.6875rem;
  color: #6b7280;
`;

const TagBox = styled.div`
  min-height: 38px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 6px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.6875rem;
  color: #854f0b;
  border: 1px solid rgba(232, 146, 10, 0.35);
  background: #fdf3e3;
`;

const TagRemove = styled.button`
  border: 0;
  background: transparent;
  color: #854f0b;
  cursor: pointer;
  line-height: 1;
`;

const TagInput = styled.input`
  border: 0;
  outline: none;
  min-width: 120px;
  flex: 1;
  font-size: 0.8125rem;
`;

const Counter = styled.div`
  margin-top: -4px;
  font-size: 0.6875rem;
  color: #6b7280;
  text-align: right;
`;
