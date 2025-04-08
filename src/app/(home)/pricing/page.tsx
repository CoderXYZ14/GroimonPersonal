import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, MessageCircle, Send, Zap } from "lucide-react";

export default function Pricing() {
  return (
    <main className="flex-1">
      {/* Pricing Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-white/50 dark:bg-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-500/10 via-fuchsia-400/5 to-transparent dark:from-violet-900/20 dark:via-fuchsia-900/10 dark:to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_0deg,_var(--tw-gradient-stops))] from-violet-500/20 via-fuchsia-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Start automating your Instagram engagement today with our free plan
          </p>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Pricing Card */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-violet-500 shadow-xl">
              {/* Popular Tag */}
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white px-6 py-1 transform translate-x-8 translate-y-4 rotate-45 shadow-md">
                  <span className="font-medium text-sm">Free Access</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-950 p-8 md:p-12">
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Free Plan
                  </h3>
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-5xl md:text-6xl font-bold">$0</span>
                    <span className="text-lg text-muted-foreground ml-2">
                      /month
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Everything you need to get started
                  </p>
                </div>

                <div className="mb-8">
                  <Link href="/dashboard/automation">
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white text-lg py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                      Get Started Now
                    </Button>
                  </Link>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <span>Comment automation</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <span>DM automation</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <span>Backtrack</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <span>Multiple Keywords</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <span>Following Check</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <span>1 connected account</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <span>Remove Branding</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <span>Personalized messages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500">
            Everything You Need to Grow
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-16">
            Our free plan includes all these powerful features
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Comment Response</h3>
              <p className="text-muted-foreground">
                Auto-respond to comments on your posts with personalized
                messages based on triggers and keywords.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-purple-500 mr-2" />
                  <span>Keyword detection</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-purple-500 mr-2" />
                  <span>Custom reply templates</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-purple-500 mr-2" />
                  <span>Personalization variables</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">DM Automation</h3>
              <p className="text-muted-foreground">
                Send personalized direct messages to new followers and
                commenters automatically.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-purple-500 mr-2" />
                  <span>Welcome messages</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-purple-500 mr-2" />
                  <span>Follow-up sequences</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-purple-500 mr-2" />
                  <span>Dynamic content insertion</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Workflows</h3>
              <p className="text-muted-foreground">
                Create automated workflows based on user actions and engagement
                patterns.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-purple-500 mr-2" />
                  <span>Conditional logic</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-purple-500 mr-2" />
                  <span>Action-based triggers</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-purple-500 mr-2" />
                  <span>Performance analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white/80 dark:bg-black/80">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto divide-y dark:divide-gray-800">
            <div className="py-6">
              <h3 className="text-xl font-semibold mb-2">
                Is the free plan really free?
              </h3>
              <p className="text-muted-foreground">
                Yes, our free plan is completely free to use with no hidden
                costs. You get access to all core features with reasonable usage
                limits.
              </p>
            </div>

            <div className="py-6">
              <h3 className="text-xl font-semibold mb-2">
                Do I need to enter my credit card details?
              </h3>
              <p className="text-muted-foreground">
                No, you don't need to provide any payment information to use our
                free plan. Just sign up and start automating.
              </p>
            </div>

            <div className="py-6">
              <h3 className="text-xl font-semibold mb-2">
                How many Instagram accounts can I connect?
              </h3>
              <p className="text-muted-foreground">
                The free plan allows you to connect one Instagram account. This
                is perfect for personal accounts or small businesses.
              </p>
            </div>

            <div className="py-6">
              <h3 className="text-xl font-semibold mb-2">
                Is my Instagram account safe?
              </h3>
              <p className="text-muted-foreground">
                Absolutely. We use secure authentication methods and never store
                your Instagram password. All actions follow Instagram's terms of
                service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-white/80 dark:bg-black/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-violet-500/20 via-fuchsia-400/10 to-transparent dark:from-violet-900/30 dark:via-fuchsia-900/20 dark:to-transparent"></div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Automate Your Instagram?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Get started today for free and see how our automation tools can
            transform your Instagram presence.
          </p>
          <Link href="/dashboard/automation">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-lg py-6 px-8 rounded-lg">
              Start For Free
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required. No commitments.
          </p>
        </div>
      </section>
    </main>
  );
}
