import type { Metadata } from "next";
import Link from "next/link";
import { apiData } from "./api-data";
import { EndpointCard } from "@/components/api-docs/EndpointCard";
import { TypeDefinitions } from "@/components/api-docs/TypeDefinitions";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { AnimatedText } from "@/components/AnimatedText";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Particles } from "@/components/Particles";
import { CodeBlock } from "@/components/code-block";
import SyntaxCodeBlock from "@/components/SyntaxCodeBlock";

export const metadata: Metadata = {
  title: "API Documentation | Atlas OCR",
  description: "Comprehensive documentation for the Atlas OCR API",
};

export default function ApiDocsPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground className="fixed inset-0" />
      <Particles className="fixed inset-0" />

      <div className="container relative z-10 mx-auto px-4 py-16">
        <AnimatedContainer>
          <div className="mt-12 mb-16 text-center">
            <AnimatedText className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Atlas OCR API Documentation
            </AnimatedText>
            <p className="mt-4 text-xl text-muted-foreground">
              Integrate powerful OCR capabilities into your applications
            </p>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.1}>
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold mb-3">Base URL</h3>
                <CodeBlock
                  language="bash"
                  code={
                    <SyntaxCodeBlock lang="bash">
                      {`https://${apiData.baseUrl}`}
                    </SyntaxCodeBlock>
                  }
                />

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  Authentication
                </h3>
                <p className="mb-4">{apiData.authentication.description}</p>
                <CodeBlock
                  language="bash"
                  code={
                    <SyntaxCodeBlock lang="bash">
                      {`curl -H "${apiData.authentication.headerName}: your_api_key" https://${apiData.baseUrl}/...`}
                    </SyntaxCodeBlock>
                  }
                />
              </div>

              <div className="bg-card rounded-lg p-6 border shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="#endpoints"
                      className="text-primary hover:underline flex items-center"
                    >
                      API Endpoints
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#types"
                      className="text-primary hover:underline flex items-center"
                    >
                      Type Definitions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/ocr-engines"
                      className="text-primary hover:underline flex items-center"
                    >
                      OCR Engines Comparison
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/platform"
                      className="text-primary hover:underline flex items-center"
                    >
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.2}>
          <div id="endpoints" className="mb-16">
            <h2 className="text-3xl font-bold mb-6">API Endpoints</h2>
            {apiData.endpoints.map((endpoint, index) => (
              <EndpointCard key={index} endpoint={endpoint} />
            ))}
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.3}>
          <div id="types" className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Type Definitions</h2>
            <TypeDefinitions types={apiData.types} />
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.5}>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="mb-8 text-xl">
              Sign up for an API key and start integrating OCR capabilities into
              your applications today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Sign Up
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </div>
  );
}
