import React, { useState, useEffect } from "react";
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Heart,
  Facebook,
  Instagram,
  Youtube,
  Twitch,
  Globe,
  MessageCircle,
  Send,
  Palette,
  Briefcase,
  Zap,
  Music,
  Camera,
  Video,
  Users,
  Share2,
} from "lucide-react";
import styles from "./Footer.module.css";
import { Link } from "react-router-dom";
import { Backend_Root_Url } from "../../config/AdminUrl.js";
import iconMap from "../../lib/iconMap.js";

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  // Fetch data from API
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const API_ENDPOINT = `${Backend_Root_Url}/api/home/main/data`;
        const response = await fetch(API_ENDPOINT);
        const data = await response.json();
        setFooterData(data);
      } catch (error) {
        console.error("Error fetching footer data:", error);
        setFooterData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  // Static fallback data
  const staticSocialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "mailto:contact@portfolio.com", label: "Email" },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: "Skills", href: "/skills" },
    { name: "CV", href: "/cv" },
    { name: "Contact", href: "/contact" },
  ];

  // Get dynamic data or fallback to static
  const footerInfo = footerData?.FooterInfo || {
    FooterTitle: "Portfolio",
    FooterDescription:
      "Crafting digital experiences with passion and precision. Let's build something amazing together.",
    OwnerEmail: "",
    OwnerPhone: "",
    OwnerAddress: "EGYPT, EG",
  };

  const socialLinks =
    footerData?.footersociallinks?.FooterSocialLinks?.map((link) => {
      const IconComponent = iconMap[link.SocialIcon] || Mail;
      return {
        icon: IconComponent,
        href: link.SocialLink,
        label: link.SocialIcon,
      };
    }) || staticSocialLinks;

  const contactInfo = [
    {
      icon: Mail,
      text: footerInfo.OwnerEmail,
      href: `mailto:${footerInfo.OwnerEmail}`,
    },
    {
      icon: Phone,
      text: footerInfo.OwnerPhone,
      href: `tel:${footerInfo.OwnerPhone}`,
    },
    {
      icon: MapPin,
      text: footerInfo.OwnerAddress,
      href: `https://www.google.com/maps/search/${footerInfo.OwnerAddress}`,
    },
  ].filter((c) => c.text);

  if (loading) {
    return (
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.loadingSpinner} />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.footerContent}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <span className={styles.logoText}>{footerInfo.FooterTitle}</span>
              <span className={styles.logoDot}>.</span>
            </div>
            <p className={styles.brandDescription}>
              {footerInfo.FooterDescription}
            </p>
            <div className={styles.socialLinks}>
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className={styles.socialLink}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconComponent size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.linksList}>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className={styles.footerLink}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>Get In Touch</h3>
            <div className={styles.contactList}>
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <a
                    key={index}
                    href={contact.href}
                    target="_blank"
                    className={styles.contactItem}
                  >
                    <IconComponent size={18} />
                    <span>{contact.text}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletterSection}>
            <h3 className={styles.sectionTitle}>Let’s Work Together</h3>
            <p className={styles.newsletterDescription}>
              I’m always excited to explore new opportunities, collaborations,
              and challenges. Feel free to reach out if you think we could work
              together.
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>
              © {currentYear} {footerInfo.FooterTitle}. All rights reserved.
            </p>
          </div>
          <div className={styles.madeWith}>
            <p>
              Made By <Heart size={16} className={styles.heartIcon} />
              <a href="https://github.com/omarmohamed-909" target="_blank" rel="noopener noreferrer">
                Omar
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
