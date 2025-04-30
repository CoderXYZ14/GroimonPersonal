// src/app/(home)/pricing/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, MessageCircle, Send, Zap, Play } from "lucide-react";

export default function Pricing() {
  return (
    <main className="flex-1">
      {/* Hero */}

      <section className="relative overflow-hidden py-6 md:py-8 bg-white/20 dark:bg-black/20">
        {/* animated glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Glow moving left to right */}
          <div
            className="w-[250px] h-[250px]
                    bg-[radial-gradient(circle,rgba(78,170,179,0.1),transparent)]
                    rounded-full blur-3xl animate-waveMoveRight absolute"
          />
          {/* Glow moving right to left */}
          <div
            className="w-[250px] h-[250px]
                    bg-[radial-gradient(circle,rgba(115,240,209,0.1),transparent)]
                    rounded-full blur-3xl animate-waveMoveLeft absolute"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4
                         bg-clip-text text-transparent
                         bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]"
            style={{ lineHeight: "1.2" }}
          >
            Simple, Transparent Pricing
          </h1>
          <p
            className="text-xl md:text-2xl max-w-3xl mx-auto mb-12
                         text-gray-900 dark:text-gray-300 leading-relaxed"
          >
            Start automating your Instagram engagement today with our free plan
          </p>
        </div>
      </section>

      {/* Plan Card */}
      <section className="py-4 md:py-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#1A69DD] shadow-xl group transition-transform hover:scale-105 duration-300">
              {/* Ribbon */}
              <div className="absolute top-0 right-0">
                <div
                  className="bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]
                                text-white px-6 py-1
                                transform translate-x-8 translate-y-4 rotate-45
                                shadow-md"
                >
                  <span className="font-medium text-sm">Free Access</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 md:p-12 flex flex-col items-center space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold">Free Plan</h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl md:text-6xl font-bold">$0</span>
                  <span className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                    /month
                  </span>
                </div>
                <p className="text-gray-900 dark:text-gray-300">
                  Everything you need to get started
                </p>

                <Link href="/dashboard/automation?type=post">
                  <Button
                    className="w-full bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]
                                     hover:from-[#166dbd] hover:to-[#1e99c7]
                                     text-white text-lg py-6 rounded-lg
                                     shadow-lg hover:shadow-xl
                                     transition-all duration-300"
                  >
                    Start for Free
                  </Button>
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
                  {[
                    "Unlimited Comment automation",
                    "Unlimited DM automations",
                    "Story Automation",
                    "Backtrack",
                    "Link Tracking",
                    "Post Stats",
                    "Exclusive Brand Deals",
                    "Following Check",
                    "Auto-Reply",
                    "Multiple Keywords",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className="h-5 w-5 rounded-full
                                        bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]
                                        flex items-center justify-center"
                        >
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <span className="text-gray-900 dark:text-gray-300">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-6
                         bg-clip-text text-transparent
                         bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]"
          >
            Everything You Need to Grow
          </h2>
          <p className="text-xl text-gray-900 dark:text-gray-300 max-w-2xl mx-auto text-center mb-12 leading-relaxed">
            Our free plan includes all these powerful features
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: <MessageCircle className="h-6 w-6 text-white" />,
                title: "Comment Response",
                desc: "Auto-respond to comments with personalized messages based on triggers.",
                items: [
                  "Keyword detection",
                  "Custom reply templates",
                  "Personalization variables",
                ],
              },
              {
                icon: <Send className="h-6 w-6 text-white" />,
                title: "DM Automation",
                desc: "Send personalized direct messages to new followers and commenters automatically.",
                items: [
                  "Welcome messages",
                  "Follow-up sequences",
                  "Dynamic content insertion",
                ],
              },
              {
                icon: <Zap className="h-6 w-6 text-white" />,
                title: "Follower Check",
                desc: "Ensure users follow your account before receiving automated replies or updates.",
                items: [
                  "Increase your follower count automatically",
                  "Trigger actions based on follow status",
                  "Track performance with detailed analytics",
                ],
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border
                           transition-transform hover:scale-105 hover:shadow-lg duration-300"
              >
                <div
                  className="w-12 h-12 mb-4 mx-auto rounded-full
                             bg-gradient-to-br from-[#1A69DD] to-[#26A5E9]
                             flex items-center justify-center"
                >
                  {feat.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
                <p className="text-gray-900 dark:text-gray-300 mb-4">
                  {feat.desc}
                </p>
                <ul className="space-y-2">
                  {feat.items.map((item) => (
                    <li key={item} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-[#1A69DD] mr-2" />
                      <span className="text-gray-900 dark:text-gray-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-16
                         bg-clip-text text-transparent
                         bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]"
          >
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto divide-y divide-gray-200 dark:divide-gray-800">
            {[
              {
                q: "Is the free plan really free?",
                a: "Yes, our free plan is completely free, with no hidden costs.",
              },
              {
                q: "Do I need to enter my credit card details?",
                a: "Nope! Just sign up and start automating - no payment info required.",
              },
              {
                q: "How many Instagram accounts can I connect?",
                a: "The free plan allows 1 connected account - perfect for personal or small businesses.",
              },
              {
                q: "Is my Instagram account safe?",
                a: "Absolutely. We use secure OAuth and follow Instagram’s API guidelines.",
              },
            ].map((item) => (
              <div key={item.q} className="py-6">
                <h3 className="text-xl font-semibold mb-2">{item.q}</h3>
                <p className="text-gray-900 dark:text-gray-300">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden bg-white/20 dark:bg-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(26,105,221,0.2),transparent)] blur-2xl animate-floating pointer-events-none" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Automate Your Instagram?
          </h2>
          <p className="text-xl text-gray-900 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Get started today for free and see the difference our automation
            makes.
          </p>
          <Link href="/dashboard/automation?type=post">
            <Button className="bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] hover:from-[#166dbd] hover:to-[#1e99c7] text-white text-lg py-6 px-10 rounded-lg shadow-lg hover:shadow-xl transition-transform duration-300">
              Start For Free
            </Button>
          </Link>
          <p className="text-sm text-gray-900 dark:text-gray-300 mt-4">
            No credit card required. No commitments.
          </p>
        </div>
      </section>
    </main>
  );
}
