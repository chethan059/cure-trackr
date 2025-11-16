import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const symptomTexts = symptoms.map((s: any) => s.text).join(", ");
    
    const systemPrompt = `You are a medical diagnosis assistant. Provide structured medical information based on symptoms.
Always return a JSON object with this exact structure:
{
  "diagnosis": [
    {
      "disease": "Disease Name",
      "confidence": 85,
      "description": "Brief description of the disease",
      "treatments": [
        {
          "name": "Treatment name",
          "description": "Treatment details",
          "type": "traditional"
        }
      ],
      "medicines": [
        {
          "name": "Medicine name",
          "dosage": "Dosage information",
          "sideEffects": ["Side effect 1", "Side effect 2"]
        }
      ],
      "preventiveMeasures": ["Prevention tip 1", "Prevention tip 2"]
    }
  ],
  "disclaimer": "This is not medical advice. Please consult a healthcare professional for proper diagnosis and treatment."
}

Respond in ${language} language.`;

    const userPrompt = `Based on the following symptoms: ${symptomTexts}, provide a medical diagnosis with:
1. Up to 5 possible diseases with confidence scores (0-100)
2. Brief descriptions of each disease
3. Treatment options (both traditional and alternative)
4. Specific medicines with dosage and side effects
5. Preventive measures

Return ONLY valid JSON without any markdown formatting or code blocks.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let diagnosisData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      diagnosisData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response format from AI");
    }

    return new Response(JSON.stringify(diagnosisData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Diagnosis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
