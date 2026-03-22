import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return (
    <div className="min-h-screen w-full p-4 flex justify-center bg-muted items-center overflow-x-hidden">
      <div className="max-w-sm mx-auto w-full space-y-6">
        <div className="w-full flex justify-center items-center">
          <Image
            src="/logo.svg"
            height={30}
            width={140}
            alt="eco swachh logo"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
