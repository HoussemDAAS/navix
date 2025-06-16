"use client";

import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import {
  PiFacebookLogo,
  PiInstagramLogo,
  PiLinkedinLogo,
  PiTwitterLogo,
} from "react-icons/pi";
import { useTranslations } from "../../hooks/useTranslations";
import { Link } from "@/i18n/routing";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const { t, locale } = useTranslations();
  const isRTL = locale === "ar";

  const mainLinks = [
    { name: t("Navigation.projects"), href: "/projects" },
    { name: t("Navigation.services"), href: "/services" },

    { name: "Clients", href: "/projects" },
    { name: t("Navigation.about"), href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: t("Footer.privacy"), href: "#" },
    { name: t("Footer.terms"), href: "#" },
    { name: t("Footer.sitemap"), href: "#" },
  ];

  const socialLinks = [
    { icon: PiFacebookLogo, href: "https://facebook.com/navixagency" },
    { icon: PiInstagramLogo, href: "https://instagram.com/navix.agency" },
    { icon: PiLinkedinLogo, href: "https://linkedin.com/company/navix-agency" },
    { icon: PiTwitterLogo, href: "https://twitter.com/navixagency" },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      // Here you would typically make an API call to your backend
      setSubscriptionStatus("success");
      setEmail("");
      setTimeout(() => setSubscriptionStatus(""), 3000);
    }
  };

  return (
    <footer
      className="py-10 md:py-16 md:mt-20 px-6 2xl:w-4/5 md:mx-auto md:px-16"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Separator className="mb-12" />
      <div className="mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* left side */}
          <div className={isRTL ? "text-right" : "text-left"}>
            <h2 className="text-4xl font-bold mb-4">
              {t("Footer.letsTalk")}
            </h2>
            <Link
              href="mailto:contact@navixagency.tech"
              className="text-xl hover:underline inline-block mb-8"
            >
              contact@navixagency.tech
            </Link>
            <p className="text-gray-600">
              Manzel Jemil, Bizerte
              <br />
              Azib, Bizerte
            </p>
          </div>

          {/* Middle - Navigation */}
          <div className="grid grid-cols-2 gap-8">
            <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
              {mainLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-[#7b7b7b] hover:underline"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
              {mainLinks.slice(3).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-[#7b7b7b] hover:underline"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Newsletter */}
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="text-lg font-semibold mb-4">
              {t("Footer.newsletter")}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("Footer.emailPlaceholder")}
                  className={`w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 
                  focus:ring-black focus:border-transparent ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                  required
                />
                <button
                  type="submit"
                  className="mt-2 w-full bg-black
                   text-white px-4 py-2  hover:bg-lochmara-500-800 transition-colors duration-200"
                >
                  {t("Footer.subscribe")}
                </button>
              </div>
              {subscriptionStatus === "success" && (
                <p className="text-black text-sm">
                  {t("Footer.subscribeSuccess")}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div
          className={`flex flex-col md:flex-row ${
            isRTL ? "md:flex-row-reverse" : ""
          } justify-between items-start md:items-center pt-8 border-t border-gray-200`}
        >
          {/* Legal links */}
          <div
            className={`flex gap-6 mb-4 md:mb-0 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[#7b7b7b] hover:underline text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Social links */}
          <div
            className={`flex gap-6 mb-4 md:mb-0 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  href={link.href}
                  className="text-[#7b7b7b] hover:text-gray-900"
                >
                  <Icon size={20} />
                </Link>
              );
            })}
          </div>

          {/* Copyright */}
          <div
            className={`text-[#7b7b7b] text-sm ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            © 2025 Navix, Inc
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;