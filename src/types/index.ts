
export interface Symptom {
  id: string;
  text: string;
}

export interface DiagnosisItem {
  disease: string;
  confidence: number; // 0-100
  description: string;
  treatments: Treatment[];
  medicines: Medicine[];
  preventiveMeasures: string[];
}

export interface Treatment {
  name: string;
  description: string;
  type: "traditional" | "alternative";
}

export interface Medicine {
  name: string;
  dosage: string;
  sideEffects: string[];
  alternatives?: string[];
}

export interface DiagnosisResponse {
  diagnosis: DiagnosisItem[];
  disclaimer: string;
}
