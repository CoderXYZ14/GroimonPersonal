import { MessageCircle, Send, Zap, Shield, Lock, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1">
      <div className="relative overflow-hidden py-16 bg-[#F9FBFF] dark:bg-[#090E1A]">
        {/* Floating accent blobs */}
        <div className="absolute top-1/3 left-1/5 w-64 h-64 bg-[#1A69DD]/30 dark:bg-[#166dbd]/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/5 w-64 h-64 bg-[#26A5E9]/30 dark:bg-[#1e99c7]/30 rounded-full blur-3xl animate-float-delayed" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,105,221,0.1),transparent)] dark:bg-[radial-gradient(circle_at_bottom_right,rgba(30,153,199,0.2),transparent)]" />

        <div className="container relative z-10 mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-2 mb-10">
            <Shield className="h-8 w-8 text-[#1A69DD]" />
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
              Privacy Policy
            </h1>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-8 shadow-md border border-border space-y-10">
            <p className="text-lg text-muted-foreground">
              At <strong>Groimon</strong>, we’re committed to protecting your
              privacy and ensuring your information is secure. This privacy
              policy explains how we collect, use, and protect your personal
              information when you use our Instagram automation services.
            </p>

            {[
              {
                icon: FileText,
                title: "Information We Collect",
                content: [
                  "Your name and email address",
                  "Instagram account information and credentials",
                  "Payment and billing information",
                  "Communication preferences",
                  "Response templates and automation settings",
                  "Any other information you choose to provide",
                ],
              },
              {
                icon: Lock,
                title: "How We Use Your Information",
                content: [
                  "Provide, maintain, and improve our Instagram automation services",
                  "Process transactions and send related information",
                  "Send you technical notices, updates, security alerts, and support messages",
                  "Respond to your comments, questions, and customer service requests",
                  "Develop new products and services",
                  "Monitor and analyze trends, usage, and activities connected to our services",
                ],
              },
              {
                icon: Send,
                title: "Sharing Your Information",
                content: [
                  "With vendors, consultants, and service providers who need access to such information to carry out work on our behalf",
                  "In response to a request for information if we believe disclosure is in accordance with applicable law",
                  "If we believe your actions are inconsistent with our user agreements or policies",
                  "To protect the rights, property, and safety of Groimon, our users, or the public",
                  "In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition",
                ],
              },
              {
                icon: Shield,
                title: "Data Security",
                paragraph:
                  "We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. All data is encrypted during transmission using SSL technology and at rest using industry-standard encryption methods.",
              },
              {
                icon: MessageCircle,
                title: "Your Rights and Choices",
                content: [
                  "Access and update your information through your account settings",
                  "Request deletion of your personal information",
                  "Opt out of marketing communications",
                  "Request a copy of your personal data",
                ],
              },
              {
                icon: Zap,
                title: "Changes to This Policy",
                paragraph:
                  "We may update this privacy policy from time to time. If we make material changes, we will notify you by email or through a notice on our website prior to the changes becoming effective.",
              },
              {
                icon: MessageCircle,
                title: "Contact Us",
                paragraph: (
                  <>
                    If you have any questions about this privacy policy or our
                    data practices, please contact us at:
                    <br />
                    <span className="font-medium mt-2 block">
                      Email:{" "}
                      <a
                        href="mailto:hardik@longtermcollab.com"
                        className="text-[#1A69DD] hover:underline"
                      >
                        hardik@longtermcollab.com
                      </a>
                    </span>
                  </>
                ),
              },
            ].map(({ icon: Icon, title, content, paragraph }, idx) => (
              <section key={idx}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-5 w-5 text-[#1A69DD]" />
                  <h2 className="text-xl font-semibold text-foreground">
                    {title}
                  </h2>
                </div>
                <div className="pl-6 space-y-3">
                  {paragraph ? (
                    <p className="text-muted-foreground">{paragraph}</p>
                  ) : (
                    <ul className="list-disc text-muted-foreground space-y-2">
                      {content?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}

            <div className="mt-10 pt-6 border-t">
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
