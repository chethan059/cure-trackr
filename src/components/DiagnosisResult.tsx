
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DiagnosisItem } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, BadgeInfo, Pill, Shield, Stethoscope } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DiagnosisResultProps {
  diagnosis: DiagnosisItem;
  index: number;
}

export default function DiagnosisResult({ diagnosis, index }: DiagnosisResultProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return "diagnosis-tag-high";
    if (confidence >= 40) return "diagnosis-tag-medium";
    return "diagnosis-tag-low";
  };

  if (!diagnosis) {
    return null;
  }

  return (
    <Card 
      className={cn(
        "glass-card card-hover-animation overflow-hidden",
        "animate-fade-up transition-all duration-300 border-l-4",
        index === 0 ? "border-l-red-500" : 
        index === 1 ? "border-l-amber-500" : 
        "border-l-blue-500"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{diagnosis.disease || "Unknown Disease"}</CardTitle>
          <span 
            className={cn(
              "diagnosis-tag",
              getConfidenceColor(diagnosis.confidence || 0)
            )}
          >
            {diagnosis.confidence || 0}% match
          </span>
        </div>
        <CardDescription className="mt-2">{diagnosis.description || "No description available"}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="treatments" className="border-b border-border/50">
            <AccordionTrigger className="py-2">
              <div className="flex items-center">
                <Stethoscope className="h-4 w-4 mr-2 text-primary" />
                <span>Treatments</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pl-6">
                {diagnosis.treatments && diagnosis.treatments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diagnosis.treatments.map((treatment, i) => (
                      <div key={i} className="bg-muted/40 rounded-lg p-3 space-y-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{treatment.name || "Unknown Treatment"}</span>
                          <span className={cn(
                            "ml-2 text-xs px-2 py-0.5 rounded-full",
                            treatment.type === "traditional" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : 
                            "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          )}>
                            {treatment.type || "unknown"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{treatment.description || "No description available"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No specific treatments available</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="medicines" className="border-b border-border/50">
            <AccordionTrigger className="py-2">
              <div className="flex items-center">
                <Pill className="h-4 w-4 mr-2 text-primary" />
                <span>Medicines</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pl-6">
                {diagnosis.medicines && diagnosis.medicines.length > 0 ? (
                  diagnosis.medicines.map((medicine, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{medicine.name || "Unknown Medicine"}</span>
                        <span className="text-sm text-muted-foreground">{medicine.dosage || "Dosage not specified"}</span>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-muted-foreground mb-1 block">Side Effects:</span>
                        <div className="flex flex-wrap gap-1">
                          {medicine.sideEffects && medicine.sideEffects.length > 0 ? (
                            medicine.sideEffects.map((effect, j) => (
                              <span key={j} className="text-xs bg-muted/60 px-2 py-0.5 rounded-full">
                                {effect}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs">No side effects listed</span>
                          )}
                        </div>
                      </div>
                      
                      {medicine.alternatives && medicine.alternatives.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground mb-1 block">Alternatives:</span>
                          <div className="flex flex-wrap gap-1">
                            {medicine.alternatives.map((alt, j) => (
                              <span key={j} className="text-xs bg-muted/30 px-2 py-0.5 rounded-full flex items-center">
                                <ArrowRightIcon className="h-3 w-3 mr-1" />
                                {alt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No specific medicines recommended</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prevention" className="border-b border-border/50">
            <AccordionTrigger className="py-2">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                <span>Prevention</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-6">
                {diagnosis.preventiveMeasures && diagnosis.preventiveMeasures.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {diagnosis.preventiveMeasures.map((measure, i) => (
                      <li key={i} className="text-sm">{measure}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No specific preventive measures available</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="more-info" className="border-b-0">
            <AccordionTrigger className="py-2">
              <div className="flex items-center">
                <BadgeInfo className="h-4 w-4 mr-2 text-primary" />
                <span>More Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground pl-6">
                For more detailed information about {diagnosis.disease || "this condition"}, please consult with a healthcare professional. 
                This diagnosis is provided as a general guideline and should not replace professional medical advice.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
