import SimpleSignin from "@/components/Auth/SimpleSignin";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Connexion - SikaSchool",
  description: "Connectez-vous à votre espace SikaSchool"
};

const SigninPage = () => {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Chargement...</div>}>
      <SimpleSignin />
    </Suspense>
  );
};

export default SigninPage;
