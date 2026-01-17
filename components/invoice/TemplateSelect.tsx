'use client';

import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import {useTemplatesQuery} from "../generated/graphql";
import {useTranslations} from 'next-intl';
type Props = {
  onChange: (templateId: string) => void
  templateId?: string
}
export const TemplateSelect = ({ templateId, onChange}: Props) => {
  const t = useTranslations('TemplateSelect');
  const { data } = useTemplatesQuery()
  const templates = data?.templates?.filter((t): t is string => Boolean(t)) || []
  const value = templateId ?? null;
  return (
    <Select
      size="sm"
      value={value}
      placeholder={t('placeholder')}
      onChange={(_, newValue) => {
        if (newValue) {
          onChange(newValue);
        }
      }}
      sx={{ minWidth: 200 }}
    >
      {templates.map((template) => (
        <Option key={template} value={template}>
          {template}
        </Option>
      ))}
    </Select>
  );
}

