import Navbar from "./Navbar";
import Container from "./Container";

export default function DashboardLayout({ children }) {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Container>
          <div className="pt-6 pb-16">{children}</div>
        </Container>
      </main>
    </>
  );
}