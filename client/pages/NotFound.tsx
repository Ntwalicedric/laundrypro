import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-background to-primary/5">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <p className="text-2xl font-bold mb-2">Page Not Found</p>
          <p className="text-muted-foreground mb-8">
            Sorry, the page you're looking for doesn't exist. Let's get you back
            on track.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
