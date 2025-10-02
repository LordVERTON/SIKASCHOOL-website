"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import ThemeToggler from "./ThemeToggler";
import getMenuData from "./menuData";
import { useLanguage } from "@/context/LanguageContext";

const Header = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [dropdownToggler, setDropdownToggler] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const { t } = useLanguage();
  // Removed NextAuth session - using custom auth

  const pathUrl = usePathname();

  const openLeadModal = () => {
    try {
      // Fire a custom event listened by Hero to open the lead modal
      window.dispatchEvent(new CustomEvent('lead:open'));
    } catch {}
  };

  // Function to close mobile menu when a link is clicked
  const handleMenuClose = () => {
    setNavigationOpen(false);
    setDropdownToggler(false);
  };

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (navigationOpen && !target.closest('.navbar') && !target.closest('button[aria-label="hamburger Toggler"]')) {
        handleMenuClose();
      }
    };

    // Close menu on scroll
    const handleScroll = () => {
      if (navigationOpen) {
        handleMenuClose();
      }
    };

    // Close on Escape
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && navigationOpen) {
        handleMenuClose();
      }
    };

    // Lock body scroll when open
    if (navigationOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    if (navigationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('keydown', handleKeydown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    };
  }, [navigationOpen]);

  // Close menu on route change
  useEffect(() => {
    handleMenuClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathUrl]);

  return (
    <header
      className={`fixed left-0 top-0 z-99999 w-full py-7 ${
        stickyMenu
          ? "bg-white py-4! shadow-sm transition duration-100 dark:bg-black"
          : ""
      }`}
    >
      <div className="relative mx-auto max-w-c-1390 items-center justify-between px-4 md:px-8 xl:flex 2xl:px-0">
        <div className="flex w-full items-center justify-between xl:w-1/4">
          <Link href="/">
            <Image
              src="/images/logo/logo-dark.svg"
              alt="logo"
              width={170}
              height={50}
              className="hidden w-full dark:block"
            />
            <Image
              src="/images/logo/logo-light.svg"
              alt="logo"
              width={170}
              height={50}
              className="w-full dark:hidden"
            />
          </Link>

          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-label="hamburger Toggler"
            className="block xl:hidden"
            onClick={() => setNavigationOpen(!navigationOpen)}
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="absolute right-0 block h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 rounded-sm bg-black delay-0 duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "w-full! delay-300" : "w-0"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "delay-400 w-full!" : "w-0"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "w-full! delay-500" : "w-0"
                  }`}
                ></span>
              </span>
              <span className="du-block absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "h-0! delay-0" : "h-full"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "h-0! delay-200" : "h-0.5"
                  }`}
                ></span>
              </span>
            </span>
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}
        </div>

        {/* Nav Menu Start */}
        <div
          className={`w-full xl:flex xl:h-auto xl:w-full xl:items-center xl:justify-between ${
            navigationOpen ? "" : ""
          }`}
        >
          {/* Mobile overlay and animated panel */}
          <div className={`fixed inset-0 z-50 xl:hidden ${navigationOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            {/* Backdrop */}
            <div
              className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${navigationOpen ? "opacity-100" : "opacity-0"}`}
              onClick={handleMenuClose}
            />
            {/* Sliding left drawer */}
            <div
              className={`navbar absolute left-0 top-0 z-10 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-7.5 shadow-solid-5 transition-transform duration-300 ease-out dark:bg-blacksection ${navigationOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-base font-semibold text-black dark:text-white">Menu</span>
                <button
                  aria-label="Fermer le menu"
                  onClick={handleMenuClose}
                  className="text-waterloo hover:text-black dark:text-manatee dark:hover:text-white"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <nav>
                <ul className="flex flex-col gap-5">
                  {getMenuData(t).map((menuItem, key) => (
                    <li key={key} className={menuItem.submenu && "group relative"}>
                      {menuItem.submenu ? (
                        <>
                          <button
                            onClick={() => setDropdownToggler(!dropdownToggler)}
                            className="flex cursor-pointer items-center justify-between gap-3 hover:text-primary"
                          >
                            {menuItem.title}
                            <span>
                              <svg
                                className="h-3 w-3 cursor-pointer fill-waterloo group-hover:fill-primary"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                              >
                                <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                              </svg>
                            </span>
                          </button>

                          <ul className={`dropdown ${dropdownToggler ? "flex" : ""}`}>
                            {menuItem.submenu.map((item, key) => (
                              <li key={key} className="hover:text-primary">
                                <Link href={item.path || "#"} onClick={handleMenuClose}>
                                  {item.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <Link
                          href={`${menuItem.path}`}
                          className={
                            pathUrl === menuItem.path
                              ? "text-primary hover:text-primary"
                              : "hover:text-primary"
                          }
                          onClick={handleMenuClose}
                        >
                          {menuItem.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-7 flex items-center gap-6">
                <ThemeToggler />
                <Link
                  href="/auth/signin"
                  className="text-regular font-medium text-waterloo hover:text-primary"
                  onClick={handleMenuClose}
                >
                  {t.nav.signIn}
                </Link>
                <button
                  onClick={() => { openLeadModal(); handleMenuClose(); }}
                  className="flex items-center justify-center rounded-full bg-primary px-7.5 py-2.5 text-regular text-white duration-300 ease-in-out hover:bg-primaryho"
                >
                  {t.hero.reserveButton}
                </button>
              </div>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden w-full items-center justify-between xl:flex">
            <nav>
              <ul className="flex flex-col gap-5 xl:flex-row xl:items-center xl:gap-10">
                {getMenuData(t).map((menuItem, key) => (
                  <li key={key} className={menuItem.submenu && "group relative"}>
                    {menuItem.submenu ? (
                      <>
                        <button
                          onClick={() => setDropdownToggler(!dropdownToggler)}
                          className="flex cursor-pointer items-center justify-between gap-3 hover:text-primary"
                        >
                          {menuItem.title}
                          <span>
                            <svg
                              className="h-3 w-3 cursor-pointer fill-waterloo group-hover:fill-primary"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                            >
                              <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                            </svg>
                          </span>
                        </button>

                        <ul className={`dropdown ${dropdownToggler ? "flex" : ""}`}>
                          {menuItem.submenu.map((item, key) => (
                            <li key={key} className="hover:text-primary">
                              <Link href={item.path || "#"} onClick={handleMenuClose}>
                                {item.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link
                        href={`${menuItem.path}`}
                        className={
                          pathUrl === menuItem.path
                            ? "text-primary hover:text-primary"
                            : "hover:text-primary"
                        }
                        onClick={handleMenuClose}
                      >
                        {menuItem.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-0 flex items-center gap-6">
              <ThemeToggler />
              <Link
                href="/auth/signin"
                className="text-regular font-medium text-waterloo hover:text-primary"
                onClick={handleMenuClose}
              >
                {t.nav.signIn}
              </Link>
              <button
                onClick={() => { openLeadModal(); handleMenuClose(); }}
                className="flex items-center justify-center rounded-full bg-primary px-7.5 py-2.5 text-regular text-white duration-300 ease-in-out hover:bg-primaryho"
              >
                {t.hero.reserveButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// w-full delay-300

export default Header;
