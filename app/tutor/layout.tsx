import TutorLayout from "@/components/Tutor/TutorLayout";
import TutorProviders from "@/components/Tutor/TutorProviders";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TutorProviders>
      <TutorLayout>
        {children}
      </TutorLayout>
    </TutorProviders>
  );
}
