import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
        <p className="spec-label">404</p>
        <h1 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
          This road doesn’t lead anywhere.
        </h1>
        <p className="mt-3 max-w-md text-ink-mute">
          The page you’re after may have moved — but the yard is very much open.
        </p>
        <Link to="/" className="btn-gold mt-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Motari Motors
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}
