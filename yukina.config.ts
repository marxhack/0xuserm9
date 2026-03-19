import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const YukinaConfig: Configuration = {
  title: "\n 0xuserm9 | Blog ",
  subTitle: "Welcome To My Blog",
  brandTitle: "",

  description: "Welcome To My Blog",

  site: "https://0xuserm9.vercel.app",
  locale: "en", // set for website language and date format

  navigators: [
    {
      nameKey: I18nKeys.nav_bar_home,
      href: "/",
    },
    {
      nameKey: I18nKeys.nav_bar_archive,
      href: "/archive",
    },
    {
      nameKey: I18nKeys.nav_bar_about,
      href: "/about",
    },
    {
      nameKey: I18nKeys.nav_bar_github,
      href: "",
    },
  ],

  username: "Merouane Youcefi",
  sign: "Security Researcher",
  avatarUrl: "https://i.pinimg.com/1200x/0b/20/5e/0b205e4d88386fa700abcb007b20cfe1.jpg",
  socialLinks: [
    {
      icon: "line-md:linkedin",
      link: "https://www.linkedin.com/in/merouane-youcefi-44b44a284/",
    },
    {
      icon: "line-md:twitter-x",
      link: "https://x.com/MaroineYoucefi",
    },
    {
      icon: "line-md:email",
      link: "",
    },
  ],
  maxSidebarCategoryChip: 6, // It is recommended to set it to a common multiple of 2 and 3
  maxSidebarTagChip: 12,
  maxFooterCategoryChip: 6,
  maxFooterTagChip: 24,

  banners: [
    "https://0xuserm9.vercel.app/images/nex/nex.png",
    "https://0xuserm9.vercel.app/images/bankk/UTCTF.png",
    "https://www.tripwire.com/sites/default/files/CTF.jpg",
  ],

  slugMode: "RAW", // 'RAW' | 'HASH'

  license: {
    name: "",
    url: "",
  },

  // WIP functions
  bannerStyle: "LOOP", // 'loop' | 'static' | 'hidden'
};

export default YukinaConfig;
