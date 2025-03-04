import { AlertCircle, ArrowLeft, Clock, Link } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

const ComingSoon = () => {
  return (
    <main className="flex-1">
      <div className="relative overflow-hidden flex items-center justify-center py-20 md:py-32 bg-white dark:bg-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-300/10 to-transparent dark:from-purple-900/30 dark:via-pink-900/20 dark:to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-purple-500/20 to-transparent rounded-full blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-4 text-center max-w-3xl">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
              <Clock className="h-12 w-12 text-purple-500" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Coming Soon
            </h1>

            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              <p className="text-xl text-muted-foreground">
                We&apos;re working hard to bring you this page
              </p>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Our team is currently developing this feature to make your
              Instagram automation experience even better. Check back soon!
            </p>

            <div className="bg-white dark:bg-background/80 rounded-xl p-8 shadow-sm border mb-8 max-w-md">
              <h2 className="text-xl font-bold mb-4">
                Want to be notified when it&apos;s ready?
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white">
                  Notify Me
                </Button>
              </div>
            </div>

            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ComingSoon;
