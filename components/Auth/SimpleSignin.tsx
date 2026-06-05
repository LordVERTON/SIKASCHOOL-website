"use client";

import { useEffect, useState, type SVGProps } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getStorageItem, removeStorageItem, STORAGE_KEYS } from "@/lib/storage";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { toast } from "react-hot-toast";
import { supabaseBrowser } from "@/lib/supabase-browser";

const EyeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6Z" />
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
  </svg>
);

const EyeOffIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12s3.75 6 9.75 6c1.757 0 3.306-.37 4.636-.963" />
    <path d="M6.228 6.228A10.45 10.45 0 0 1 12 6c6 0 9.75 6 9.75 6a10.48 10.48 0 0 1-1.223 1.944" />
    <path d="M15 12a3 3 0 0 1-4.5 2.598" />
    <path d="M3 3l18 18" />
  </svg>
);

export default function SimpleSignin() {
  const [data, setData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    accountType: "STUDENT" as "STUDENT" | "PARENT",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorTicket, setTwoFactorTicket] = useState<string | null>(null);
  const [twoFactorInfo, setTwoFactorInfo] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setData((prev) => ({ ...prev, email: emailParam }));
      removeStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL);
      return;
    }

    const storedEmail = getStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL);
    if (storedEmail) {
      setData((prev) => ({ ...prev, email: storedEmail }));
      removeStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let response;
      let supabaseCredentials: { email: string; password: string } | null = null;

      if (isSignup) {
        // Inscription
        if (!data.firstName || !data.lastName) {
          setError('Prénom et nom requis pour l\'inscription');
          return;
        }
        if (!data.email.trim()) {
          setError("L’e-mail est requis");
          return;
        }
        if (!data.password) {
          setError('Le mot de passe est requis');
          return;
        }
        if (data.password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          return;
        }
        // Validation simple du téléphone (optionnelle)
        if (!data.phone || data.phone.replace(/\D/g, '').length < 8) {
          setError('Numéro de téléphone invalide');
          return;
        }

        const signupEmail = data.email.trim().toLowerCase();
        const signupPassword = data.password;
        supabaseCredentials = { email: signupEmail, password: signupPassword };

        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: signupEmail,
            password: signupPassword,
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phone: data.phone.trim(),
            role: data.accountType
          }),
        });
      } else {
        if (twoFactorRequired) {
          if (!twoFactorCode || twoFactorCode.trim().length !== 6 || !twoFactorTicket) {
            setError("Entrez le code SMS à 6 chiffres.");
            setIsLoading(false);
            return;
          }
        }
        // Connexion
        supabaseCredentials = {
          email: data.email.trim().toLowerCase(),
          password: data.password,
        };
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            twoFactorCode: twoFactorRequired ? twoFactorCode : undefined,
            twoFactorTicket: twoFactorRequired ? twoFactorTicket : undefined,
          }),
        });
      }

      const result = await response.json();

      if (response.status === 202 && result?.requiresTwoFactor) {
        setTwoFactorRequired(true);
        setTwoFactorTicket(result.twoFactorTicket ?? null);
        setTwoFactorInfo(typeof result.message === "string" ? result.message : "Code SMS envoyé.");
        setError("");
        return;
      }

      if (!response.ok) {
        setError(result.error || (isSignup ? 'Erreur d\'inscription' : 'Erreur de connexion'));
        return;
      }

      if (result.success) {
        if (supabaseCredentials) {
          const { error: sbAuthErr } = await supabaseBrowser.auth.signInWithPassword(supabaseCredentials);
          if (sbAuthErr) {
            console.warn("[signin] Session Supabase (Realtime):", sbAuthErr.message);
          }
        }
        if (typeof window !== "undefined") {
          try {
            Object.keys(sessionStorage)
              .filter((k) => k.startsWith("sika:notif-popup-shown"))
              .forEach((k) => sessionStorage.removeItem(k));
          } catch {
            // ignore
          }
        }
        if (isSignup && typeof result.message === "string" && result.message.trim()) {
          toast.success(result.message.trim());
        }
        // Rediriger vers l'espace approprié selon le rôle
        switch (result.user.role) {
          case 'TUTOR':
            router.push('/tutor');
            break;
          case 'STUDENT':
            router.push('/student');
            break;
          case 'PARENT':
            router.push('/family');
            break;
          case 'ADMIN':
            router.push('/tutor'); // Les admins accèdent à l'espace tuteur avec administration
            break;
          default:
            router.push('/');
        }
        router.refresh();
      }
    } catch (error) {
      console.error(isSignup ? 'Erreur d\'inscription:' : 'Erreur de connexion:', error);
      setError(`Une erreur est survenue lors de ${isSignup ? 'l\'inscription' : 'la connexion'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* <!-- ===== SignIn Form Start ===== --> */}
      <section className="pb-12.5 pt-32.5 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
        <div className="relative z-1 mx-auto max-w-c-1016 px-7.5 pb-7.5 pt-10 lg:px-15 lg:pt-15 xl:px-20 xl:pt-20">
          <div className="absolute left-0 top-0 -z-1 h-2/3 w-full rounded-lg bg-linear-to-t from-transparent to-[#dee7ff47] dark:bg-linear-to-t dark:to-[#252A42]"></div>
          <div className="absolute bottom-17.5 left-0 -z-1 h-1/3 w-full">
            <Image
              src="/images/shape/shape-dotted-light.svg"
              alt="Dotted"
              width={100}
              height={100}
              className="dark:hidden"
            />
            <Image
              src="/images/shape/shape-dotted-dark.svg"
              alt="Dotted"
              width={100}
              height={100}
              className="hidden dark:block"
            />
          </div>

          <div className="animate_top rounded-lg bg-white px-7.5 pt-7.5 shadow-solid-8 dark:border dark:border-strokedark dark:bg-black xl:px-15 xl:pt-15">
            <h2 className="mb-15 text-center text-3xl font-semibold text-black dark:text-white xl:text-sectiontitle2">
              {isSignup ? 'Inscription' : 'Connexion'}
            </h2>
            
            {/* Bouton de basculement */}
            <div className="mb-7.5 flex justify-center">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(false);
                    setTwoFactorRequired(false);
                    setTwoFactorCode("");
                    setTwoFactorTicket(null);
                    setTwoFactorInfo(null);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    !isSignup 
                      ? 'bg-white text-black shadow-sm dark:bg-gray-700 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(true);
                    setTwoFactorRequired(false);
                    setTwoFactorCode("");
                    setTwoFactorTicket(null);
                    setTwoFactorInfo(null);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isSignup 
                      ? 'bg-white text-black shadow-sm dark:bg-gray-700 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Inscription
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {isSignup && (
                <div className="mb-7.5 flex flex-col gap-7.5 lg:mb-12.5 lg:flex-row lg:justify-between lg:gap-14">
                  <input
                    type="text"
                    placeholder="Votre prénom"
                    name="firstName"
                    value={data.firstName}
                    onChange={(e) => setData({ ...data, firstName: e.target.value })}
                    required={isSignup}
                    className="w-full border-b border-stroke bg-white! pb-3.5 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:bg-black! dark:focus:border-manatee dark:focus:placeholder:text-white lg:w-1/2"
                  />

                  <input
                    type="text"
                    placeholder="Votre nom"
                    name="lastName"
                    value={data.lastName}
                    onChange={(e) => setData({ ...data, lastName: e.target.value })}
                    required={isSignup}
                    className="w-full border-b border-stroke bg-white! pb-3.5 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:bg-black! dark:focus:border-manatee dark:focus:placeholder:text-white lg:w-1/2"
                  />
                </div>
              )}

              {isSignup && (
                <div className="mb-7.5 space-y-7.5">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Vous êtes
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { value: "STUDENT", label: "Élève" },
                        { value: "PARENT", label: "Parent" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                            data.accountType === option.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-waterloo hover:border-primary/40 dark:border-strokedark dark:text-manatee"
                          }`}
                        >
                          <input
                            type="radio"
                            name="accountType"
                            value={option.value}
                            checked={data.accountType === option.value}
                            onChange={(e) =>
                              setData({ ...data, accountType: e.target.value as "STUDENT" | "PARENT" })
                            }
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <input
                    type="tel"
                    placeholder="Votre numéro de téléphone"
                    name="phone"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    required={isSignup}
                    className="w-full border-b border-stroke bg-white! pb-3.5 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:bg-black! dark:focus:border-manatee dark:focus:placeholder:text-white"
                  />
                </div>
              )}

              <div className="mb-7.5 flex flex-col gap-7.5 lg:mb-12.5 lg:flex-row lg:justify-between lg:gap-14">
                <input
                  type="email"
                  placeholder="Votre e-mail"
                  name="email"
                  autoComplete="email"
                  data-protonpass-ignore="true"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  required
                  className="w-full border-b border-stroke bg-white! pb-3.5 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:bg-black! dark:focus:border-manatee dark:focus:placeholder:text-white lg:w-1/2"
                />

                <div className="relative w-full lg:w-1/2">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    name="password"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    data-protonpass-ignore="true"
                    value={data.password}
                    onChange={(e) =>
                      setData({ ...data, password: e.target.value })
                    }
                    required
                    className="w-full border-b border-stroke bg-white! pb-3.5 pr-10 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:bg-black! dark:focus:border-manatee dark:focus:placeholder:text-white"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-waterloo transition hover:text-primary dark:text-manatee"
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-5 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}
              {!isSignup && twoFactorRequired && (
                <div className="mb-5 space-y-3">
                  {twoFactorInfo && (
                    <div className="text-center text-xs text-waterloo dark:text-manatee">{twoFactorInfo}</div>
                  )}
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Code SMS (6 chiffres)"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full border-b border-stroke bg-white! pb-3.5 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:bg-black! dark:focus:border-manatee dark:focus:placeholder:text-white"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoading(true);
                      setError("");
                      try {
                        const resp = await fetch('/api/auth/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: data.email,
                            password: data.password,
                          }),
                        });
                        const payload = await resp.json().catch(() => ({}));
                        if (resp.status === 202 && payload?.requiresTwoFactor) {
                          setTwoFactorTicket(payload.twoFactorTicket ?? null);
                          setTwoFactorInfo(typeof payload.message === "string" ? payload.message : "Code SMS renvoyé.");
                        } else if (!resp.ok) {
                          setError(payload.error || "Échec du renvoi du code.");
                        }
                      } catch {
                        setError("Erreur réseau lors du renvoi du code.");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Renvoyer le code
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-10 md:justify-between xl:gap-15">
                <div className="flex flex-wrap gap-4 md:gap-10">
                  <div className="mb-4 flex items-center">
                    <input
                      id="default-checkbox"
                      type="checkbox"
                      className="peer sr-only"
                    />
                    <span className="border-gray-300 bg-gray-100 text-blue-600 dark:border-gray-600 dark:bg-gray-700 group mt-1 flex h-5 min-w-[20px] items-center justify-center rounded-sm peer-checked:bg-primary">
                      <svg
                        className="opacity-0 in-[.group]:peer-checked:opacity-100"
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.70704 0.792787C9.89451 0.980314 9.99983 1.23462 9.99983 1.49979C9.99983 1.76495 9.89451 2.01926 9.70704 2.20679L4.70704 7.20679C4.51951 7.39426 4.26521 7.49957 4.00004 7.49957C3.73488 7.49957 3.48057 7.39426 3.29304 7.20679L0.293041 4.20679C0.110883 4.01818 0.0100885 3.76558 0.0123669 3.50339C0.0146453 3.24119 0.119814 2.99038 0.305222 2.80497C0.490631 2.61956 0.741443 2.51439 1.00364 2.51211C1.26584 2.50983 1.51844 2.61063 1.70704 2.79279L4.00004 5.08579L8.29304 0.792787C8.48057 0.605316 8.73488 0.5 9.00004 0.5C9.26521 0.5 9.51951 0.605316 9.70704 0.792787Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                    <label
                      htmlFor="default-checkbox"
                      className="flex max-w-[425px] cursor-pointer select-none pl-3"
                    >
                      Se souvenir de moi
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="hover:text-primary text-left"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2.5 rounded-full bg-black px-6 py-3 font-medium text-white duration-300 ease-in-out hover:bg-blackho dark:bg-btndark dark:hover:bg-blackho disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (isSignup ? "Inscription..." : "Connexion...") : (isSignup ? "S'inscrire" : "Connexion")}
                  <svg
                    className="fill-white"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.4767 6.16664L6.00668 1.69664L7.18501 0.518311L13.6667 6.99998L7.18501 13.4816L6.00668 12.3033L10.4767 7.83331H0.333344V6.16664H10.4767Z"
                      fill=""
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-12.5 border-t border-stroke py-5 text-center dark:border-strokedark">
                <p className="text-gray-600 dark:text-gray-400">
                  {isSignup 
                    ? 'Déjà un compte ? Utilisez l\'onglet "Connexion" ci-dessus'
                    : 'Nouveau sur SikaSchool ? Utilisez l\'onglet "Inscription" ci-dessus'
                  }
                </p>
              </div>

            </form>
          </div>
        </div>
      </section>
      {/* <!-- ===== SignIn Form End ===== --> */}
      
      <ForgotPasswordModal 
        isOpen={showForgotPasswordModal} 
        onClose={() => setShowForgotPasswordModal(false)}
        initialEmail={data.email}
      />
    </>
  );
}
