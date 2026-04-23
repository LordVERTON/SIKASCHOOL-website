"use client";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, type SVGProps } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

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
const Signup = () => {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!data.firstName.trim()) {
      toast.error('Le prénom est requis');
      return;
    }
    
    if (!data.lastName.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    
    if (!data.email.trim()) {
      toast.error('L’e-mail est requis');
      return;
    }
    
    if (!data.password.trim()) {
      toast.error('Le mot de passe est requis');
      return;
    }
    
    if (data.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        const msg =
          typeof result.message === 'string' && result.message.trim()
            ? result.message.trim()
            : 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.';
        toast.success(msg);
        // Rediriger vers la page de connexion
        router.push('/auth/signin');
      } else {
        toast.error(result.error || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <!-- ===== SignUp Form Start ===== --> */}
      <section className="pb-12.5 pt-32.5 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
        <div className="relative z-1 mx-auto max-w-c-1016 px-7.5 pb-7.5 pt-10 lg:px-15 lg:pt-15 xl:px-20 xl:pt-20">
          <div className="absolute left-0 top-0 -z-1 h-2/3 w-full rounded-lg bg-linear-to-t from-transparent to-[#dee7ff47] dark:bg-linear-to-t dark:to-[#252A42]"></div>
          <div className="absolute bottom-17.5 left-0 -z-1 h-1/3 w-full">
            <Image
              src="/images/shape/shape-dotted-light.svg"
              alt="Dotted"
              className="dark:hidden"
              fill
            />
            <Image
              src="/images/shape/shape-dotted-dark.svg"
              alt="Dotted"
              className="hidden dark:block"
              fill
            />
          </div>

          <motion.div
            variants={{
              hidden: {
                opacity: 0,
                y: -20,
              },

              visible: {
                opacity: 1,
                y: 0,
              },
            }}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 1, delay: 0.1 }}
            viewport={{ once: true }}
            className="animate_top rounded-lg bg-white px-7.5 pt-7.5 shadow-solid-8 dark:border dark:border-strokedark dark:bg-black xl:px-15 xl:pt-15"
          >
            <h2 className="mb-15 text-center text-3xl font-semibold text-black dark:text-white xl:text-sectiontitle2">
              {t.auth.signup?.title}
            </h2>


            <form onSubmit={handleSubmit}>
              <div className="mb-7.5 flex flex-col gap-7.5 lg:mb-12.5 lg:flex-row lg:justify-between lg:gap-14">
                <input
                  name="firstName"
                  type="text"
                  placeholder={t.auth.signup?.firstNamePlaceholder || "First name"}
                  value={data.firstName}
                  onChange={(e) =>
                    setData({ ...data, [e.target.name]: e.target.value })
                  }
                  className="w-full border-b border-stroke bg-transparent pb-3.5 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:focus:border-manatee dark:focus:placeholder:text-white lg:w-1/2"
                />

                <input
                  name="lastName"
                  type="text"
                  placeholder={t.auth.signup?.lastNamePlaceholder || "Last name"}
                  value={data.lastName}
                  onChange={(e) =>
                    setData({ ...data, [e.target.name]: e.target.value })
                  }
                  className="w-full border-b border-stroke bg-transparent pb-3.5 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:focus:border-manatee dark:focus:placeholder:text-white lg:w-1/2"
                />
              </div>

              <div className="mb-7.5 flex flex-col gap-7.5 lg:mb-12.5 lg:flex-row lg:justify-between lg:gap-14">
                <input
                  name="email"
                  type="email"
                  placeholder={t.auth.signup?.emailPlaceholder || "Email address"}
                  value={data.email}
                  onChange={(e) =>
                    setData({ ...data, [e.target.name]: e.target.value })
                  }
                  className="w-full border-b border-stroke bg-transparent pb-3.5 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:focus:border-manatee dark:focus:placeholder:text-white lg:w-1/2"
                />

                <div className="relative w-full lg:w-1/2">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.auth.signup?.passwordPlaceholder || "Password"}
                    value={data.password}
                    onChange={(e) =>
                      setData({ ...data, [e.target.name]: e.target.value })
                    }
                    className="w-full border-b border-stroke bg-transparent pb-3.5 pr-10 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:focus:border-manatee dark:focus:placeholder:text-white"
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

              <div className="flex flex-wrap gap-10 md:justify-between xl:gap-15">
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
                    className="flex max-w-[425px] cursor-pointer select-none  pl-3"
                  >
                    {t.auth.signup?.keepSignedIn}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  aria-label="signup with email and password"
                  className="inline-flex items-center gap-2.5 rounded-full bg-black px-6 py-3 font-medium text-white duration-300 ease-in-out hover:bg-blackho dark:bg-btndark dark:hover:bg-blackho disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création...' : (t.auth.signup?.submit || 'Créer un compte')}
                  {!loading && (
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
                  )}
                </button>
              </div>

              <div className="mt-12.5 border-t border-stroke py-5 text-center dark:border-strokedark">
                <p>
                  {t.auth.signup?.haveAccount}{" "}
                  <Link
                    className="text-black hover:text-primary dark:text-white dark:hover:text-primary"
                    href="/auth/signin"
                  >
                    {t.auth.signup?.signInLink}
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
      {/* <!-- ===== SignUp Form End ===== --> */}
    </>
  );
};

export default Signup;
