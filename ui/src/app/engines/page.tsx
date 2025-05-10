"use client";

import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { AnimatedText } from "@/components/AnimatedText";
import { Particles } from "@/components/Particles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Badge,
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Layers,
  Lightbulb,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function EnginesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <AnimatedBackground />
        <Particles />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <AnimatedText delay={0.1}>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
              OCR{" "}
              <motion.span
                className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent inline-block"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                Engine
              </motion.span>{" "}
              Comparison
            </h1>
          </AnimatedText>
          <AnimatedText delay={0.2}>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-300">
              Find the perfect OCR solution for your needs with our
              comprehensive comparison of leading engines
            </p>
          </AnimatedText>
        </div>
      </section>

      {/* Quick Comparison Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">
              At a Glance Comparison
            </h2>
            <p className="mt-4 text-slate-400 max-w-3xl mx-auto">
              Compare the key metrics of leading OCR engines to find the best
              fit for your specific requirements
            </p>
          </AnimatedText>

          <AnimatedContainer delay={0.2}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-4 px-6 text-left"></th>
                    <th className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold">Tesseract</span>
                        <Badge className="mt-1 bg-blue-500/20 text-blue-400">
                          Open Source
                        </Badge>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold">EasyOCR</span>
                        <Badge className="mt-1 bg-green-500/20 text-green-400">
                          Balanced
                        </Badge>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold">DocTR</span>
                        <Badge className="mt-1 bg-purple-500/20 text-purple-400">
                          High Precision
                        </Badge>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800">
                    <td className="py-4 px-6 font-medium">Speed</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <Zap className="h-5 w-5 text-blue-400 mb-1" />
                        <span className="font-medium">~300 ms/page</span>
                        <span className="text-sm text-slate-400">Fastest</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <Clock className="h-5 w-5 text-green-400 mb-1" />
                        <span className="font-medium">~1.2 sec/page</span>
                        <span className="text-sm text-slate-400">Moderate</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <Clock className="h-5 w-5 text-purple-400 mb-1" />
                        <span className="font-medium">~3.5 sec/page</span>
                        <span className="text-sm text-slate-400">Slowest</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-4 px-6 font-medium">Accuracy</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">85-90%</span>
                        <div className="w-24 h-2 bg-slate-800 rounded-full mt-2">
                          <div className="w-[75%] h-full bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">90-95%</span>
                        <div className="w-24 h-2 bg-slate-800 rounded-full mt-2">
                          <div className="w-[85%] h-full bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">95-98%</span>
                        <div className="w-24 h-2 bg-slate-800 rounded-full mt-2">
                          <div className="w-[95%] h-full bg-purple-500 rounded-full"></div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr className="border-b border-slate-800">
                    <td className="py-4 px-6 font-medium">Best For</td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-sm">
                        Real-time processing, clear text
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-sm">
                        General-purpose, mixed content
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-sm">
                        Complex documents, handwriting
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium">Integration</td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-medium">Simple</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-medium">Simple</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-medium">Simple</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* Detailed Comparison */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">
              Detailed Comparison
            </h2>
            <p className="mt-4 text-slate-400 max-w-3xl mx-auto">
              Dive deeper into each OCR engine&apos;s capabilities, strengths,
              and limitations
            </p>
          </AnimatedText>

          <Tabs defaultValue="tesseract" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger
                value="tesseract"
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
              >
                Tesseract
              </TabsTrigger>
              <TabsTrigger
                value="easyocr"
                className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
              >
                EasyOCR
              </TabsTrigger>
              <TabsTrigger
                value="doctr"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                DocTR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tesseract">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="mr-2 h-5 w-5 text-blue-400" />
                      Tesseract OCR
                    </CardTitle>
                    <CardDescription>
                      Google&apos;s open-source OCR engine, widely used for text
                      extraction
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Overview</h3>
                      <p className="text-slate-400">
                        Tesseract is one of the most popular open-source OCR
                        engines, developed by Google. It&apos;s been in
                        development since the 1980s and has undergone
                        significant improvements over time, especially with the
                        introduction of LSTM neural networks in version 4.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Speed</h3>
                      <p className="text-slate-400">
                        Tesseract processes pages at approximately 300
                        milliseconds per page for standard documents, making it
                        one of the fastest OCR solutions available. This speed
                        makes it ideal for real-time applications and batch
                        processing of large document sets.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Accuracy</h3>
                      <p className="text-slate-400">
                        With an accuracy rate of 85-90% on clear, well-formatted
                        text, Tesseract performs well on printed documents but
                        struggles with handwriting, complex layouts, and
                        low-quality images. Its accuracy drops significantly
                        with poor-quality scans or images with noise.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-blue-400" />
                      Use Cases
                    </CardTitle>
                    <CardDescription>
                      Ideal applications for Tesseract
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Best Use Cases
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                          <span>
                            Real-time text extraction from clear documents
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                          <span>Prototyping OCR applications</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                          <span>
                            Processing large volumes of well-scanned documents
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Limitations</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                          <span>Struggles with handwritten text</span>
                        </li>
                        <li className="flex items-start">
                          <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                          <span>Poor performance on low-quality images</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="easyocr">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Layers className="mr-2 h-5 w-5 text-green-400" />
                      EasyOCR
                    </CardTitle>
                    <CardDescription>
                      Python library for Optical Character Recognition, built
                      with PyTorch
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Overview</h3>
                      <p className="text-slate-400">
                        EasyOCR is a relatively new OCR engine that aims to make
                        text recognition more accessible. Built on PyTorch, it
                        offers a good balance between accuracy and speed, with a
                        simple API that makes integration straightforward.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Speed</h3>
                      <p className="text-slate-400">
                        EasyOCR processes pages at approximately 800
                        milliseconds per page, positioning it between Tesseract
                        and DocTR in terms of speed. It offers GPU acceleration
                        which can significantly improve processing times for
                        batch operations.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Accuracy</h3>
                      <p className="text-slate-400">
                        With an accuracy rate of 90-95% on standard documents,
                        EasyOCR performs well on a variety of text types and
                        layouts. It handles slightly degraded images better than
                        Tesseract and offers improved recognition for natural
                        scene text.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-green-400" />
                      Use Cases
                    </CardTitle>
                    <CardDescription>
                      Ideal applications for EasyOCR
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Best Use Cases
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                          <span>General-purpose OCR applications</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                          <span>
                            Mixed content documents with various text types
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                          <span>
                            Natural scene text recognition (signs, labels)
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Limitations</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                          <span>
                            Less accurate than DocTR for complex documents
                          </span>
                        </li>
                        <li className="flex items-start">
                          <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                          <span>
                            Slower than Tesseract for high-volume processing
                          </span>
                        </li>
                        <li className="flex items-start">
                          <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                          <span>
                            Limited customization options compared to Tesseract
                          </span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="doctr">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-purple-400" />
                      DocTR
                    </CardTitle>
                    <CardDescription>
                      Document Text Recognition with TensorFlow and PyTorch
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Overview</h3>
                      <p className="text-slate-400">
                        DocTR (Document Text Recognition) is a modern OCR engine
                        built on deep learning frameworks. It uses
                        state-of-the-art models for both text detection and
                        recognition, making it particularly effective for
                        complex documents and challenging text scenarios.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Speed</h3>
                      <p className="text-slate-400">
                        DocTR processes pages at approximately 1.5 seconds per
                        page, making it the slowest of the three engines
                        compared. However, this slower speed is a trade-off for
                        its superior accuracy, especially in challenging
                        scenarios.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Accuracy</h3>
                      <p className="text-slate-400">
                        With an accuracy rate of 95-98% across various document
                        types, DocTR excels at recognizing text in complex
                        layouts, handwritten content, and low-quality images. It
                        achieves a 97.3% accuracy on the FUNSD dataset and 95.8%
                        on the CORD dataset, making it the most accurate option
                        for challenging documents.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-purple-400" />
                      Use Cases
                    </CardTitle>
                    <CardDescription>
                      Ideal applications for DocTR
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Best Use Cases
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                          <span>High-precision document analysis</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                          <span>Complex documents with varied layouts</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                          <span>Handwritten text recognition</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                          <span>
                            Low-quality or degraded document processing
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Limitations</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                          <span>Slower processing speed</span>
                        </li>
                        <li className="flex items-start">
                          <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                          <span>Higher computational requirements</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Performance Metrics Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">
              Performance Metrics
            </h2>
            <p className="mt-4 text-slate-400 max-w-3xl mx-auto">
              Quantitative comparison of OCR engines across key performance
              indicators
            </p>
          </AnimatedText>

          <div className="grid gap-8 md:grid-cols-2">
            <AnimatedContainer delay={0.1}>
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-400" />
                    Speed Comparison
                  </CardTitle>
                  <CardDescription>
                    Processing time per page (lower is better)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Tesseract</span>
                        <span className="text-sm text-blue-400">~300 ms</span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full">
                        <div className="h-full w-[20%] bg-blue-500 rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">EasyOCR</span>
                        <span className="text-sm text-green-400">~1.2 sec</span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full">
                        <div className="h-full w-[53%] bg-green-500 rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">DocTR</span>
                        <span className="text-sm text-purple-400">
                          ~3.5 sec
                        </span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full">
                        <div className="h-full w-[100%] bg-purple-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            <AnimatedContainer delay={0.2}>
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-400" />
                    Accuracy Comparison
                  </CardTitle>
                  <CardDescription>
                    Text recognition accuracy (higher is better)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Tesseract</span>
                        <span className="text-sm text-blue-400">85-90%</span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full">
                        <div className="h-full w-[87%] bg-blue-500 rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">EasyOCR</span>
                        <span className="text-sm text-green-400">90-95%</span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full">
                        <div className="h-full w-[92%] bg-green-500 rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">DocTR</span>
                        <span className="text-sm text-purple-400">95-98%</span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full">
                        <div className="h-full w-[97%] bg-purple-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* Recommendation Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">
              Choosing the Right OCR Engine
            </h2>
            <p className="mt-4 text-slate-400 max-w-3xl mx-auto">
              Recommendations based on your specific use case and requirements
            </p>
          </AnimatedText>

          <div className="grid gap-6 md:grid-cols-3">
            <AnimatedContainer delay={0.1}>
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm h-full">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                    <Zap className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle>Choose Tesseract If...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                    <p className="text-slate-300">
                      You need the fastest processing speed for real-time
                      applications
                    </p>
                  </div>
                  <div className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                    <p className="text-slate-300">
                      Your documents are well-scanned with clear, printed text
                    </p>
                  </div>
                  <div className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                    <p className="text-slate-300">
                      You&apos;re building a prototype or need an open-source
                      solution
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            <AnimatedContainer delay={0.2}>
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm h-full">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                    <Layers className="h-6 w-6 text-green-400" />
                  </div>
                  <CardTitle>Choose EasyOCR If...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                    <p className="text-slate-300">
                      You want a good balance between speed and accuracy
                    </p>
                  </div>
                  <div className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                    <p className="text-slate-300">
                      You need to process documents with mixed content types
                    </p>
                  </div>
                  <div className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                    <p className="text-slate-300">
                      You need to recognize text in natural scenes (signs,
                      labels)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            <AnimatedContainer delay={0.3}>
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm h-full">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                    <FileText className="h-6 w-6 text-purple-400" />
                  </div>
                  <CardTitle>Choose DocTR If...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                    <p className="text-slate-300">
                      You need the highest possible accuracy for complex
                      documents
                    </p>
                  </div>
                  <div className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                    <p className="text-slate-300">
                      Your documents include handwritten text or challenging
                      layouts
                    </p>
                  </div>
                  <div className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                    <p className="text-slate-300">
                      Processing speed is less important than recognition
                      quality
                    </p>
                  </div>
                  <div className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                    <p className="text-slate-300">
                      You&apos;re working with low-quality or degraded documents
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <AnimatedText>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Implement OCR in Your Project?
            </h2>
          </AnimatedText>
          <AnimatedText delay={0.1}>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-slate-300">
              LensAPI.ai combines the best of these engines to provide optimal
              results for any document type
            </p>
          </AnimatedText>
          <AnimatedContainer delay={0.2}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-6 text-lg">
                <Link href="/platform">
                  Try {process.env.NEXT_PUBLIC_PRODUCT_NAME} Now
                </Link>
              </Button>
            </motion.div>
          </AnimatedContainer>
        </div>
      </section>
    </div>
  );
}
