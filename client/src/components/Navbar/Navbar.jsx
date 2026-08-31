import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import styles from "./Navbar.module.css";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Skills", href: "/skills" },
    { name: "Blog", href: "/blog" },
    { name: "Full Cv", href: "/cv" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoText}>
            <Link to={navItems[0].href}>OMΛR</Link>
          </span>
          <span className={styles.logoDot}>.</span>
        </div>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          {navItems.map((item, index) => (
            <Link key={index} to={item.href} className={`${styles.navLink} ${location.pathname === item.href ? styles.active : ""}`}>
              {item.name}
            </Link>
          ))}
        </div>

        {/* CTA Button + Theme Toggle */}
        <div className={styles.ctaContainer}>
          <ThemeToggle />
          <Link to="/contact" className={styles.ctaButton}>
            Let's Talk
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className={styles.mobileActions}>
          <ThemeToggle />
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`${styles.mobileNav} ${
          isMenuOpen ? styles.mobileNavOpen : ""
        }`}
      >
        <div className={styles.mobileNavContent}>
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`${styles.mobileNavLink} ${location.pathname === item.href ? styles.active : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            to="/contact"
            className={styles.mobileCtaButton}
            onClick={() => setIsMenuOpen(false)}
          >
            Let's Talk
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
