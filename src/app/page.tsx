import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Send,
  Zap,
  UserPlus,
  Repeat,
  Link as LinkIcon,
  BarChart2,
  Camera,
  Tag,
  Star,
  Play,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />

      <main className="flex-1 font-sans">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 md:pt-12 pb-24 md:pb-32 bg-white/20 dark:bg-black/20">
          {/* gentle floating blur */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className="w-[700px] h-[700px]
                    bg-[radial-gradient(circle,rgba(26,105,221,0.2),transparent)]
                    rounded-full blur-3xl animate-glowMove"
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {/* Glow moving left to right */}
            <div
              className="w-[700px] h-[700px]
                    bg-[radial-gradient(circle,rgba(78,170,179,0.1),transparent)]
                    rounded-full blur-3xl animate-waveMoveRight absolute"
            />
            {/* Glow moving right to left */}
            <div
              className="w-[700px] h-[700px]
                    bg-[radial-gradient(circle,rgba(115,240,209,0.1),transparent)]
                    rounded-full blur-3xl animate-waveMoveLeft absolute"
            />
          </div>

          <div className="container relative z-10 mx-auto px-6 text-center space-y-6 md:space-y-12">
            {/* 1. Trust Badge right below header */}
            <div className="mx-auto inline-flex items-center gap-1 px-4 py-1 border border-[#1A69DD] rounded-full bg-white/90 dark:bg-black/90">
              <Star className="h-4 w-4 text-[#1A69DD] dark:text-[#26A5E9] fill-current" />
              <span className="text-base font-semibold text-[#1A69DD] dark:text-[#26A5E9]">
                Trusted by 25,000+ Creators
              </span>
            </div>

            {/* 2. Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-snug bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
              Turn Comments into DMs
            </h1>

            {/* 3. Larger Subheading */}
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-800 dark:text-gray-300 leading-relaxed">
              Automatically respond to comments and send personalized DMs to
              boost your Instagram presence and save hours of manual work.
            </p>

            {/* 4. Bigger CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/dashboard/automation?type=post">
                <Button className="flex items-center justify-center gap-2 text-2xl py-6 px-10 bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] hover:from-[#166dbd] hover:to-[#1e99c7] text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-300 min-w-[240px]">
                  <Zap className="h-5 w-5 fill-current text-white" />
                  Start For Free
                </Button>
              </Link>
              <Link href="/dashboard/automation?type=post">
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 text-2xl py-[22px] px-10 rounded-full border-2 border-[#1A69DD] dark:border-[#26A5E9] text-[#1A69DD] dark:text-[#26A5E9] hover:bg-[#1A69DD]/10 dark:hover:bg-[#26A5E9]/10 transition-colors duration-300 min-w-[240px]"
                >
                  <Play className="h-5 w-5 fill-current text-[#1A69DD] dark:text-[#26A5E9]" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* 5. Slightly larger “Approved by” beneath CTAs */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-base md:text-lg font-medium text-neutral-600 dark:text-neutral-400">
                Approved by
              </span>
              <Image
                src="/meta.svg"
                alt="Meta Approved"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-neutral-50 dark:bg-gray-800">
          <div className="container mx-auto px-6 text-center space-y-6">
            <h2
              className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]"
              style={{ lineHeight: "1.2" }}
            >
              All in One Instagram Automation
            </h2>

            <p className="max-w-2xl mx-auto text-neutral-600 dark:text-neutral-400">
              Comment triggers, DMs, stories, backtrack, link tracking, and
              exclusive brand deals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
              {[
                {
                  icon: <UserPlus className="h-6 w-6 text-white" />,
                  title: "Ask to Follow",
                  desc: "Prompt users to follow first before receiving updates.",
                },
                {
                  icon: <MessageCircle className="h-6 w-6 text-white" />,
                  title: "Comment Automation",
                  desc: "Automatically reply to every comment.",
                },
                {
                  icon: <Send className="h-6 w-6 text-white" />,
                  title: "DM Automation",
                  desc: "Convert comments into personalized DMs instantly.",
                },
                {
                  icon: <Camera className="h-6 w-6 text-white" />,
                  title: "Story Automation",
                  desc: "Automate story replies, polls, and more.",
                },
                {
                  icon: <Repeat className="h-6 w-6 text-white" />,
                  title: "Backtrack",
                  desc: "Re-engage past commenters with DM follow-ups.",
                },
                {
                  icon: <LinkIcon className="h-6 w-6 text-white" />,
                  title: "Link Tracking",
                  desc: "See who clicks your links in comments or DMs.",
                },
                {
                  icon: <BarChart2 className="h-6 w-6 text-white" />,
                  title: "Post Stats",
                  desc: "In-depth analytics on engagement & reach.",
                },
                {
                  icon: <Tag className="h-6 w-6 text-white" />,
                  title: "Exclusive Brand Deals",
                  desc: "Unlock special offers & partnerships just for you.",
                },
              ].map((feat) => (
                <div
                  key={feat.title}
                  className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow hover:shadow-lg transition-transform hover:scale-105"
                >
                  <div className="w-12 h-12 mb-4 mx-auto rounded-full bg-gradient-to-br from-[#1A69DD] to-[#26A5E9] flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              How It Works
            </h2>
            <p className="max-w-2xl mx-auto text-neutral-600 text-lg dark:text-neutral-400">
              Get set up in three simple steps — no coding required.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12">
              {[
                {
                  step: "1",
                  title: "Connect Account",
                  desc: "Link your Instagram securely in just one click.",
                },
                {
                  step: "2",
                  title: "Build Workflows",
                  desc: "Set up comment triggers and DM automations easily.",
                },
                {
                  step: "3",
                  title: "Automate & Grow",
                  desc: "Sit back and watch your engagement skyrocket.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col items-center text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md transition transform hover:-translate-y-2 hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="w-14 h-14 mb-6 rounded-full bg-gradient-to-br from-[#1A69DD] to-[#26A5E9] flex items-center justify-center text-white text-xl font-bold shadow-md transition-all duration-300 hover:scale-110">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          id="testimonials"
          className="py-24 bg-neutral-50 dark:bg-gray-800"
        >
          <div className="container mx-auto px-6 max-w-6xl text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
                What Our Users Say
              </h2>
              <p className="max-w-3xl mx-auto text-neutral-600 text-lg dark:text-neutral-400">
                Real stories from our amazing users who automate, engage, and
                grow with Groimon.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-6">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Fashion Influencer",
                  quote:
                    "Groimon’s workflows saved me hours daily and boosted my engagement 45%.",
                },
                {
                  name: "Mark Williams",
                  role: "E-Commerce Brand Owner",
                  quote:
                    "Unlimited DMs and auto-replies skyrocketed our conversions by 60%.",
                },
                {
                  name: "Jessica Chen",
                  role: "Content Creator",
                  quote:
                    "My audience feels more connected and I’ve saved so much time!",
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="flex flex-col items-center bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex flex-col items-center gap-2 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1A69DD] to-[#26A5E9] flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {t.name.split(" ")[0][0]}
                    </div>
                    <p className="text-lg font-semibold">{t.name}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t.role}
                    </p>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 italic leading-relaxed">
                    “{t.quote}”
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 max-w-4xl space-y-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
              Frequently Asked Questions
            </h2>

            <div className="space-y-8">
              {[
                {
                  q: "Is DM automation unlimited?",
                  a: "Yes - automate as much as you like, absolutely free.",
                },
                {
                  q: "Do I need to enter card details?",
                  a: "Credit card is not required to start your free trial.",
                },
                {
                  q: "Is my account secure?",
                  a: "We use OAuth and adhere to Instagram’s API guidelines.",
                },
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Yes, you can cancel at any time without penalty.",
                },
                {
                  q: "Is there a free trial?",
                  a: "This automation is completely free.",
                },
                {
                  q: "How do I contact support?",
                  a: "You can reach us through email at hardik@longtermcollab.com.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group p-6 rounded-2xl bg-neutral-50 dark:bg-gray-800 shadow-md transition-all duration-300 hover:shadow-lg"
                >
                  <summary className="text-lg font-semibold cursor-pointer text-neutral-800 dark:text-neutral-100 group-open:text-[#1A69DD] group-open:font-extrabold transition-all duration-300">
                    {item.q}
                  </summary>
                  <p className="mt-4 text-neutral-600 dark:text-neutral-400 opacity-0 group-open:opacity-100 group-open:translate-y-0 transition-all duration-300 ease-in-out">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 bg-gradient-to-b from-[#1A69DD]/10 to-transparent dark:from-[#26A5E9]/10">
          <div className="container mx-auto px-6 text-center space-y-8">
            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-neutral-900 dark:text-white">
              Ready to Automate Your Instagram?
            </h2>

            {/* Subheading */}
            <p className="text-lg md:text-xl font-medium max-w-3xl mx-auto text-neutral-600 dark:text-neutral-400">
              Join 25,000+ creators growing their engagement with Groimon.
            </p>

            {/* Call to Action Button */}
            <div className="flex justify-center">
              <Link href="/dashboard/automation?type=post">
                <Button className="flex items-center gap-3 bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] hover:from-[#166dbd] hover:to-[#1e99c7] text-white text-lg py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Zap className="h-5 w-5" /> Start For Free
                </Button>
              </Link>
            </div>

            {/* Disclaimer */}
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
