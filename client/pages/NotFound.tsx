import { Link } from "react-router-dom";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center px-4">
          <h1 className="heading-lg text-primary mb-4">404</h1>

          <h2 className="heading-sm text-foreground mb-4">
            Page Not Found
          </h2>

          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Link
            to="/"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all active:scale-95 text-base"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
