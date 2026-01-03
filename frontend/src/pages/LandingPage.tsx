import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Shield, 
  Code2, 
  BarChart3, 
  MessageSquare, 
  FileText,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function LandingPage() {
  console.log('LandingPage render');
  const features = [
    {
      icon: FileText,
      title: "Document Intelligence",
      description: "Upload PDFs, docs, and text files. Our AI chunks and indexes them automatically."
    },
    {
      icon: MessageSquare,
      title: "Instant RAG Chatbot",
      description: "Deploy context-aware AI assistants that answer from your documentation."
    },
    {
      icon: Code2,
      title: "One-Line Integration",
      description: "Embed anywhere with a single script tag. No coding required."
    },
    {
      icon: Shield,
      title: "Multi-Tenant Security",
      description: "Complete data isolation. Your documents, your vectors, your control."
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track conversations, satisfaction rates, and identify knowledge gaps."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Sub-2-second response times powered by vector search and streaming."
    }
  ];

  const steps = [
    { step: "01", title: "Create Project", description: "Name your chatbot and configure settings" },
    { step: "02", title: "Upload Docs", description: "Drop your PDFs, guides, and FAQs" },
    { step: "03", title: "Copy Widget", description: "Get your embed code in one click" },
    { step: "04", title: "Go Live", description: "Your AI assistant is ready to help users" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl">ContextOne</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" data-testid="nav-login-btn">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button data-testid="nav-signup-btn">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
                <Zap className="w-4 h-4" />
                RAG-as-a-Service Platform
              </div>
              <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
                Transform Docs into
                <span className="text-primary"> Intelligent </span>
                AI Chatbots
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Deploy context-aware AI assistants in under 2 minutes. 
                Upload your documentation, get a smart chatbot. 
                No ML expertise required.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="gap-2" data-testid="hero-cta-btn">
                    Start Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" data-testid="hero-demo-btn">
                  View Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Free tier available
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  No credit card
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in animate-fade-in-delay-2">
              <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
                <img
                  src="https://images.unsplash.com/photo-1737505599162-d9932323a889?w=800&q=80"
                  alt="AI Network Visualization"
                  className="w-full h-auto opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">User asks:</p>
                        <p className="text-sm">"How do I reset my API key?"</p>
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">AI responds with context from your docs...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">
              Everything You Need for RAG
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From document ingestion to widget deployment, we handle the complexity so you can focus on your product.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">
              Deploy in 4 Simple Steps
            </h2>
            <p className="text-muted-foreground">
              From zero to live chatbot in under 2 minutes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-heading font-bold text-primary/10 mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Widget Preview */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-6">
                Embed Anywhere with One Script
              </h2>
              <p className="text-muted-foreground mb-8">
                Get a lightweight JavaScript widget that works on any website. 
                Customize colors, position, and behavior to match your brand.
              </p>
              <div className="bg-card rounded-lg border border-border p-4">
                <code className="font-mono text-sm text-primary">
                  {`<script src="https://your-domain/api/widget.js"></script>`}
                  <br />
                  {`<script>`}
                  <br />
                  {`  new ContextOneWidget({`}
                  <br />
                  {`    projectId: "proj_xxx",`}
                  <br />
                  {`    apiKey: "ctx_xxx"`}
                  <br />
                  {`  });`}
                  <br />
                  {`</script>`}
                </code>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1764452846368-2709775eb926?w=800&q=80"
                alt="Widget Preview"
                className="rounded-2xl border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-6">
            Ready to Transform Your Documentation?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join companies using ContextOne to provide instant, accurate answers to their users.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2" data-testid="footer-cta-btn">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold">ContextOne</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 ContextOne. RAG-as-a-Service Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
