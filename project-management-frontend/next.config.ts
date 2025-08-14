/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co", // <-- এই ডোমেইনটি যোগ করা আবশ্যক
        port: "",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "images.unsplash.com", // Unsplash-এর জন্য
        port: "",
        pathname: "/**",
      },

      // দ্রষ্টব্য: 'sazzadur-rahman2.imgbb.com' এবং 'ibb.co.com' ভুল ডোমেইন,
      // এগুলো কোনো ইমেজ হোস্ট করে না, তাই এগুলোকে এখানে যোগ করার প্রয়োজন নেই।
    ],
  },
};

export default nextConfig;
