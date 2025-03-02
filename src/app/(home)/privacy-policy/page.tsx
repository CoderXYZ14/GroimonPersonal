import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/helper/mode-toggle";
import {
  Instagram,
  MessageCircle,
  Send,
  Zap,
  Shield,
  Lock,
  FileText,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1">
      <div className="relative overflow-hidden py-16 bg-white dark:bg-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/10 via-pink-300/5 to-transparent dark:from-purple-900/20 dark:via-pink-900/10 dark:to-transparent"></div>

        <div className="container relative z-10 mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Privacy Policy
            </h1>
          </div>

          <div className="bg-white dark:bg-background rounded-xl p-8 shadow-sm border mb-8">
            <p className="text-lg mb-6 text-muted-foreground">
              At Groimon, we're committed to protecting your privacy and
              ensuring your information is secure. This privacy policy explains
              how we collect, use, and protect your personal information when
              you use our Instagram automation services.
            </p>

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold">Information We Collect</h2>
                </div>
                <div className="pl-7 space-y-3">
                  <p className="text-muted-foreground">
                    We collect information that you provide directly to us, such
                    as:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Your name and email address</li>
                    <li>Instagram account information and credentials</li>
                    <li>Payment and billing information</li>
                    <li>Communication preferences</li>
                    <li>Response templates and automation settings</li>
                    <li>Any other information you choose to provide</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold">
                    How We Use Your Information
                  </h2>
                </div>
                <div className="pl-7 space-y-3">
                  <p className="text-muted-foreground">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>
                      Provide, maintain, and improve our Instagram automation
                      services
                    </li>
                    <li>Process transactions and send related information</li>
                    <li>
                      Send you technical notices, updates, security alerts, and
                      support messages
                    </li>
                    <li>
                      Respond to your comments, questions, and customer service
                      requests
                    </li>
                    <li>Develop new products and services</li>
                    <li>
                      Monitor and analyze trends, usage, and activities
                      connected to our services
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Send className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold">
                    Sharing Your Information
                  </h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    We do not sell or rent your personal information to third
                    parties. We may share your information in the following
                    limited circumstances:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mt-3 space-y-2">
                    <li>
                      With vendors, consultants, and service providers who need
                      access to such information to carry out work on our behalf
                    </li>
                    <li>
                      In response to a request for information if we believe
                      disclosure is in accordance with applicable law
                    </li>
                    <li>
                      If we believe your actions are inconsistent with our user
                      agreements or policies
                    </li>
                    <li>
                      To protect the rights, property, and safety of Groimon,
                      our users, or the public
                    </li>
                    <li>
                      In connection with, or during negotiations of, any merger,
                      sale of company assets, financing, or acquisition
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold">Data Security</h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    We take reasonable measures to help protect your personal
                    information from loss, theft, misuse, unauthorized access,
                    disclosure, alteration, and destruction. All data is
                    encrypted during transmission using SSL technology and at
                    rest using industry-standard encryption methods.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold">Your Rights and Choices</h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    You have several rights regarding your personal data:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mt-3 space-y-2">
                    <li>
                      Access and update your information through your account
                      settings
                    </li>
                    <li>Request deletion of your personal information</li>
                    <li>Opt out of marketing communications</li>
                    <li>Request a copy of your personal data</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold">Changes to This Policy</h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    We may update this privacy policy from time to time. If we
                    make material changes, we will notify you by email or
                    through a notice on our website prior to the changes
                    becoming effective. The date at the top of the policy will
                    be revised to reflect the most recent update.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold">Contact Us</h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    If you have any questions about this privacy policy or our
                    data practices, please contact us at:
                  </p>
                  <p className="mt-3 font-medium">
                    Email:{" "}
                    <a
                      href="mailto:shahwaizislam1404@gmail.com"
                      className="text-purple-500 hover:underline"
                    >
                      shahwaizislam1404@gmail.com
                    </a>
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Last Updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
