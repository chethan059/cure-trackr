import { DiagnosisResponse, Symptom } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export async function getDiagnosis(symptoms: Symptom[], language: string = "en"): Promise<DiagnosisResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke('diagnose', {
      body: { symptoms, language }
    });

    if (error) {
      console.error("Diagnosis error:", error);
      toast.error("Error connecting to diagnosis service. Please try again later.");
      return null;
    }

    return data as DiagnosisResponse;
  } catch (error) {
    console.error("Diagnosis API error:", error);
    toast.error("Error connecting to diagnosis service. Please try again later.");
    return null;
  }
}
