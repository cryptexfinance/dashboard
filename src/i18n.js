import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  // load translation using http -> see /public/locales
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  .use(LanguageDetector)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: "en",
    detection: {
      order: [
        "localStorage",
        "navigator",
        "sessionStorage",
        "querystring",
        "cookie",
        "htmlTag",
        "path",
        "subdomain",
      ],
      // keys or params to lookup language from
      lookupCookie: "language",
      lookupLocalStorage: "language",
      lookupSessionStorage: "language",
      caches: ["localStorage", "cookie"],
    },
    debug: false,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
