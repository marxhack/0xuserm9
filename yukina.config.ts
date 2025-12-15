import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const YukinaConfig: Configuration = {
  title: "\n 0xuserm9 | Blog ",
  subTitle: "Merouane Youcefi Demo Blog",
  brandTitle: "",

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
  avatarUrl: "https://i.pinimg.com/1200x/33/6f/b7/336fb7aa53941f2c4e9dd1c5f3708e00.jpg",
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
      link: "mailto:maroineyoucefi@gmail.com",
    },
  ],
  maxSidebarCategoryChip: 6, // It is recommended to set it to a common multiple of 2 and 3
  maxSidebarTagChip: 12,
  maxFooterCategoryChip: 6,
  maxFooterTagChip: 24,

  banners: [
    "https://interoperable-europe.ec.europa.eu/sites/default/files/styles/wysiwyg_full_width/public/inline-images/BugBounty.png?itok=Z322FJ3w",
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
