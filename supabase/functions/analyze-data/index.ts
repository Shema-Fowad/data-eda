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
    const { dataProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received data profile for analysis:", JSON.stringify(dataProfile).slice(0, 500));

    const systemPrompt = `You are an expert data scientist specializing in Exploratory Data Analysis (EDA) and data quality improvement. 
You will receive a detailed profile of a dataset and must provide actionable, specific recommendations.

Your response MUST be in valid JSON format with the following structure:
{
  "dataCleaning": ["suggestion 1", "suggestion 2", ...],
  "restructuring": ["suggestion 1", "suggestion 2", ...],
  "featureEngineering": ["suggestion 1", "suggestion 2", ...],
  "qualityImprovements": ["suggestion 1", "suggestion 2", ...],
  "additionalData": ["suggestion 1", "suggestion 2", ...],
  "summary": "A brief 2-3 sentence summary of the most critical improvements needed"
}

Be specific about column names, data types, and exact transformations needed. Focus on practical, implementable suggestions.`;

    const userPrompt = `Analyze this dataset profile and provide recommendations:

Dataset Overview:
- Rows: ${dataProfile.shape.rows}
- Columns: ${dataProfile.shape.columns}
- Column Names: ${dataProfile.columns.join(', ')}

Column Data Types:
${Object.entries(dataProfile.dataTypes).map(([col, type]) => `- ${col}: ${type}`).join('\n')}

Missing Values:
${Object.entries(dataProfile.missingValues).map(([col, count]) => `- ${col}: ${count} missing (${((count as number / dataProfile.shape.rows) * 100).toFixed(1)}%)`).join('\n')}

Duplicate Rows: ${dataProfile.duplicates}

Numeric Statistics:
${JSON.stringify(dataProfile.numericStats, null, 2)}

Categorical Value Counts (top 5 per column):
${JSON.stringify(dataProfile.categoricalStats, null, 2)}

Outliers Detected (IQR method):
${JSON.stringify(dataProfile.outliers, null, 2)}

Correlation Matrix (numeric columns):
${JSON.stringify(dataProfile.correlations, null, 2)}

Provide comprehensive, actionable recommendations for improving this dataset.`;

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
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;
    
    console.log("AI response received:", aiContent?.slice(0, 500));

    // Parse the JSON response from AI
    let recommendations;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Provide a fallback structure
      recommendations = {
        dataCleaning: ["Unable to parse AI recommendations. Please try again."],
        restructuring: [],
        featureEngineering: [],
        qualityImprovements: [],
        additionalData: [],
        summary: aiContent || "Analysis could not be completed."
      };
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-data function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
