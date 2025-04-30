import {
  Instagram,
  MessageCircle,
  FileText,
  AlertCircle,
  Clock,
  CreditCard,
  Ban,
  Scale,
  Globe,
} from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <main className="flex-1">
      <div className="relative overflow-hidden py-16 bg-white dark:bg-transparent">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/10 via-cyan-300/5 to-transparent dark:from-blue-900/20 dark:via-cyan-900/10 dark:to-transparent"></div>

        <div className="container relative z-10 mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-2 mb-8">
            <Scale className="h-8 w-8 text-[#1A69DD]" />
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
              Terms of Service
            </h1>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-8 shadow-sm border border-border mb-8">
            <p className="text-lg mb-6 text-muted-foreground">
              Welcome to Groimon. These Terms of Service (&quot;Terms&quot;)
              govern your access to and use of our Instagram automation
              services. By using our services, you agree to be bound by these
              Terms. Please read them carefully.
            </p>

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Acceptance of Terms
                  </h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    By creating an account, accessing, or using our services,
                    you acknowledge that you have read, understood, and agree to
                    be bound by these Terms. If you do not agree to these Terms,
                    you may not access or use our services.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Instagram className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Description of Services
                  </h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    Groimon provides automation services for Instagram direct
                    messages (&quot;DMs&quot;), allowing users to set up
                    automated responses, message filtering, and other features
                    to streamline Instagram communications.
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    Our services are designed to comply with Instagram&apos;s
                    terms of service while providing enhanced functionality for
                    business and creator accounts.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Account Responsibilities
                  </h2>
                </div>
                <div className="pl-7 space-y-3">
                  <p className="text-muted-foreground">
                    You are responsible for:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>
                      Maintaining the confidentiality of your account
                      credentials
                    </li>
                    <li>All activities that occur under your account</li>
                    <li>
                      Maintaining the confidentiality of your account
                      credentials
                    </li>
                    <li>
                      Providing accurate and complete information when creating
                      your account
                    </li>
                    <li>
                      Promptly updating any changes to your account information
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Ban className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Prohibited Activities
                  </h2>
                </div>
                <div className="pl-7 space-y-3">
                  <p className="text-muted-foreground">
                    When using our services, you may not:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Use our services for spamming or harassment</li>
                    <li>
                      Violate Instagram&apos;s terms of service or community
                      guidelines
                    </li>
                    <li>
                      Attempt to reverse engineer or access the underlying code
                      of our services
                    </li>
                    <li>
                      Use our services to distribute malware or harmful content
                    </li>
                    <li>Impersonate others or provide false information</li>
                    <li>
                      Sell, transfer, or share your account without our
                      permission
                    </li>
                    <li>
                      Use our services for any illegal or unauthorized purpose
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Pricing and Payment
                  </h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    Our services are offered through various subscription plans.
                    By subscribing to a paid plan, you agree to pay all fees
                    associated with your subscription.
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mt-3 space-y-2">
                    <li>
                      Subscription fees are charged at the beginning of each
                      billing cycle
                    </li>
                    <li>
                      Fees are non-refundable except where required by law
                    </li>
                    <li>
                      We may change our pricing with 30 days&apos;s advance
                      notice
                    </li>
                    <li>
                      You are responsible for any taxes associated with your
                      subscription
                    </li>
                    <li>
                      Failure to pay may result in suspension or termination of
                      your account
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Subscription Term and Cancellation
                  </h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    Subscriptions automatically renew at the end of each billing
                    period unless canceled. You may cancel your subscription at
                    any time through your account settings or by contacting
                    customer support.
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    Upon cancellation, you will continue to have access to your
                    paid features until the end of your current billing period,
                    after which your account will revert to our free tier or be
                    deactivated, depending on the service options available at
                    that time.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Termination
                  </h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    We reserve the right to suspend or terminate your account
                    and access to our services at any time for any reason,
                    including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mt-3 space-y-2">
                    <li>Violation of these Terms</li>
                    <li>Engaging in prohibited activities</li>
                    <li>Non-payment of subscription fees</li>
                    <li>
                      Upon request by Instagram or to comply with their policies
                    </li>
                    <li>If your usage poses a security risk to our services</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Intellectual Property
                  </h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    Our services, including all content, features, and
                    functionality, are owned by Groimon and are protected by
                    copyright, trademark, and other intellectual property laws.
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    You retain all rights to your content that you upload,
                    submit, or display through our services. By using our
                    services, you grant us a non-exclusive, royalty-free license
                    to use, store, and display your content solely for the
                    purpose of providing our services to you.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Limitation of Liability
                  </h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    To the maximum extent permitted by law, Groimon shall not be
                    liable for any indirect, incidental, special, consequential,
                    or punitive damages, including without limitation, loss of
                    profits, data, use, goodwill, or other intangible losses,
                    resulting from:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mt-3 space-y-2">
                    <li>
                      Your access to or use of or inability to access or use our
                      services
                    </li>
                    <li>
                      Any changes made to our services or any temporary or
                      permanent cessation of our services
                    </li>
                    <li>
                      Unauthorized access to or alteration of your transmissions
                      or data
                    </li>
                    <li>
                      Any actions taken by Instagram regarding your account or
                      content
                    </li>
                    <li>
                      The deletion, corruption, or failure to store any content
                      maintained or transmitted by our services
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Governing Law
                  </h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    These Terms shall be governed and construed in accordance
                    with the laws of [Your Jurisdiction], without regard to its
                    conflict of law provisions. Any disputes arising under or in
                    connection with these Terms shall be subject to the
                    exclusive jurisdiction of the courts located in [Your
                    Jurisdiction].
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Changes to Terms
                  </h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    We may modify these Terms at any time. If we make material
                    changes, we will notify you by email or through a notice on
                    our website prior to the changes becoming effective. Your
                    continued use of our services after such modifications
                    constitutes your acceptance of the updated Terms.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-bold text-foreground">
                    Contact Us
                  </h2>
                </div>
                <div className="pl-7">
                  <p className="text-muted-foreground">
                    If you have any questions about these Terms, please contact
                    us at:
                  </p>
                  <p className="mt-3 font-medium">
                    Email:{" "}
                    <a
                      href="mailto:hardik@longtermcollab.com"
                      className="text-[#1A69DD] hover:text-[#166dbd] hover:underline transition-colors"
                    >
                      hardik@longtermcollab.com
                    </a>
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
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
