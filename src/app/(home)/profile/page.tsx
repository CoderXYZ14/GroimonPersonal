"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, AlertCircle, Hash } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { userData, isLoading, error, handleDelinkAccount } = useUserProfile();

  const onDelinkAccount = () => {
    const success = handleDelinkAccount();
    if (success) {
      toast.success("Instagram delinked successfully!!");
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#1A69DD] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Error loading profile</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="relative overflow-hidden flex flex-col items-center justify-center py-12 md:py-20 bg-white dark:bg-[#020817]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/20 via-cyan-300/10 to-transparent dark:from-blue-900/30 dark:via-cyan-900/20 dark:to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#1A69DD]/20 to-transparent rounded-full blur-3xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container relative z-10 mx-auto px-4"
        >
          <Card className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-sm border border-border shadow-2xl hover:shadow-blue-200/30 dark:hover:shadow-cyan-500/10 transition-shadow duration-300 ease-in-out max-w-3xl mx-auto overflow-hidden rounded-2xl">
            <div className="h-36 bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                className="absolute -bottom-16 left-8 w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#0F172A] shadow-md"
              >
                {userData.profileImage ? (
                  <Image
                    src={userData.profileImage}
                    alt="Profile pic"
                    width={128}
                    height={128}
                    className="object-cover"
                    unoptimized={true}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1A69DD] to-[#26A5E9] flex items-center justify-center text-4xl font-bold text-white">
                    {userData.instaId ? userData.instaId[0].toUpperCase() : "?"}
                  </div>
                )}
              </motion.div>
            </div>

            <CardContent className="pt-20 pb-10 px-8">
              <div className="flex flex-col md:flex-row items-start justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-1">
                    {userData.instaId}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Welcome back to your dashboard
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4">
                  <Button
                    onClick={onDelinkAccount}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Delink Instagram Account
                  </Button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid md:grid-cols-2 gap-8"
              >
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-100 dark:from-[#0F172A] dark:to-[#0C1220] border border-border shadow-sm transition-transform hover:scale-[1.01]">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Instagram className="h-4 w-4 mr-2 text-[#1A69DD]" />
                      <span className="font-semibold">Instagram ID</span>
                    </div>
                    <div className="text-base font-medium text-foreground">
                      {userData.instaId || "Not connected"}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-100 dark:from-[#0F172A] dark:to-[#0C1220] border border-border shadow-sm transition-transform hover:scale-[1.01]">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Hash className="h-4 w-4 mr-2 text-[#1A69DD]" />
                      <span className="font-semibold">Total Automations</span>
                    </div>
                    <div className="text-base font-medium text-foreground">
                      {userData.automationsCreated} automations created
                    </div>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};

export default ProfilePage;

// "use client";
// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Instagram, AlertCircle, Hash, Settings, User, Link2, Link2Off } from "lucide-react";
// import Image from "next/image";
// import { toast } from "sonner";
// import { useUserProfile } from "@/hooks/useUserProfile";

// // Custom Progress Bar Component (replacement for missing Progress)
// const Progress = ({ value, className = "" }) => {
//   return (
//     <div className={`w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 ${className}`}>
//       <div
//         className="bg-[#1A69DD] h-2 rounded-full"
//         style={{ width: `${value}%` }}
//       ></div>
//     </div>
//   );
// };

// // Custom Badge Component (replacement for missing Badge)
// const Badge = ({ children, variant = "default", className = "", ...props }) => {
//   const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

//   const variantClasses = {
//     default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
//     secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
//     destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
//     outline: "text-foreground",
//     success: "border-transparent bg-green-500 text-white hover:bg-green-500/80",
//   };

//   return (
//     <span
//       className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`}
//       {...props}
//     >
//       {children}
//     </span>
//   );
// };

// // Custom Tabs Components (replacement for missing Tabs)
// const Tabs = ({ children, defaultValue, className = "" }) => {
//   const [activeTab, setActiveTab] = React.useState(defaultValue);

//   return (
//     <div className={`flex flex-col ${className}`}>
//       {React.Children.map(children, (child) => {
//         if (child.type === TabsList) {
//           return React.cloneElement(child, { activeTab, setActiveTab });
//         }
//         if (child.type === TabsContent) {
//           return React.cloneElement(child, { activeTab });
//         }
//         return child;
//       })}
//     </div>
//   );
// };

// const TabsList = ({ children, activeTab, setActiveTab, className = "" }) => {
//   return (
//     <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>
//       {React.Children.map(children, (child) => {
//         if (child.type === TabsTrigger) {
//           return React.cloneElement(child, { activeTab, setActiveTab });
//         }
//         return child;
//       })}
//     </div>
//   );
// };

// const TabsTrigger = ({ children, value, activeTab, setActiveTab, className = "" }) => {
//   const isActive = activeTab === value;

//   return (
//     <button
//       className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
//         isActive ? "bg-background text-foreground shadow-sm" : "hover:text-foreground/80"
//       } ${className}`}
//       onClick={() => setActiveTab(value)}
//     >
//       {children}
//     </button>
//   );
// };

// const TabsContent = ({ children, value, activeTab, className = "" }) => {
//   if (activeTab !== value) return null;

//   return (
//     <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>
//       {children}
//     </div>
//   );
// };

// const ProfilePage = () => {
//   const { userData, isLoading, error, handleDelinkAccount } = useUserProfile();

//   const onDelinkAccount = () => {
//     toast("Are you sure you want to delink your Instagram account?", {
//       action: {
//         label: "Confirm",
//         onClick: () => {
//           const success = handleDelinkAccount();
//           if (success) {
//             toast.success("Instagram account delinked successfully");
//           }
//         },
//       },
//       cancel: {
//         label: "Cancel",
//       },
//     });
//   };

//   if (isLoading) {
//     return (
//       <main className="flex-1 flex flex-col items-center justify-center p-4">
//         <div className="w-full max-w-4xl mx-auto">
//           <div className="flex flex-col items-center justify-center space-y-4 text-center">
//             <div className="w-16 h-16 border-4 border-t-[#1A69DD] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
//             <h2 className="text-2xl font-bold text-foreground">Loading your profile</h2>
//             <p className="text-muted-foreground">We're getting everything ready for you</p>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   if (error) {
//     return (
//       <main className="flex-1 flex flex-col items-center justify-center p-4">
//         <div className="w-full max-w-4xl mx-auto">
//           <Card className="border-destructive">
//             <CardHeader>
//               <div className="flex flex-col items-center justify-center space-y-4 text-center">
//                 <AlertCircle className="w-12 h-12 text-destructive" />
//                 <CardTitle className="text-2xl font-bold text-destructive">
//                   Error loading profile
//                 </CardTitle>
//               </div>
//             </CardHeader>
//             <CardContent className="text-center text-muted-foreground">
//               {error}
//               <div className="mt-6">
//                 <Button variant="outline" onClick={() => window.location.reload()}>
//                   Try Again
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="flex-1">
//       <div className="relative overflow-hidden py-8 md:py-12">
//         {/* Background elements */}
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 to-transparent dark:from-[#0F172A] dark:to-[#090E1A]"></div>
//         <div className="absolute top-0 right-0 w-64 h-64 bg-[#1A69DD]/10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#26A5E9]/10 rounded-full blur-3xl"></div>

//         <div className="container relative z-10 mx-auto px-4 max-w-6xl">
//           {/* Profile Header */}
//           <div className="flex flex-col md:flex-row gap-8 mb-8">
//             <div className="w-full md:w-1/3">
//               <Card className="overflow-hidden border-border">
//                 <div className="relative h-40 bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
//                   <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg">
//                     {userData.profileImage ? (
//                       <Image
//                         src={userData.profileImage}
//                         alt="Profile picture"
//                         width={128}
//                         height={128}
//                         className="object-cover w-full h-full"
//                       />
//                     ) : (
//                       <div className="w-full h-full bg-gradient-to-br from-[#1A69DD] to-[#26A5E9] flex items-center justify-center text-4xl font-bold text-white">
//                         {userData.instaId ? userData.instaId[0].toUpperCase() : "?"}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <CardContent className="pt-20 pb-6 text-center">
//                   <h2 className="text-xl font-bold text-foreground mb-1">{userData.instaId}</h2>
//                   <p className="text-muted-foreground text-sm mb-4">Instagram Account</p>

//                   <div className="flex justify-center gap-2 mt-6">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="gap-2"
//                       onClick={onDelinkAccount}
//                     >
//                       <Link2Off className="h-4 w-4" />
//                       Delink Account
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             <div className="w-full md:w-2/3">
//               <Tabs defaultValue="overview" className="w-full">
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="overview">Overview</TabsTrigger>
//                   <TabsTrigger value="automations">Automations</TabsTrigger>
//                   <TabsTrigger value="settings">Settings</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="overview">
//                   <Card className="border-border">
//                     <CardHeader>
//                       <CardTitle>Account Overview</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div>
//                         <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
//                           <User className="h-4 w-4 text-[#1A69DD]" />
//                           Profile Information
//                         </h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div className="space-y-1">
//                             <p className="text-sm text-muted-foreground">Username</p>
//                             <div className="bg-muted/50 px-4 py-3 rounded-lg border border-border">
//                               {userData.instaId || "Not connected"}
//                             </div>
//                           </div>
//                           <div className="space-y-1">
//                             <p className="text-sm text-muted-foreground">Account Status</p>
//                             <div className="bg-muted/50 px-4 py-3 rounded-lg border border-border">
//                               <Badge variant="outline" className="border-green-500 text-green-500">
//                                 Connected
//                               </Badge>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div>
//                         <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
//                           <Hash className="h-4 w-4 text-[#1A69DD]" />
//                           Usage Statistics
//                         </h3>
//                         <div className="space-y-4">
//                           <div>
//                             <div className="flex justify-between text-sm text-muted-foreground mb-1">
//                               <span>Automation Limit</span>
//                               <span>{userData.automationsCreated} of 10 active</span>
//                             </div>
//                             <Progress
//                               value={(userData.automationsCreated / 10) * 100}
//                               className="h-2"
//                             />
//                           </div>
//                           <div className="grid grid-cols-2 gap-4">
//                             <Card className="border-border">
//                               <CardContent className="p-4">
//                                 <p className="text-sm text-muted-foreground">Active Automations</p>
//                                 <p className="text-2xl font-bold">{userData.automationsCreated}</p>
//                               </CardContent>
//                             </Card>
//                             <Card className="border-border">
//                               <CardContent className="p-4">
//                                 <p className="text-sm text-muted-foreground">Messages Processed</p>
//                                 <p className="text-2xl font-bold">1,248</p>
//                               </CardContent>
//                             </Card>
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="automations">
//                   <Card className="border-border">
//                     <CardHeader>
//                       <CardTitle>Your Automations</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed border-border">
//                         <p className="text-muted-foreground">No automations created yet</p>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="settings">
//                   <Card className="border-border">
//                     <CardHeader>
//                       <CardTitle>Account Settings</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed border-border">
//                         <p className="text-muted-foreground">Account settings will appear here</p>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// };

// export default ProfilePage;
