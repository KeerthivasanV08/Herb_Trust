import { Link } from "react-router-dom";
import { Leaf, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-botanical-pattern p-4">
      <div className="text-center max-w-md">
        <div className="p-4 rounded-2xl bg-primary/20 w-fit mx-auto mb-6 glow-green-sm">
          <Leaf className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-6xl font-bold text-gradient-primary mb-4">404</h1>
        <p className="text-xl text-foreground mb-2">Page Not Found</p>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button variant="outline" className="border-accent/30">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
          <Link to="/">
            <Button className="bg-gradient-primary glow-green">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
