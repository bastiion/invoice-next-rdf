import {Dropdown} from "semantic-ui-react";
import {useTemplatesQuery} from "../generated/graphql";
type Props = {
  onChange: (templateId: string) => void
  templateId?: string
}
export const TemplateSelect = ({ templateId, onChange}: Props) => {
  const { data } = useTemplatesQuery()
  // @ts-ignore
  return  <Dropdown options={data?.templates?.map((t) =>({ key: t, text: t, value: t })) || []} value={templateId} onChange={(_, data) => onChange(data.value as string)}/>
}

