import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const YukinaConfig: Configuration = {
  title: "0xuserm9",
  subTitle: "Merouane Youcefi Demo Blog",
  brandTitle: "0xuserm9",

  description: "Demo Blog",

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
      href: "https://github.com/WhitePaper233/yukina",
    },
  ],

  username: "Merouane Youcefi",
  sign: "Hi There!",
  avatarUrl: "https://s2.loli.net/2025/01/25/FPpTrQSezM8ivbl.webp",
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
      link: "maroineyoucefi@gmail.com",
    },
  ],
  maxSidebarCategoryChip: 6, // It is recommended to set it to a common multiple of 2 and 3
  maxSidebarTagChip: 12,
  maxFooterCategoryChip: 6,
  maxFooterTagChip: 24,

  banners: [
    "https://www.tripwire.com/sites/default/files/CTF.jpg",
    "https://cdn.nulab.com/learn-wp/app/uploads/2019/05/14210442/Nulab-Capture-the-Flag-CTF-Challenge-Blog.png",
    "https://s2.loli.net/2025/01/25/njNVtuUMzxs81RI.webp",
    "https://s2.loli.net/2025/01/25/tozsJ8QHAjFN3Mm.webp",
    "https://s2.loli.net/2025/01/25/Pm89OveZq7NWUxF.webp",
    "https://s2.loli.net/2025/01/25/UCYKvc1ZhgPHB9m.webp",
    "https://s2.loli.net/2025/01/25/JjpLOW8VSmufzlA.webp",
  ],

  slugMode: "HASH", // 'RAW' | 'HASH'

  license: {
    name: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },

  // WIP functions
  bannerStyle: "LOOP", // 'loop' | 'static' | 'hidden'
};

export default YukinaConfig;
