"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, Copy, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  age: z.number().min(1, "Age must be at least 1").max(150, "Age must be less than 150"),
  weight: z.number().min(1, "Weight must be greater than 0"),
  height: z.number().min(0.1, "Height must be greater than 0"),
  par: z.number().min(0, "PAR must be at least 0").max(15, "PAR must be 15 or less"),
  sex: z.number().min(0).max(1),
});

type FormValues = z.infer<typeof formSchema>;

interface Results {
  bmi: number;
  vo2maxEstimate: number;
  wmaxEstimate: number;
  stage1Power: number;
  subsequentPower: number;
  predictedVo2max: number;
  trainedVo2max: number;
  untrainedLowerBound: number;
  untrainedUpperBound: number;
}

export default function VO2MaxCalculator() {
  const [results, setResults] = useState<Results | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = (values: FormValues) => {
    // Ensure all values are present before calculation
    if (!values.age || !values.weight || !values.height || values.par === undefined || values.sex === undefined) {
      return;
    }

    // Calculate BMI
    const bmi = values.weight / (values.height * values.height);

    // Part 1 Calculations
    const vo2maxEstimate = 56.363 + (1.921 * values.par) - (0.381 * values.age) - (0.754 * bmi) + (10.987 * values.sex);
    const wmaxEstimate = ((vo2maxEstimate - 7) * values.weight / 1.8) / 6.12;
    const stage1Power = wmaxEstimate * 0.25;
    const subsequentPower = (wmaxEstimate - stage1Power) / 8;

    // Part 2 Calculations
    const predictedVo2max = 79.9 - (0.39 * values.age) - (13.7 * values.sex) - (0.127 * (values.weight * 2.2));
    const trainedVo2max = predictedVo2max * 1.2;
    const untrainedLowerBound = predictedVo2max * 0.8;
    const untrainedUpperBound = predictedVo2max * 1.0;

    setResults({
      bmi,
      vo2maxEstimate,
      wmaxEstimate,
      stage1Power,
      subsequentPower,
      predictedVo2max,
      trainedVo2max,
      untrainedLowerBound,
      untrainedUpperBound,
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label} to clipboard!`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const copyAllResults = async () => {
    if (!results) return;
    
    const allResults = `VO2MAX Calculator Results
    
BMI: ${results.bmi.toFixed(4)} kg/m²

Part 1: Training Estimates
VO2MAX Estimate: ${results.vo2maxEstimate.toFixed(4)} ml/kg/min
WMAX Estimate: ${results.wmaxEstimate.toFixed(4)} watts
Stage 1 Power: ${results.stage1Power.toFixed(4)} watts
Subsequent Power: ${results.subsequentPower.toFixed(4)} watts

Part 2: Fitness Categories
Predicted VO2MAX: ${results.predictedVo2max.toFixed(4)} ml/kg/min
Trained VO2MAX: ${results.trainedVo2max.toFixed(4)} ml/kg/min
Untrained Lower Bound: ${results.untrainedLowerBound.toFixed(4)} ml/kg/min
Untrained Upper Bound: ${results.untrainedUpperBound.toFixed(4)} ml/kg/min`;

    try {
      await navigator.clipboard.writeText(allResults);
      toast.success("All results copied to clipboard!");
    } catch {
      toast.error("Failed to copy results to clipboard");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #002145 0%, #0055B7 50%, #00A7E1 100%)' }}>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center mb-8 py-8">
          <div className="mb-4">
            <span className="text-lg font-bold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-2 rounded-full shadow-lg">
              UBC Sports Medicine
            </span>
          </div>
          <h1 className="text-5xl font-extrabold mb-4 flex items-center justify-center gap-3 text-white drop-shadow-lg">
            Vivianas VO2 Max Super fancy calculator
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Professional fitness assessment tool for calculating VO2MAX estimates and training parameters
          </p>
          <div className="mt-4 h-1 w-32 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <Card className="border-blue-200 shadow-xl backdrop-blur-sm bg-white/95">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Calculator className="h-5 w-5 text-blue-700" />
                Input Parameters
              </CardTitle>
              <CardDescription className="text-blue-700">
                Enter your physical characteristics and PAR (Physical Activity Rating)
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-white">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (years)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your age"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Enter your weight in kg"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (m)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            placeholder="Enter your height in meters"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="par"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAR Score (0-15)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="15"
                            placeholder="Physical Activity Rating (0-15)"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Physical Activity Rating scale from 0 (lazy) to 15 (very active)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Female</SelectItem>
                            <SelectItem value="1">Male</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Calculate VO2MAX
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <Card className="border-blue-200 shadow-xl backdrop-blur-sm bg-white/95">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <TrendingUp className="h-5 w-5 text-blue-700" />
                  Calculation Results
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Your VO2MAX estimates and training parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 bg-white">
                {/* Copy All Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllResults}
                    className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    Copy All Results
                  </Button>
                </div>

                {/* BMI */}
                <div>
                  <h3 className="font-semibold mb-2 text-blue-900">Body Mass Index</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-lg p-2 border-blue-300 text-blue-800 bg-blue-50">
                      BMI: {results.bmi.toFixed(4)} kg/m²
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${results.bmi.toFixed(4)}`, "BMI")}
                      className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="bg-blue-200" />

                {/* Part 1 Results */}
                <div>
                  <h3 className="font-semibold mb-3 text-blue-900">Part 1: Training Estimates</h3>
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">VO2MAX Estimate:</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white">{results.vo2maxEstimate.toFixed(4)} ml/kg/min</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${results.vo2maxEstimate.toFixed(4)}`, "VO2MAX Estimate")}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">WMAX Estimate:</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white">{results.wmaxEstimate.toFixed(4)} watts</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${results.wmaxEstimate.toFixed(4)}`, "WMAX Estimate")}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">Stage 1 Power:</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white">{results.stage1Power.toFixed(4)} watts</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${results.stage1Power.toFixed(4)}`, "Stage 1 Power")}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">Subsequent Power:</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white">{results.subsequentPower.toFixed(4)} watts</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${results.subsequentPower.toFixed(4)}`, "Subsequent Power")}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-blue-200" />

                {/* Part 2 Results */}
                <div>
                  <h3 className="font-semibold mb-3 text-blue-900">Part 2: Fitness Categories</h3>
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">Predicted VO2MAX:</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500 text-blue-900">{results.predictedVo2max.toFixed(4)} ml/kg/min</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${results.predictedVo2max.toFixed(4)}`, "Predicted VO2MAX")}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">Trained VO2MAX:</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-600 text-white">{results.trainedVo2max.toFixed(4)} ml/kg/min</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${results.trainedVo2max.toFixed(4)}`, "Trained VO2MAX")}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">Untrained Lower:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-blue-300 text-blue-800">{results.untrainedLowerBound.toFixed(4)} ml/kg/min</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${results.untrainedLowerBound.toFixed(4)}`, "Untrained Lower Bound")}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">Untrained Upper:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-blue-300 text-blue-800">{results.untrainedUpperBound.toFixed(4)} ml/kg/min</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${results.untrainedUpperBound.toFixed(4)}`, "Untrained Upper Bound")}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Detailed Calculation Breakdown */}
        {results && (
          <Card className="mt-6 border-blue-200 shadow-xl backdrop-blur-sm bg-white/95">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="text-blue-900">Detailed Calculation Breakdown</CardTitle>
              <CardDescription className="text-blue-700">
                Exact formulas and numbers used in your calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-white">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="inputs">
                  <AccordionTrigger className="text-blue-900">Input Values Used</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div><strong>Age:</strong> {form.watch('age')} years</div>
                      <div><strong>Weight:</strong> {form.watch('weight')} kg</div>
                      <div><strong>Height:</strong> {form.watch('height')} m</div>
                      <div><strong>PAR Score:</strong> {form.watch('par')}</div>
                      <div><strong>Sex:</strong> {form.watch('sex')} ({form.watch('sex') === 1 ? 'Male' : 'Female'})</div>
                      <div><strong>BMI:</strong> {results.bmi.toFixed(4)} kg/m²</div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="bmi-calc">
                  <AccordionTrigger className="text-blue-900">BMI Calculation</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                      <div className="font-mono text-sm">
                        <strong>Formula:</strong> BMI = weight / (height × height)
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Calculation:</strong> BMI = {form.watch('weight')} / ({form.watch('height')} × {form.watch('height')})
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Calculation:</strong> BMI = {form.watch('weight')} / {(form.watch('height') * form.watch('height')).toFixed(6)}
                      </div>
                      <div className="font-mono text-sm text-blue-900">
                        <strong>Result:</strong> BMI = {results.bmi.toFixed(4)} kg/m²
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="vo2max-calc">
                  <AccordionTrigger className="text-blue-900">Part 1: VO2MAX Estimate Calculation</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                      <div className="font-mono text-sm">
                        <strong>Formula:</strong> VO2MAX = 56.363 + (1.921 × PAR) - (0.381 × AGE) - (0.754 × BMI) + (10.987 × SEX)
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Substitution:</strong> VO2MAX = 56.363 + (1.921 × {form.watch('par')}) - (0.381 × {form.watch('age')}) - (0.754 × {results.bmi.toFixed(4)}) + (10.987 × {form.watch('sex')})
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Calculation:</strong> VO2MAX = 56.363 + {(1.921 * form.watch('par')).toFixed(4)} - {(0.381 * form.watch('age')).toFixed(4)} - {(0.754 * results.bmi).toFixed(4)} + {(10.987 * form.watch('sex')).toFixed(4)}
                      </div>
                      <div className="font-mono text-sm text-blue-900">
                        <strong>Result:</strong> VO2MAX = {results.vo2maxEstimate.toFixed(4)} ml/kg/min
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="wmax-calc">
                  <AccordionTrigger className="text-blue-900">WMAX Estimate Calculation</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                      <div className="font-mono text-sm">
                        <strong>Formula:</strong> WMAX = ((VO2MAX - 7) × WEIGHT / 1.8) / 6.12
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Substitution:</strong> WMAX = (({results.vo2maxEstimate.toFixed(4)} - 7) × {form.watch('weight')} / 1.8) / 6.12
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Calculation:</strong> WMAX = ({(results.vo2maxEstimate - 7).toFixed(4)} × {form.watch('weight')} / 1.8) / 6.12
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Calculation:</strong> WMAX = {((results.vo2maxEstimate - 7) * form.watch('weight') / 1.8).toFixed(4)} / 6.12
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Calculation:</strong> WMAX = {(((results.vo2maxEstimate - 7) * form.watch('weight') / 1.8) / 6.12).toFixed(4)}
                      </div>
                      <div className="font-mono text-sm text-blue-900">
                        <strong>Result:</strong> WMAX = {results.wmaxEstimate.toFixed(4)} watts
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="power-calc">
                  <AccordionTrigger className="text-blue-900">Power Calculations</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-mono text-sm">
                          <strong>Stage 1 Power Formula:</strong> Stage 1 Power = WMAX × 0.25
                        </div>
                        <div className="font-mono text-sm">
                          <strong>Calculation:</strong> Stage 1 Power = {results.wmaxEstimate.toFixed(4)} × 0.25
                        </div>
                        <div className="font-mono text-sm text-blue-900">
                          <strong>Result:</strong> Stage 1 Power = {results.stage1Power.toFixed(4)} watts
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-sm">
                          <strong>Subsequent Power Formula:</strong> Subsequent Power = (WMAX - Stage 1 Power) / 8
                        </div>
                        <div className="font-mono text-sm">
                          <strong>Calculation:</strong> Subsequent Power = ({results.wmaxEstimate.toFixed(4)} - {results.stage1Power.toFixed(4)}) / 8
                        </div>
                        <div className="font-mono text-sm">
                          <strong>Calculation:</strong> Subsequent Power = {(results.wmaxEstimate - results.stage1Power).toFixed(4)} / 8
                        </div>
                        <div className="font-mono text-sm text-blue-900">
                          <strong>Result:</strong> Subsequent Power = {results.subsequentPower.toFixed(4)} watts
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="predicted-calc">
                  <AccordionTrigger className="text-blue-900">Part 2: Predicted VO2MAX Calculation</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                      <div className="font-mono text-sm">
                        <strong>Formula:</strong> Predicted VO2MAX = 79.9 - (0.39 × AGE) - (13.7 × SEX) - (0.127 × (WEIGHT × 2.2))
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Substitution:</strong> Predicted VO2MAX = 79.9 - (0.39 × {form.watch('age')}) - (13.7 × {form.watch('sex')}) - (0.127 × ({form.watch('weight')} × 2.2))
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Calculation:</strong> Predicted VO2MAX = 79.9 - {(0.39 * form.watch('age')).toFixed(4)} - {(13.7 * form.watch('sex')).toFixed(4)} - (0.127 × {(form.watch('weight') * 2.2).toFixed(4)})
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Calculation:</strong> Predicted VO2MAX = 79.9 - {(0.39 * form.watch('age')).toFixed(4)} - {(13.7 * form.watch('sex')).toFixed(4)} - {(0.127 * form.watch('weight') * 2.2).toFixed(4)}
                      </div>
                      <div className="font-mono text-sm text-blue-900">
                        <strong>Result:</strong> Predicted VO2MAX = {results.predictedVo2max.toFixed(4)} ml/kg/min
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="fitness-calc">
                  <AccordionTrigger className="text-blue-900">Fitness Categories Calculation</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-mono text-sm">
                          <strong>Trained VO2MAX Formula:</strong> Trained VO2MAX = Predicted VO2MAX × 1.2
                        </div>
                        <div className="font-mono text-sm">
                          <strong>Calculation:</strong> Trained VO2MAX = {results.predictedVo2max.toFixed(4)} × 1.2
                        </div>
                        <div className="font-mono text-sm text-blue-900">
                          <strong>Result:</strong> Trained VO2MAX = {results.trainedVo2max.toFixed(4)} ml/kg/min
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-sm">
                          <strong>Untrained Lower Bound Formula:</strong> Lower Bound = Predicted VO2MAX × 0.8
                        </div>
                        <div className="font-mono text-sm">
                          <strong>Calculation:</strong> Lower Bound = {results.predictedVo2max.toFixed(4)} × 0.8
                        </div>
                        <div className="font-mono text-sm text-blue-900">
                          <strong>Result:</strong> Lower Bound = {results.untrainedLowerBound.toFixed(4)} ml/kg/min
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-sm">
                          <strong>Untrained Upper Bound Formula:</strong> Upper Bound = Predicted VO2MAX × 1.0
                        </div>
                        <div className="font-mono text-sm">
                          <strong>Calculation:</strong> Upper Bound = {results.predictedVo2max.toFixed(4)} × 1.0
                        </div>
                        <div className="font-mono text-sm text-blue-900">
                          <strong>Result:</strong> Upper Bound = {results.untrainedUpperBound.toFixed(4)} ml/kg/min
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}
        </div>

        {/* Calculation Formulas */}
        <Card className="mt-8 border-blue-200 shadow-xl backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-blue-900">Calculation Formulas</CardTitle>
            <CardDescription className="text-blue-700">
              View the mathematical formulas used for all calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="bmi">
                <AccordionTrigger>Body Mass Index (BMI)</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    BMI = weight (kg) / (height (m) × height (m))
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="part1">
                <AccordionTrigger>Part 1: Training Estimates</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">VO2MAX Estimate</h4>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                      VO2MAX = 56.363 + (1.921 × PAR) - (0.381 × AGE) - (0.754 × BMI) + (10.987 × SEX)
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Where SEX: Female = 0, Male = 1
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">WMAX Estimate</h4>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                      WMAX = ((VO2MAX - 7) × WEIGHT / 1.8) / 6.12
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Stage 1 Power</h4>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                      Stage 1 Power = WMAX × 0.25
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Subsequent Power</h4>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                      Subsequent Power = (WMAX - Stage 1 Power) / 8
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="part2">
                <AccordionTrigger>Part 2: Fitness Categories</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Predicted VO2MAX</h4>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                      Predicted VO2MAX = 79.9 - (0.39 × AGE) - (13.7 × SEX) - (0.127 × (WEIGHT × 2.2))
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Where SEX: Female = 0, Male = 1
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Trained VO2MAX</h4>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                      Trained VO2MAX = Predicted VO2MAX × 1.2
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Untrained Bounds</h4>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                      Lower Bound = Predicted VO2MAX × 0.8<br />
                      Upper Bound = Predicted VO2MAX × 1.0
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
