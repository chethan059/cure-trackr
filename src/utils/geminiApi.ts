
import { GEMINI_API_KEY } from "@/lib/constants";
import { DiagnosisResponse, Symptom, DiagnosisItem, Treatment, Medicine } from "@/types";
import { toast } from "sonner";

// Updated API URL to use the correct endpoint format for the Gemini API
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

export async function getDiagnosis(symptoms: Symptom[], language: string = "en"): Promise<DiagnosisResponse | null> {
  try {
    const symptomTexts = symptoms.map(s => s.text).join(", ");
    
    const promptContent = {
      contents: [
        {
          parts: [
            {
              text: `Based on the following symptoms: ${symptomTexts}, provide a medical diagnosis with potential diseases, 
              their confidence scores (0-100), and detailed treatment plans.
              
              I need:
              1. A list of up to 5 possible diseases with confidence scores
              2. Brief descriptions of each disease
              3. Treatment options for each disease (both traditional and alternative)
              4. Specific medicines with dosage information and potential side effects
              5. Preventive measures for each disease
              
              Format the response as a structured JSON object without any additional text. 
              The response should be in ${language} language.
              
              Important: Include a disclaimer about seeking professional medical advice.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    };
    
    // Updated request structure to match the latest Gemini API format
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promptContent),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(`API error: ${errorData.error?.message || "Unknown error"}`);
    }
    
    const data = await response.json();
    
    // The API sometimes returns formatted text rather than valid JSON
    // This attempts to extract JSON from text if needed
    let diagnosisData: DiagnosisResponse;
    
    try {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log("API Response:", responseText);
      
      // Try to extract JSON from the text if it contains a JSON block
      if (responseText.includes("{") && responseText.includes("}")) {
        const jsonMatch = responseText.match(/({[\s\S]*})/);
        if (jsonMatch && jsonMatch[0]) {
          const parsedData = JSON.parse(jsonMatch[0]);
          
          // Handle different response formats
          diagnosisData = transformResponseFormat(parsedData);
        } else {
          diagnosisData = transformResponseFormat(JSON.parse(responseText));
        }
      } else {
        // Fallback parsing if JSON is not properly formatted
        diagnosisData = formatFallbackResponse(responseText);
      }
      
      return diagnosisData;
      
    } catch (e) {
      console.error("Error parsing API response:", e);
      toast.error("Error processing the diagnosis data. Please try again.");
      return null;
    }
  } catch (error) {
    console.error("Diagnosis API error:", error);
    toast.error("Error connecting to diagnosis service. Please try again later.");
    return null;
  }
}

// Function to transform various response formats into our expected DiagnosisResponse format
function transformResponseFormat(data: any): DiagnosisResponse {
  // Check if the response has our expected format already
  if (data.diagnosis && Array.isArray(data.diagnosis)) {
    return data;
  }
  
  // Check for possibleDiseases format
  if (data.possibleDiseases || data.possibleDiseases) {
    const diseases = data.possibleDiseases || data.possibleDiseases;
    return {
      diagnosis: diseases.map((disease: any) => {
        // Transform to our expected format
        const diagnosisItem: DiagnosisItem = {
          disease: disease.name || disease.disease || "Unknown Disease",
          confidence: disease.confidence || 0,
          description: disease.description || "",
          treatments: [],
          medicines: [],
          preventiveMeasures: disease.prevention || []
        };
        
        // Handle treatments
        if (disease.treatment) {
          // Handle traditional treatments
          if (disease.treatment.traditional) {
            disease.treatment.traditional.forEach((item: any) => {
              if (typeof item === 'string') {
                diagnosisItem.treatments.push({
                  name: item,
                  description: "",
                  type: "traditional"
                });
              } else if (item.type && item.details) {
                diagnosisItem.treatments.push({
                  name: item.type,
                  description: item.details,
                  type: "traditional"
                });
                
                // Check if this contains medicine info
                if (item.type === "Over-the-counter medications" && Array.isArray(item.details)) {
                  item.details.forEach((med: any) => {
                    if (med.medicine) {
                      diagnosisItem.medicines.push({
                        name: med.medicine,
                        dosage: med.dosage || "",
                        sideEffects: typeof med.sideEffects === 'string' ? [med.sideEffects] : []
                      });
                    }
                  });
                }
              }
            });
          }
          
          // Handle alternative treatments
          if (disease.treatment.alternative) {
            disease.treatment.alternative.forEach((item: any) => {
              if (typeof item === 'string') {
                diagnosisItem.treatments.push({
                  name: item,
                  description: "",
                  type: "alternative"
                });
              } else if (item.type && item.details) {
                diagnosisItem.treatments.push({
                  name: item.type,
                  description: item.details,
                  type: "alternative"
                });
              }
            });
          }
        }
        
        return diagnosisItem;
      }),
      disclaimer: data.disclaimer || "This is not medical advice. Please consult a healthcare professional for proper diagnosis and treatment."
    };
  }
  
  // Return fallback if we can't determine the format
  return formatFallbackResponse("");
}

// Fallback function to format unstructured response data
function formatFallbackResponse(text: string): DiagnosisResponse {
  // Create a basic structure for unformatted responses
  return {
    diagnosis: [
      {
        disease: "Unable to process response",
        confidence: 0,
        description: "The system was unable to properly analyze your symptoms. Please try again with more specific information.",
        treatments: [],
        medicines: [],
        preventiveMeasures: ["Please consult a healthcare professional for accurate medical advice."]
      }
    ],
    disclaimer: "This is not medical advice. Please consult a healthcare professional for proper diagnosis and treatment."
  };
}
