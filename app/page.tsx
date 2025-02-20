import { Leaf, Recycle, Users, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AnimatedGlobe() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse" />
      <div className="absolute inset-2 rounded-full bg-green-400 opacity-40 animate-ping" />
      <div className="absolute inset-4 rounded-full bg-green-300 opacity-60 animate-spin" />
      <div className="absolute inset-6 rounded-full bg-green-200 opacity-80 animate-bounce" />
      <Recycle className="absolute inset-0 m-auto h-16 w-16 text-green-600 animate-pulse" />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col items-center text-center">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <Icon className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-sm md:text-xl font-semibold mb-2 md:mv-4 text-gray-800">
        {title}
      </h3>
      <p className="leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

function ImpactCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-md">
      <Icon className="h-10 w-10 text-green-500 mb-4" />
      <p className="text-xl md:text-3xl font-bold mb-2 text-gray-800">
        {value}
      </p>
      <p className="text-sm text-gray-600">{title}</p>{" "}
    </div>
  );
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-20">
        <AnimatedGlobe />
        <h1 className="text-3xl md:text-6xl font-bold mb-6 text-gray-800 tracking-tight">
          Eco Swachh <br />
          <span className="text-green-600">Empowering a Clean India</span>
        </h1>
        <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Transforming waste management with digital innovation for a cleaner,
          smarter, and sustainable India under the Swachh Bharat initiative.
        </p>
        <Link href="/report">
          <Button className="bg-green-600 hover:bg-green-700 transition-all text-sm md:text-lg py-4 md:py-6 px-7 md:px-10 rounded-full">
            Report Waste
          </Button>
        </Link>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mb-20">
        <FeatureCard
          icon={Leaf}
          title="Eco-Friendly"
          description="We are committed to reducing waste and promoting sustainability"
        />
        <FeatureCard
          icon={Coins}
          title="Earn Rewards"
          description="Get tokens for your contributions to waste management efforts"
        />
        <FeatureCard
          icon={Users}
          title="Community Driven"
          description="Be part of a growing community committed to sustainability practices"
        />
      </section>
    </div>
  );
}
