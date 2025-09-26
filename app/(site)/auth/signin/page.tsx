import SimpleSignin from "@/components/Auth/SimpleSignin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion - SikaSchool",
  description: "Connectez-vous à votre espace SikaSchool"
};

const SigninPage = () => {
  return (
    <>
      <SimpleSignin />
    </>
  );
};

export default SigninPage;
