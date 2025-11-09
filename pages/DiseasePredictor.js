
import React, { useState } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { DiseasePrediction } from "@/entities/DiseasePrediction";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb, Activity, FileSearch } from "lucide-react";

export default function DiseasePredictor() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    if (symptoms.trim().length < 10) {
      setError("Please enter at least 2-3 symptoms for a better prediction.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setResult(null);

    const prompt = `
      As an AI medical assistant, analyze the following symptoms and provide a list of potential diseases.
      The user is from India. Consider common regional ailments.
      
      Symptoms: "${symptoms}"

      Provide the response in a JSON object with the following structure:
      {
        "potential_diseases": [
          {
            "name": "Disease Name",
            "confidence": "High | Medium | Low",
            "description": "A brief, simple explanation of the disease.",
            "next_steps": "Recommended actions, e.g., 'Consult a general physician', 'Monitor symptoms', 'Seek immediate medical attention'."
          }
        ],
        "disclaimer": "This is an AI-based prediction and not a medical diagnosis. Please consult a qualified doctor for accurate advice."
      }
      
      Provide up to 3 potential diseases, ordered by likelihood.
    `;

    try {
      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            potential_diseases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  confidence: { type: "string", enum: ["High", "Medium", "Low"] },
                  description: { type: "string" },
                  next_steps: { type: "string" }
                }
              }
            },
            disclaimer: { type: "string" }
          }
        }
      });
      setResult(response);

      // Save prediction to database
      const user = await User.me();
      await DiseasePrediction.create({
        user_id: user.id,
        symptoms: symptoms,
        predictions: response.potential_diseases,
      });

    } catch (err) {
      console.error("Prediction error:", err);
      setError("An error occurred while predicting. Please try again.");
    }
    setIsLoading(false);
  };
  
  const getConfidenceColor = (confidence) => {
      switch(confidence) {
          case 'High': return 'bg-red-100 text-red-800 border-red-200';
          case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
          default: return 'bg-gray-100 text-gray-800';
      }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Symptom Checker & Disease Predictor</h1>
        <p className="text-gray-600 mb-8">Enter your symptoms to get an AI-powered analysis of potential conditions.</p>

        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-purple-600" />
              Enter Your Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="For example: 'I have a high fever, headache, and a sore throat...'"
              rows={4}
              className="mb-4"
            />
            {error && <p className="text-sm text-red-600 mb-4 font-semibold">{error}</p>}
            <Button onClick={handlePredict} disabled={isLoading} className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Analyzing..." : "Predict Disease"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.potential_diseases.map((disease, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800">{disease.name}</h3>
                    <div className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getConfidenceColor(disease.confidence)}`}>
                        {disease.confidence} Confidence
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{disease.description}</p>
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold text-gray-700">Next Steps:</h4>
                    <p className="text-sm text-gray-600">{disease.next_steps}</p>
                  </div>
                </div>
              ))}
               <Alert variant="destructive" className="mt-6 bg-orange-50 border-orange-200">
                  <Lightbulb className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800 font-bold">Disclaimer</AlertTitle>
                  <AlertDescription className="text-orange-700">
                    {result.disclaimer}
                  </AlertDescription>
                </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
