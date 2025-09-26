import StudentLayout from "@/components/Student/StudentLayout";
import StudentProviders from "@/components/Student/StudentProviders";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentProviders>
      <StudentLayout>
        {children}
      </StudentLayout>
    </StudentProviders>
  );
}
