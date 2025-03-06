import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 bg-white dark:bg-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-300/10 to-transparent dark:from-purple-900/30 dark:via-pink-900/20 dark:to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Automate Your Instagram Engagement
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Automatically respond to comments and send personalized DMs to
              boost your Instagram presence and save hours of manual work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/dashboard/automation">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-lg py-6 px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/dashboard/automation">
                <Button
                  variant="outline"
                  className="text-lg py-6 px-8 bg-white dark:bg-transparent"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
            <div className="relative mx-auto max-w-4xl rounded-xl border bg-white dark:bg-background p-2 shadow-xl">
              <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6">
                <div className="flex flex-col gap-4 rounded-md bg-white dark:bg-background p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-purple-500">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">DM Automation</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-md bg-muted/50 p-4">
                      <p className="text-sm">New comment from @user123:</p>
                      <p className="font-medium">
                        &ldquo;Love this product! How can I learn more?&rdquo;
                      </p>
                    </div>
                    <div className="rounded-md bg-purple-500/10 p-4">
                      <p className="text-sm">Automated response:</p>
                      <p className="font-medium">
                        &ldquo;Thanks @user123! Check your DMs for more info
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white dark:bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Automation Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
              Everything you need to automate your Instagram engagement and grow
              your audience
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-background rounded-xl p-6 shadow-sm border">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Comment Automation
                </h3>
                <p className="text-muted-foreground">
                  Automatically respond to comments on your posts with
                  personalized messages based on keywords and user profiles.
                </p>
              </div>
              <div className="bg-white dark:bg-background rounded-xl p-6 shadow-sm border">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">DM Automation</h3>
                <p className="text-muted-foreground">
                  Send personalized direct messages to commenters and new
                  followers with custom templates and dynamic variables.
                </p>
              </div>
              <div className="bg-white dark:bg-background rounded-xl p-6 shadow-sm border">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Triggers</h3>
                <p className="text-muted-foreground">
                  Create custom workflows that trigger based on specific
                  actions, keywords, or user behavior patterns.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-16">
              Get started in minutes with our simple setup process
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    1
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect Account</h3>
                <p className="text-muted-foreground">
                  Securely connect your Instagram account with our easy
                  one-click authentication.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    2
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Templates</h3>
                <p className="text-muted-foreground">
                  Design personalized response templates for comments and direct
                  messages.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    3
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Automate & Grow</h3>
                <p className="text-muted-foreground">
                  Sit back and watch as your engagement increases and your
                  audience grows automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {/* <section id="testimonials" className="py-20 bg-white dark:bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-16">
              Join thousands of creators and businesses who have transformed
              their Instagram strategy
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white dark:bg-background rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">
                      Fashion Influencer
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "DMAutoPro has saved me hours every day. My engagement rate
                  has increased by 45% since I started using the automated
                  responses!"
                </p>
              </div>
              <div className="bg-white dark:bg-background rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                  <div>
                    <p className="font-semibold">Mark Williams</p>
                    <p className="text-sm text-muted-foreground">
                      E-commerce Brand
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "The DM automation has transformed our customer service. We've
                  seen a 60% increase in conversion from Instagram followers."
                </p>
              </div>
              <div className="bg-white dark:bg-background rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                  <div>
                    <p className="font-semibold">Jessica Chen</p>
                    <p className="text-sm text-muted-foreground">
                      Content Creator
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "I was skeptical at first, but the results speak for
                  themselves. My audience feels more engaged and I've saved
                  countless hours."
                </p>
              </div>
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden bg-white dark:bg-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-300/10 to-transparent dark:from-purple-900/30 dark:via-pink-900/20 dark:to-transparent"></div>
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Automate Your Instagram?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of creators and businesses who are saving time and
              growing their audience with DMAutoPro.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-lg py-6 px-8">
              Start Your Free 14-Day Trial
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
