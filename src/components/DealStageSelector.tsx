import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { DealFormValues } from "@/schemas/dealForm";

interface DealStageSelectorProps {
  form: UseFormReturn<DealFormValues>;
}

export function DealStageSelector({ form }: DealStageSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="stage"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Stage</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a stage" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="qualify">Qualify</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}